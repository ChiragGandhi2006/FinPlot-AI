from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class DailyShopUpdate(BaseModel):
    sales_count: int = Field(ge=0)
    revenue: float = Field(ge=0)


class DailyShopResponse(BaseModel):
    sales_date: date
    sales_count: int
    revenue: float
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
