from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.api.dependencies import get_current_user

from app.services.report_service import ReportService


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ==========================================
# Monthly PDF Report
# ==========================================

@router.get("/monthly/pdf")
def download_monthly_pdf(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    pdf = ReportService.generate_pdf(
        db=db,
        user_id=current_user["user_id"]
    )

    return StreamingResponse(
        pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=FinPilot_Report.pdf"
        }
    )