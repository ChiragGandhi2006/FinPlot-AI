from fastapi import FastAPI
from app.database.seed import seed_expense_categories
from app.api.dashboard import router as dashboard_router

from app.api.income import router as income_router
from app.database.database import SessionLocal
from app.database.seed import seed_income_categories
from app.api.expense import router as expense_router
from app.api.expense_category import (
    router as expense_category_router
)

from app.api.auth import router as auth_router
from app.database.database import Base, engine
from app.api.income_category import router as income_category_router
from app.models import *

app = FastAPI(
    title="FinPilot AI"
)

Base.metadata.create_all(bind=engine)
db = SessionLocal()

seed_income_categories(db)
seed_expense_categories(db)

db.close()
app.include_router(auth_router)
app.include_router(income_category_router)
app.include_router(income_router)
app.include_router(expense_category_router)
app.include_router(expense_router)
app.include_router(dashboard_router)
@app.get("/")
def home():
    return {
        "message": "Welcome to FinPilot AI"
    }