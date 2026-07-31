from pydantic import BaseModel
from typing import Optional


class IncomeCategoryCreate(BaseModel):

    category_name: str

    icon: Optional[str] = None

    color: Optional[str] = None


class IncomeCategoryResponse(BaseModel):

    category_id: int

    category_name: str

    icon: Optional[str]

    color: Optional[str]

    is_default: bool

    class Config:
        from_attributes = True