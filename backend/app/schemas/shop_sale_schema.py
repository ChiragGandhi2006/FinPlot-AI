from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class ShopSaleCreate(BaseModel):
    product_category: str = Field(min_length=1, max_length=80)
    product_name: str = Field(min_length=1, max_length=120)
    brand: Optional[str] = Field(default=None, max_length=80)
    quantity: int = Field(gt=0)
    unit_price: float = Field(ge=0)
    payment_method: str = Field(pattern="^(Cash|UPI)$")


class ShopSaleResponse(BaseModel):
    shop_sale_id: int
    sales_date: date
    product_category: str
    product_name: str
    brand: Optional[str]
    quantity: int
    unit_price: float
    payment_method: str
    created_at: datetime

    class Config:
        from_attributes = True
