from datetime import date

from sqlalchemy.orm import Session

from app.models.daily_shop_record import DailyShopRecord
from app.schemas.daily_shop_schema import DailyShopUpdate


class DailyShopService:
    @staticmethod
    def get_today(db: Session, user_id: int):
        today = date.today()
        record = (
            db.query(DailyShopRecord)
            .filter(DailyShopRecord.user_id == user_id, DailyShopRecord.sales_date == today)
            .first()
        )
        if record is not None:
            return record
        return {"sales_date": today, "sales_count": 0, "revenue": 0, "updated_at": None}

    @staticmethod
    def save_today(db: Session, user_id: int, data: DailyShopUpdate):
        today = date.today()
        record = (
            db.query(DailyShopRecord)
            .filter(DailyShopRecord.user_id == user_id, DailyShopRecord.sales_date == today)
            .first()
        )
        if record is None:
            record = DailyShopRecord(user_id=user_id, sales_date=today)
            db.add(record)

        record.sales_count = data.sales_count
        record.revenue = data.revenue
        db.commit()
        db.refresh(record)
        return record
