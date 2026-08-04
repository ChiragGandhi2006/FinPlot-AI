from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.expense_category_schema import (
    ExpenseCategoryCreate,
    ExpenseCategoryResponse
)

from app.services.expense_category_service import (
    ExpenseCategoryService
)

router = APIRouter(
    prefix="/expense-categories",
    tags=["Expense Categories"]
)


@router.get(
    "/",
    response_model=List[ExpenseCategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db)
):
    return ExpenseCategoryService.get_categories(db)


@router.post(
    "/",
    response_model=ExpenseCategoryResponse,
    status_code=201
)
def create_category(
    category: ExpenseCategoryCreate,
    db: Session = Depends(get_db)
):
    return ExpenseCategoryService.create_category(
        db,
        category
    )