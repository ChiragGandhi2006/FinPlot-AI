from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.expense_category import ExpenseCategory

from app.schemas.expense_category_schema import (
    ExpenseCategoryCreate
)

from app.repositories.expense_category_repository import (
    ExpenseCategoryRepository
)


class ExpenseCategoryService:

    @staticmethod
    def get_categories(
        db: Session
    ):
        return ExpenseCategoryRepository.get_all(db)

    @staticmethod
    def create_category(
        db: Session,
        data: ExpenseCategoryCreate
    ):

        existing = ExpenseCategoryRepository.get_by_name(
            db,
            data.category_name
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Category already exists."
            )

        category = ExpenseCategory(
            category_name=data.category_name,
            is_default=False
        )

        return ExpenseCategoryRepository.create(
            db,
            category
        )