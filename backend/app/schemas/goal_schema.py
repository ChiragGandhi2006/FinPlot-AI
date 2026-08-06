from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class GoalCreate(BaseModel):

    goal_name: str

    target_amount: float = Field(gt=0)

    target_date: date


class GoalUpdate(BaseModel):

    goal_name: Optional[str] = None

    target_amount: Optional[float] = Field(default=None, gt=0)

    saved_amount: Optional[float] = None

    target_date: Optional[date] = None

    status: Optional[str] = None


class GoalResponse(BaseModel):

    goal_id: int

    user_id: int

    goal_name: str

    target_amount: float

    saved_amount: float

    target_date: date

    status: str

    created_at: datetime

    class Config:
        from_attributes = True