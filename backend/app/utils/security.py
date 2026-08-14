import base64
import os
from passlib.context import CryptContext
from cryptography.hazmat.primitives import ciphers, hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return kdf.derive(password.encode())


def encrypt_data(data: str, password: str) -> dict:
    salt = base64.urlsafe_b64encode(os.urandom(16)).decode()
    key = _derive_key(password, salt.encode())
    iv = base64.urlsafe_b64encode(os.urandom(12)).decode()
    cipher = ciphers.aes.gcm(key, iv.encode())
    ct = cipher.encrypt(data.encode())
    tag = base64.urlsafe_b64encode(cipher.tag).decode()
    return {
        "salt": salt,
        "iv": iv,
        "tag": tag,
        "ciphertext": base64.urlsafe_b64encode(ct).decode()
    }


def decrypt_data(encrypted: dict, password: str) -> str:
    salt = encrypted["salt"].encode()
    key = _derive_key(password, salt)
    iv = base64.urlsafe_b64decode(encrypted["iv"].encode())
    tag = base64.urlsafe_b64decode(encrypted["tag"].encode())
    ct = base64.urlsafe_b64decode(encrypted["ciphertext"].encode())
    cipher = ciphers.aes.gcm(key, iv, tag)
    pt = cipher.decrypt(ct)
    return pt.decode()