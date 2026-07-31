from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.schemas.income_category_schema import (
    IncomeCategoryCreate,
    IncomeCategoryResponse
)

from app.services.income_category_service import (
    IncomeCategoryService
)

router = APIRouter(
    prefix="/income-categories",
    tags=["Income Categories"]
)


@router.get(
    "/",
    response_model=List[IncomeCategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db)
):

    return IncomeCategoryService.get_categories(db)


@router.post(
    "/",
    response_model=IncomeCategoryResponse
)
def create_category(
    category: IncomeCategoryCreate,
    db: Session = Depends(get_db)
):

    return IncomeCategoryService.create_category(
        db,
        category
    )