from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.shop_sale import ShopSale
from app.schemas.shop_sale_schema import ShopSaleCreate


class ShopSaleService:
    @staticmethod
    def get_today(db: Session, user_id: int):
        return (
            db.query(ShopSale)
            .filter(ShopSale.user_id == user_id, ShopSale.sales_date == date.today())
            .order_by(ShopSale.created_at.desc())
            .all()
        )

    @staticmethod
    def create(db: Session, user_id: int, data: ShopSaleCreate):
        sale = ShopSale(user_id=user_id, sales_date=date.today(), **data.model_dump())
        db.add(sale)
        db.commit()
        db.refresh(sale)
        return sale

    @staticmethod
    def delete(db: Session, user_id: int, sale_id: int):
        sale = (
            db.query(ShopSale)
            .filter(ShopSale.shop_sale_id == sale_id, ShopSale.user_id == user_id)
            .first()
        )
        if sale is None:
            raise HTTPException(status_code=404, detail="Sale entry not found.")
        db.delete(sale)
        db.commit()
