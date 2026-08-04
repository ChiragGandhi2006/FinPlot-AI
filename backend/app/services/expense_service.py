from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.expense import Expense

from app.schemas.expense_schema import (
    ExpenseCreate,
    ExpenseUpdate
)

from app.repositories.expense_repository import (
    ExpenseRepository
)

from app.repositories.expense_category_repository import (
    ExpenseCategoryRepository
)


class ExpenseService:

    @staticmethod
    def create_expense(
        db: Session,
        user_id: int,
        data: ExpenseCreate
    ):

        # Check if category exists
        category = ExpenseCategoryRepository.get_by_id(
            db,
            data.category_id
        )

        if category is None:
            raise HTTPException(
                status_code=404,
                detail="Expense category not found."
            )

        expense = Expense(
            user_id=user_id,
            category_id=data.category_id,
            amount=data.amount,
            merchant=data.merchant,
            description=data.description,
            payment_method=data.payment_method,
            expense_date=data.expense_date,
            attachment=data.attachment
        )

        return ExpenseRepository.create(
            db,
            expense
        )

    @staticmethod
    def get_all_expenses(
        db: Session,
        user_id: int
    ):

        return ExpenseRepository.get_all_by_user(
            db,
            user_id
        )

    @staticmethod
    def get_expense(
        db: Session,
        user_id: int,
        expense_id: int
    ):

        expense = ExpenseRepository.get_by_id_and_user(
            db,
            expense_id,
            user_id
        )

        if expense is None:
            raise HTTPException(
                status_code=404,
                detail="Expense not found."
            )

        return expense

    @staticmethod
    def update_expense(
        db: Session,
        user_id: int,
        expense_id: int,
        data: ExpenseUpdate
    ):

        expense = ExpenseRepository.get_by_id_and_user(
            db,
            expense_id,
            user_id
        )

        if expense is None:
            raise HTTPException(
                status_code=404,
                detail="Expense not found."
            )

        if data.category_id is not None:

            category = ExpenseCategoryRepository.get_by_id(
                db,
                data.category_id
            )

            if category is None:
                raise HTTPException(
                    status_code=404,
                    detail="Expense category not found."
                )

        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(expense, key, value)

        return ExpenseRepository.update(
            db,
            expense
        )

    @staticmethod
    def delete_expense(
        db: Session,
        user_id: int,
        expense_id: int
    ):

        expense = ExpenseRepository.get_by_id_and_user(
            db,
            expense_id,
            user_id
        )

        if expense is None:
            raise HTTPException(
                status_code=404,
                detail="Expense not found."
            )

        ExpenseRepository.delete(
            db,
            expense
        )

        return {
            "message": "Expense deleted successfully."
        }