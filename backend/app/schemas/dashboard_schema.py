from pydantic import BaseModel
from datetime import date


class DashboardSummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    current_balance: float
    total_transactions: int


class MonthlySummaryItem(BaseModel):
    month: str
    income: float
    expense: float


class CategoryExpenseItem(BaseModel):
    category: str
    amount: float



class RecentTransactionItem(BaseModel):

    type: str

    title: str

    amount: float

    transaction_date: date