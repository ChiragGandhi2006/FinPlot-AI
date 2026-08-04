from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.income import Income
from app.models.expense import Expense


class DashboardRepository:

    @staticmethod
    def get_total_income(
        db: Session,
        user_id: int
    ):

        total = (
            db.query(
                func.sum(
                    Income.amount
                )
            )
            .filter(
                Income.user_id == user_id
            )
            .scalar()
        )

        return total or 0

    @staticmethod
    def get_total_expense(
        db: Session,
        user_id: int
    ):

        total = (
            db.query(
                func.sum(
                    Expense.amount
                )
            )
            .filter(
                Expense.user_id == user_id
            )
            .scalar()
        )

        return total or 0

    @staticmethod
    def get_total_transactions(
        db: Session,
        user_id: int
    ):

        income = (
            db.query(Income)
            .filter(
                Income.user_id == user_id
            )
            .count()
        )

        expense = (
            db.query(Expense)
            .filter(
                Expense.user_id == user_id
            )
            .count()
        )

        return income + expense