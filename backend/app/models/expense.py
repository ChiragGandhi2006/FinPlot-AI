from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey
)

from sqlalchemy.sql import func

from app.database.database import Base


class Expense(Base):

    __tablename__ = "expenses"

    expense_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("expense_categories.category_id"),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    merchant = Column(
        String(100),
        nullable=False
    )

    description = Column(
        String(255),
        nullable=True
    )

    payment_method = Column(
        String(50),
        nullable=False
    )

    expense_date = Column(
        Date,
        nullable=False
    )

    attachment = Column(
        String(255),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )