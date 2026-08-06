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

    @staticmethod
    def get_all_goals(
        db: Session,
        user_id: int
    ):

        return GoalRepository.get_all_by_user(
            db,
            user_id
        )

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
            "message":"Goal deleted successfully."
        }