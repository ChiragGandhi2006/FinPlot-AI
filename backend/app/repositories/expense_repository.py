from sqlalchemy.orm import Session

from app.models.expense import Expense


class ExpenseRepository:

    @staticmethod
    def create(
        db: Session,
        expense: Expense
    ):
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def get_all_by_user(
        db: Session,
        user_id: int
    ):
        return (
            db.query(Expense)
            .filter(Expense.user_id == user_id)
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        expense_id: int
    ):
        return (
            db.query(Expense)
            .filter(Expense.expense_id == expense_id)
            .first()
        )

    @staticmethod
    def get_by_id_and_user(
        db: Session,
        expense_id: int,
        user_id: int
    ):
        return (
            db.query(Expense)
            .filter(
                Expense.expense_id == expense_id,
                Expense.user_id == user_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        expense: Expense
    ):
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def delete(
        db: Session,
        expense: Expense
    ):
        db.delete(expense)
        db.commit()