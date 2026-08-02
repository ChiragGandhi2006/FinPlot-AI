from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.income_category import IncomeCategory

from app.repositories.income_category_repository import (
    IncomeCategoryRepository
)

from app.schemas.income_category_schema import (
    IncomeCategoryCreate
)


class IncomeCategoryService:

    @staticmethod
    def get_categories(
        db: Session
    ):

        return IncomeCategoryRepository.get_all(db)

    @staticmethod
    def create_category(
        db: Session,
        data: IncomeCategoryCreate
    ):

        existing = IncomeCategoryRepository.get_by_name(
            db,
            data.category_name
        )

        if existing:

            raise HTTPException(
                status_code=400,
                detail="Category already exists."
            )

        category = IncomeCategory(
            category_name=data.category_name,
            is_default=False
        )

        return IncomeCategoryRepository.create(
            db,
            category
        )