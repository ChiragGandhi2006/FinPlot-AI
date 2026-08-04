from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.api.dependencies import get_current_user

from app.schemas.expense_schema import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse
)

from app.services.expense_service import (
    ExpenseService
)

router = APIRouter(
    prefix="/expense",
    tags=["Expense"]
)


@router.post(
    "/",
    response_model=ExpenseResponse,
    status_code=201
)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return ExpenseService.create_expense(
        db=db,
        user_id=current_user["user_id"],
        data=expense
    )


@router.get(
    "/",
    response_model=List[ExpenseResponse]
)
def get_all_expenses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return ExpenseService.get_all_expenses(
        db=db,
        user_id=current_user["user_id"]
    )


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return ExpenseService.get_expense(
        db=db,
        user_id=current_user["user_id"],
        expense_id=expense_id
    )


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def update_expense(
    expense_id: int,
    expense: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return ExpenseService.update_expense(
        db=db,
        user_id=current_user["user_id"],
        expense_id=expense_id,
        data=expense
    )


@router.delete(
    "/{expense_id}"
)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return ExpenseService.delete_expense(
        db=db,
        user_id=current_user["user_id"],
        expense_id=expense_id
    )