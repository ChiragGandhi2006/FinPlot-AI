from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.schemas.shop_sale_schema import ShopSaleCreate, ShopSaleResponse
from app.services.shop_sale_service import ShopSaleService


router = APIRouter(prefix="/shop-sales", tags=["Shop Sales"])


@router.get("/today", response_model=List[ShopSaleResponse])
def get_today(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return ShopSaleService.get_today(db, current_user["user_id"])


@router.post("/", response_model=ShopSaleResponse, status_code=201)
def create_sale(
    data: ShopSaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return ShopSaleService.create(db, current_user["user_id"], data)


@router.delete("/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ShopSaleService.delete(db, current_user["user_id"], sale_id)
    return {"message": "Sale entry deleted."}
