from sqlalchemy.orm import Session

from app.models.income import Income
from app.models.expense import Expense
from app.models.goal import Goal


class ReportRepository:

    @staticmethod
    def get_income(
        db: Session,
        user_id: int
    ):

        return (
            db.query(Income)
            .filter(
                Income.user_id == user_id
            )
            .all()
        )

    @staticmethod
    def get_expense(
        db: Session,
        user_id: int
    ):

        return (
            db.query(Expense)
            .filter(
                Expense.user_id == user_id
            )
            .all()
        )

    @staticmethod
    def get_goals(
        db: Session,
        user_id: int
    ):

        return (
            db.query(Goal)
            .filter(
                Goal.user_id == user_id
            )
            .all()
        )