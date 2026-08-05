from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    MONTHS = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    }

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

        transactions = DashboardRepository.get_total_transactions(
            db,
            user_id
        )

        return {

            "total_income": float(income),

            "total_expense": float(expense),

            "current_balance": float(income - expense),

            "total_transactions": transactions

        }

    @staticmethod
    def get_monthly_summary(
        db: Session,
        user_id: int
    ):

        income_rows = DashboardRepository.get_monthly_income(
            db,
            user_id
        )

        expense_rows = DashboardRepository.get_monthly_expense(
            db,
            user_id
        )

        summary = {}

        for row in income_rows:

            month = int(row.month)

            summary[month] = {

                "month": DashboardService.MONTHS[month],

                "income": float(row.income),

                "expense": 0

            }

        for row in expense_rows:

            month = int(row.month)

            if month not in summary:

                summary[month] = {

                    "month": DashboardService.MONTHS[month],

                    "income": 0,

                    "expense": float(row.expense)

                }

            else:

                summary[month]["expense"] = float(row.expense)

        return [
            summary[m]
            for m in sorted(summary.keys())
        ]

    @staticmethod
    def get_category_summary(
        db: Session,
        user_id: int
    ):

        rows = DashboardRepository.get_expense_by_category(
            db,
            user_id
        )

        return [
            {
                "category": row.category,
                "amount": float(row.amount)
            }
            for row in rows
        ]