from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.models.income import Income
from app.models.expense import Expense
from app.models.expense_category import ExpenseCategory


class DashboardRepository:

    # ==========================
    # Dashboard Summary
    # ==========================

    @staticmethod
    def get_total_income(db: Session, user_id: int):

        total = (
            db.query(func.sum(Income.amount))
            .filter(Income.user_id == user_id)
            .scalar()
        )

        return total or 0


    @staticmethod
    def get_total_expense(db: Session, user_id: int):

        total = (
            db.query(func.sum(Expense.amount))
            .filter(Expense.user_id == user_id)
            .scalar()
        )

        return total or 0


    @staticmethod
    def get_total_transactions(db: Session, user_id: int):

        income = (
            db.query(Income)
            .filter(Income.user_id == user_id)
            .count()
        )

        expense = (
            db.query(Expense)
            .filter(Expense.user_id == user_id)
            .count()
        )

        return income + expense


    # ==========================
    # Monthly Summary
    # ==========================

    @staticmethod
    def get_monthly_income(db: Session, user_id: int):

        return (
            db.query(
                extract("month", Income.income_date).label("month"),
                func.sum(Income.amount).label("income")
            )
            .filter(Income.user_id == user_id)
            .group_by(
                extract("month", Income.income_date)
            )
            .order_by(
                extract("month", Income.income_date)
            )
            .all()
        )


    @staticmethod
    def get_monthly_expense(db: Session, user_id: int):

        return (
            db.query(
                extract("month", Expense.expense_date).label("month"),
                func.sum(Expense.amount).label("expense")
            )
            .filter(Expense.user_id == user_id)
            .group_by(
                extract("month", Expense.expense_date)
            )
            .order_by(
                extract("month", Expense.expense_date)
            )
            .all()
        )


    # ==========================
    # Expense by Category
    # ==========================

    @staticmethod
    def get_expense_by_category(
        db: Session,
        user_id: int
    ):

        return (
            db.query(
                ExpenseCategory.category_name.label("category"),
                func.sum(Expense.amount).label("amount")
            )
            .join(
                Expense,
                Expense.category_id == ExpenseCategory.category_id
            )
            .filter(
                Expense.user_id == user_id
            )
            .group_by(
                ExpenseCategory.category_name
            )
            .order_by(
                func.sum(Expense.amount).desc()
            )
            .all()
        )