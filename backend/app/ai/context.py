"""Builds a plain-dict financial context for the AI assistant from the DB."""
from sqlalchemy.orm import Session

from app.models import Expense, Income, Goal
from app.models.expense_category import ExpenseCategory
from app.models.income_category import IncomeCategory


def _iso(value):
    return value.isoformat() if value else None


def build_context(db: Session, user_id: int) -> dict:
    incomes = db.query(Income).filter(Income.user_id == user_id).all()
    expenses = db.query(Expense).filter(Expense.user_id == user_id).all()
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    income_cats = db.query(IncomeCategory).all()
    expense_cats = db.query(ExpenseCategory).all()

    def income_cat(cid):
        return next((c.category_name for c in income_cats if c.category_id == cid), "Other")

    def expense_cat(cid):
        return next((c.category_name for c in expense_cats if c.category_id == cid), "Other")

    return {
        "user_id": user_id,
        "incomes": [
            {
                "income_id": i.income_id,
                "amount": float(i.amount),
                "source": i.source,
                "category": income_cat(i.category_id),
                "category_id": i.category_id,
                "income_date": _iso(i.income_date),
                "payment_method": i.payment_method,
            }
            for i in incomes
        ],
        "expenses": [
            {
                "expense_id": e.expense_id,
                "amount": float(e.amount),
                "merchant": e.merchant,
                "category": expense_cat(e.category_id),
                "category_id": e.category_id,
                "expense_date": _iso(e.expense_date),
                "payment_method": e.payment_method,
            }
            for e in expenses
        ],
        "goals": [
            {
                "goal_id": g.goal_id,
                "goal_name": g.goal_name,
                "target_amount": float(g.target_amount),
                "saved_amount": float(g.saved_amount or 0),
                "target_date": _iso(g.target_date),
                "status": g.status,
            }
            for g in goals
        ],
        "incomeCategories": [{"category_id": c.category_id, "category_name": c.category_name} for c in income_cats],
        "expenseCategories": [{"category_id": c.category_id, "category_name": c.category_name} for c in expense_cats],
    }


def _iso(value):
    return value.isoformat() if value else None