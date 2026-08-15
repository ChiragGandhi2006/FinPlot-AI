from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database.database import Base


class ShopSale(Base):
    __tablename__ = "shop_sales"

    shop_sale_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    sales_date = Column(Date, nullable=False, index=True)
    product_category = Column(String(80), nullable=False)
    product_name = Column(String(120), nullable=False)
    brand = Column(String(80), nullable=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    payment_method = Column(String(20), nullable=False, default="Cash")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
