from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.api.dependencies import get_current_user


from app.schemas.goal_schema import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    GoalProgressResponse
)

from app.services.goal_service import GoalService


router = APIRouter(
    prefix="/goals",
    tags=["Goals"]
)


# ==========================
# Create Goal
# ==========================

@router.post(
    "/",
    response_model=GoalResponse,
    status_code=201
)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return GoalService.create_goal(
        db=db,
        user_id=current_user["user_id"],
        data=goal
    )


# ==========================
# Get All Goals
# ==========================

@router.get(
    "/",
    response_model=List[GoalResponse]
)
def get_all_goals(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return GoalService.get_all_goals(
        db=db,
        user_id=current_user["user_id"]
    )


# ==========================
# Get Goal By ID
# ==========================

@router.get(
    "/{goal_id}",
    response_model=GoalResponse
)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return GoalService.get_goal(
        db=db,
        user_id=current_user["user_id"],
        goal_id=goal_id
    )


# ==========================
# Update Goal
# ==========================

@router.put(
    "/{goal_id}",
    response_model=GoalResponse
)
def update_goal(
    goal_id: int,
    goal: GoalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return GoalService.update_goal(
        db=db,
        user_id=current_user["user_id"],
        goal_id=goal_id,
        data=goal
    )


# ==========================
# Delete Goal
# ==========================

@router.delete(
    "/{goal_id}"
)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return GoalService.delete_goal(
        db=db,
        user_id=current_user["user_id"],
        goal_id=goal_id
    )

# ==========================================
# Goal Progress
# ==========================================

@router.get(
    "/progress/{goal_id}",
    response_model=GoalProgressResponse
)
def get_goal_progress(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return GoalService.get_goal_progress(
        db=db,
        user_id=current_user["user_id"],
        goal_id=goal_id
    )