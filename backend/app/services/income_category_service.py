from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.income_category import IncomeCategory
from app.schemas.income_category_schema import IncomeCategoryCreate
from app.repositories.income_category_repository import IncomeCategoryRepository


class IncomeCategoryService:

    @staticmethod
    def get_categories(db: Session):

        return IncomeCategoryRepository.get_all(db)

    @staticmethod
    def create_category(
        db: Session,
        data: IncomeCategoryCreate
    ):

        if IncomeCategoryRepository.get_by_name(
            db,
            data.category_name
        ):
            raise HTTPException(
                status_code=400,
                detail="Category already exists."
            )

        category = IncomeCategory(

            category_name=data.category_name,

            icon=data.icon,

            color=data.color,

            is_default=False
        )

        return IncomeCategoryRepository.create(
            db,
            category
        )