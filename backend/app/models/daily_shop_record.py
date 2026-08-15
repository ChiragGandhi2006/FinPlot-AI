from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.sql import func

from app.database.database import Base


class DailyShopRecord(Base):
    __tablename__ = "daily_shop_records"
    __table_args__ = (UniqueConstraint("user_id", "sales_date", name="uq_daily_shop_record_user_date"),)

    daily_shop_record_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    sales_date = Column(Date, nullable=False, index=True)
    sales_count = Column(Integer, nullable=False, default=0)
    revenue = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
