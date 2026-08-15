from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.schemas.daily_shop_schema import DailyShopResponse, DailyShopUpdate
from app.services.daily_shop_service import DailyShopService


router = APIRouter(prefix="/shop-daily", tags=["Daily Shop"])


@router.get("/today", response_model=DailyShopResponse)
def get_today(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return DailyShopService.get_today(db, current_user["user_id"])


@router.put("/today", response_model=DailyShopResponse)
def save_today(
    data: DailyShopUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return DailyShopService.save_today(db, current_user["user_id"], data)
