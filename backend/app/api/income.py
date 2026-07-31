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


class Income(Base):

    __tablename__ = "income"

    income_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    source = Column(
        String(150)
    )

    description = Column(
        String(255)
    )

    income_date = Column(
        Date,
        nullable=False
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