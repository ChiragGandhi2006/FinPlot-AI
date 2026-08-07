## Only Perform Database Operations and how do i talik to database
from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:

    @staticmethod
    def get_by_email(db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_username(db: Session, username: str):
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_by_phone(db: Session, phone: str):
        return db.query(User).filter(User.phone == phone).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int):
        return db.query(User).filter(User.user_id == user_id).first()

    @staticmethod
    def create_user(db: Session, user: User):

        db.add(user)

        db.commit()

        db.refresh(user)

        return user