from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user

from app.database.dependencies import get_db
from app.schemas.user_schema import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token
)
from app.services.user_service import UserService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return UserService.register_user(db, user)


@router.post(
    "/login",
    response_model=Token
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    return UserService.login_user(db, user)

@router.get("/me")
def current_user(

    user = Depends(get_current_user)

):

    return user