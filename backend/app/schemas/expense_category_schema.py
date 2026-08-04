from datetime import datetime

from pydantic import BaseModel


class ExpenseCategoryCreate(BaseModel):
    category_name: str


class ExpenseCategoryResponse(BaseModel):

    category_id: int

    category_name: str

    is_default: bool

    created_at: datetime

    class Config:
        from_attributes = True