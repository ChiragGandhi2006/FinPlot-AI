from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.database.seed import seed_expense_categories
from app.api.dashboard import router as dashboard_router
from app.api.goal import router as goal_router
from app.api.income import router as income_router
from app.api.sync import router as sync_router
from app.database.database import SessionLocal
from app.api.report import router as report_router
from app.core.logging import logger

logger.info("Testing logging module")
from app.database.seed import seed_income_categories
from app.api.expense import router as expense_router
from app.api.expense_category import (
    router as expense_category_router
)

from app.api.auth import router as auth_router
from app.database.database import Base, engine
from app.api.income_category import router as income_category_router
from app.ai.router import router as ai_router
from app.models import *

app = FastAPI(
    title="FinPilot AI"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(goal_router)
app.include_router(report_router)
app.include_router(ai_router)
app.include_router(sync_router)
logger.info("Testing logging module")


# ==========================================
# Global exception handlers -> consistent envelope
# ==========================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "data": None},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first = errors[0] if errors else {}
    field = ".".join(str(p) for p in first.get("loc", [])[1:])
    detail = first.get("msg", "Invalid request.")
    message = f"{field}: {detail}" if field else detail
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": message, "data": None},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled server error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An unexpected error occurred.", "data": None},
    )


@app.get("/")
def home():
    return {
        "message": "Welcome to FinPilot AI"
    }