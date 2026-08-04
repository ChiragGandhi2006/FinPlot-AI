from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import (
    DashboardRepository
)


class DashboardService:

    @staticmethod
    def get_summary(
        db: Session,
        user_id: int
    ):

        income = DashboardRepository.get_total_income(
            db,
            user_id
        )

        expense = DashboardRepository.get_total_expense(
            db,
            user_id
        )

        transactions = (
            DashboardRepository.get_total_transactions(
                db,
                user_id
            )
        )

        return {

            "total_income": income,

            "total_expense": expense,

            "current_balance": income - expense,

            "total_transactions": transactions

        }