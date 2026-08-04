from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.api.dependencies import get_current_user

from app.schemas.dashboard_schema import (
    DashboardSummaryResponse
)

from app.services.dashboard_service import (
    DashboardService
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return DashboardService.get_summary(
        db=db,
        user_id=current_user["user_id"]
    )