# ervice = "What rules should the application follow?"

# For example, during registration we have rules like:

# Email must be unique.
# Username must be unique.
# Password should never be stored as plain text.
# Create the user only if all validations pass.


from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import UserCreate
from app.repositories.user_repository import UserRepository
from app.utils.security import hash_password


class UserService:

    @staticmethod
    def register_user(db: Session, user_data: UserCreate):

        # Check if email already exists
        if UserRepository.get_by_email(db, user_data.email):
            raise HTTPException(
                status_code=400,
                detail="Email already registered."
            )

        # Check if username already exists
        if UserRepository.get_by_username(db, user_data.username):
            raise HTTPException(
                status_code=400,
                detail="Username already exists."
            )

        # Create User object
        user = User(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            username=user_data.username,
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            phone=user_data.phone
        )

        return UserRepository.create_user(db, user)