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


class Goal(Base):

    __tablename__ = "goals"

    goal_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    goal_name = Column(
        String(100),
        nullable=False
    )

    target_amount = Column(
        Float,
        nullable=False
    )

    saved_amount = Column(
        Float,
        default=0
    )

    target_date = Column(
        Date,
        nullable=False
    )

    status = Column(
        String(20),
        default="ACTIVE"
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