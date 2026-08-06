from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.goal import Goal

from app.schemas.goal_schema import (
    GoalCreate,
    GoalUpdate
)

from app.repositories.goal_repository import (
    GoalRepository
)


class GoalService:

    # ==========================================
    # Create Goal
    # ==========================================

    @staticmethod
    def create_goal(
        db: Session,
        user_id: int,
        data: GoalCreate
    ):

        goal = Goal(
            user_id=user_id,
            goal_name=data.goal_name,
            target_amount=data.target_amount,
            target_date=data.target_date
        )

        return GoalRepository.create(
            db,
            goal
        )

    # ==========================================
    # Get All Goals
    # ==========================================

    @staticmethod
    def get_all_goals(
        db: Session,
        user_id: int
    ):

        return GoalRepository.get_all_by_user(
            db,
            user_id
        )

    # ==========================================
    # Get Goal By ID
    # ==========================================

    @staticmethod
    def get_goal(
        db: Session,
        user_id: int,
        goal_id: int
    ):

        goal = GoalRepository.get_by_id_and_user(
            db,
            goal_id,
            user_id
        )

        if goal is None:

            raise HTTPException(
                status_code=404,
                detail="Goal not found."
            )

        return goal

    # ==========================================
    # Update Goal
    # ==========================================

    @staticmethod
    def update_goal(
        db: Session,
        user_id: int,
        goal_id: int,
        data: GoalUpdate
    ):

        goal = GoalRepository.get_by_id_and_user(
            db,
            goal_id,
            user_id
        )

        if goal is None:

            raise HTTPException(
                status_code=404,
                detail="Goal not found."
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        for key, value in update_data.items():

            setattr(goal, key, value)

        return GoalRepository.update(
            db,
            goal
        )

    # ==========================================
    # Delete Goal
    # ==========================================

    @staticmethod
    def delete_goal(
        db: Session,
        user_id: int,
        goal_id: int
    ):

        goal = GoalRepository.get_by_id_and_user(
            db,
            goal_id,
            user_id
        )

        if goal is None:

            raise HTTPException(
                status_code=404,
                detail="Goal not found."
            )

        GoalRepository.delete(
            db,
            goal
        )

        return {
            "message": "Goal deleted successfully."
        }

    # ==========================================
    # Goal Progress Analytics
    # ==========================================

    @staticmethod
    def get_goal_progress(
        db: Session,
        user_id: int,
        goal_id: int
    ):

        goal = GoalRepository.get_by_id_and_user(
            db,
            goal_id,
            user_id
        )

        if goal is None:

            raise HTTPException(
                status_code=404,
                detail="Goal not found."
            )

        remaining_amount = max(
            goal.target_amount - goal.saved_amount,
            0
        )

        progress_percentage = 0

        if goal.target_amount > 0:

            progress_percentage = (
                goal.saved_amount /
                goal.target_amount
            ) * 100

        return {

            "goal_name": goal.goal_name,

            "target_amount": goal.target_amount,

            "saved_amount": goal.saved_amount,

            "remaining_amount": remaining_amount,

            "progress_percentage": round(
                progress_percentage,
                2
            ),

            "status": goal.status

        }