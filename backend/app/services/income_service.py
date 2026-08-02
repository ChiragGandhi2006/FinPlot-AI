from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.income import Income

from app.schemas.income_schema import (
    IncomeCreate,
    IncomeUpdate
)

from app.repositories.income_repository import (
    IncomeRepository
)

from app.repositories.income_category_repository import (
    IncomeCategoryRepository
)


class IncomeService:

    @staticmethod
    def create_income(
        db: Session,
        user_id: int,
        data: IncomeCreate
    ):

        category = IncomeCategoryRepository.get_by_id(
            db,
            data.category_id
        )

        if category is None:

            raise HTTPException(
                status_code=404,
                detail="Category not found."
            )

        income = Income(

            user_id=user_id,

            category_id=data.category_id,

            amount=data.amount,

            source=data.source,

            description=data.description,

            payment_method=data.payment_method,

            income_date=data.income_date,

            attachment=data.attachment
        )

        return IncomeRepository.create(
            db,
            income
        )

    @staticmethod
    def get_all_income(
        db: Session,
        user_id: int
    ):

        return IncomeRepository.get_all_by_user(
            db,
            user_id
        )
