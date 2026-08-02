from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class IncomeCreate(BaseModel):

    category_id: int

    amount: float = Field(gt=0)

    source: str

    description: Optional[str] = None

    payment_method: str

    income_date: date

    attachment: Optional[str] = None


class IncomeUpdate(BaseModel):

    category_id: Optional[int] = None

    amount: Optional[float] = Field(default=None, gt=0)

    source: Optional[str] = None

    description: Optional[str] = None

    payment_method: Optional[str] = None

    income_date: Optional[date] = None

    attachment: Optional[str] = None


class IncomeResponse(BaseModel):

    income_id: int

    user_id: int

    category_id: int

    amount: float

    source: str

    description: Optional[str]

    payment_method: str

    income_date: date

    attachment: Optional[str]

    created_at: datetime

    class Config:
        from_attributes = True