from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.api.dependencies import get_current_user

from app.schemas.income_schema import (
    IncomeCreate,
    IncomeUpdate,
    IncomeResponse
)

from app.services.income_service import IncomeService


router = APIRouter(
    prefix="/income",
    tags=["Income"]
)


# ==========================
# Create Income
# ==========================
@router.post(
    "/",
    response_model=IncomeResponse,
    status_code=201
)
def create_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return IncomeService.create_income(
        db=db,
        user_id=current_user["user_id"],
        data=income
    )


# ==========================
# Get All Income
# ==========================
@router.get(
    "/",
    response_model=List[IncomeResponse]
)
def get_all_income(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return IncomeService.get_all_income(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================
# Get Single Income
# ==========================
@router.get(
    "/{income_id}",
    response_model=IncomeResponse
)
def get_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return IncomeService.get_income(
        db=db,
        user_id=current_user["user_id"],
        income_id=income_id
    )


# ==========================
# Update Income
# ==========================
@router.put(
    "/{income_id}",
    response_model=IncomeResponse
)
def update_income(
    income_id: int,
    income: IncomeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return IncomeService.update_income(
        db=db,
        user_id=current_user["user_id"],
        income_id=income_id,
        data=income
    )


# ==========================
# Delete Income
# ==========================
@router.delete(
    "/{income_id}"
)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return IncomeService.delete_income(
        db=db,
        user_id=current_user["user_id"],
        income_id=income_id
    )