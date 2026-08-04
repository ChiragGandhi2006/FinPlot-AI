from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):

    category_id: int

    amount: float = Field(gt=0)

    merchant: str

    description: Optional[str] = None

    payment_method: str

    expense_date: date

    attachment: Optional[str] = None


class ExpenseUpdate(BaseModel):

    category_id: Optional[int] = None

    amount: Optional[float] = Field(default=None, gt=0)

    merchant: Optional[str] = None

    description: Optional[str] = None

    payment_method: Optional[str] = None

    expense_date: Optional[date] = None

    attachment: Optional[str] = None


class ExpenseResponse(BaseModel):

    expense_id: int

    user_id: int

    category_id: int

    amount: float

    merchant: str

    description: Optional[str]

    payment_method: str

    expense_date: date

    attachment: Optional[str]

    created_at: datetime

    class Config:
        from_attributes = True