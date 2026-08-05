from pydantic import BaseModel


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