from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.api.dependencies import get_current_user

from app.schemas.dashboard_schema import (
    DashboardSummaryResponse,
    MonthlySummaryItem,
    CategoryExpenseItem
)

from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse
)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return DashboardService.get_summary(
        db,
        current_user["user_id"]
    )


@router.get(
    "/monthly-summary",
    response_model=List[MonthlySummaryItem]
)
def monthly_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return DashboardService.get_monthly_summary(
        db,
        current_user["user_id"]
    )


@router.get(
    "/category-expense",
    response_model=List[CategoryExpenseItem]
)
def category_expense(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return DashboardService.get_category_summary(
        db,
        current_user["user_id"]
    )