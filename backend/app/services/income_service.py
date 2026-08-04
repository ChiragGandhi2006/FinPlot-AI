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

        # Check if category exists
        category = IncomeCategoryRepository.get_by_id(
            db,
            data.category_id
        )

        if category is None:
            raise HTTPException(
                status_code=404,
                detail="Category not found."
            )

        # Create Income object
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

    @staticmethod
    def get_income(
        db: Session,
        user_id: int,
        income_id: int
    ):

        income = IncomeRepository.get_by_id_and_user(
            db,
            income_id,
            user_id
        )

        if income is None:
            raise HTTPException(
                status_code=404,
                detail="Income not found."
            )

        return income

    @staticmethod
    def update_income(
        db: Session,
        user_id: int,
        income_id: int,
        data: IncomeUpdate
    ):

        income = IncomeRepository.get_by_id_and_user(
            db,
            income_id,
            user_id
        )

        if income is None:
            raise HTTPException(
                status_code=404,
                detail="Income not found."
            )

        # If category is being updated, verify it exists
        if data.category_id is not None:

            category = IncomeCategoryRepository.get_by_id(
                db,
                data.category_id
            )

            if category is None:
                raise HTTPException(
                    status_code=404,
                    detail="Category not found."
                )

        # Update only provided fields
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(income, key, value)

        return IncomeRepository.update(
            db,
            income
        )

    @staticmethod
    def delete_income(
        db: Session,
        user_id: int,
        income_id: int
    ):

        income = IncomeRepository.get_by_id_and_user(
            db,
            income_id,
            user_id
        )

        if income is None:
            raise HTTPException(
                status_code=404,
                detail="Income not found."
            )

        IncomeRepository.delete(
            db,
            income
        )

        return {
            "message": "Income deleted successfully."
        }