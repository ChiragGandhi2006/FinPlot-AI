from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ==========================================
# Register Request Schema
# ==========================================
class UserCreate(BaseModel):

    first_name: str
    last_name: str

    username: str

    email: EmailStr

    password: str

    phone: Optional[str] = None


# ==========================================
# Login Request Schema
# ==========================================
class UserLogin(BaseModel):

    email: EmailStr

    password: str


# ==========================================
# JWT Token Response Schema
# ==========================================
class Token(BaseModel):

    access_token: str

    token_type: str


# ==========================================
# User Response Schema
# ==========================================
class UserResponse(BaseModel):

    user_id: int

    first_name: str
    last_name: str

    username: str

    email: EmailStr

    phone: Optional[str]

    profile_picture: Optional[str]

    role: str

    email_verified: bool

    is_active: bool

    created_at: datetime

    class Config:
        from_attributes = True