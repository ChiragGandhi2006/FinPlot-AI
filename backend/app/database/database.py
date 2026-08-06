from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# ==========================================
# Database URL
# ==========================================

DATABASE_URL = settings.DATABASE_URL


# ==========================================
# SQLAlchemy Engine
# ==========================================

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


# ==========================================
# Session Factory
# ==========================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ==========================================
# Base Class for Models
# ==========================================

Base = declarative_base()