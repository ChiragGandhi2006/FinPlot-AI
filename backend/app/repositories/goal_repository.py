from sqlalchemy.orm import Session

from app.models.goal import Goal


class GoalRepository:

    @staticmethod
    def create(
        db: Session,
        goal: Goal
    ):

        db.add(goal)

        db.commit()

        db.refresh(goal)

        return goal

    @staticmethod
    def get_all_by_user(
        db: Session,
        user_id: int
    ):

        return (
            db.query(Goal)
            .filter(
                Goal.user_id == user_id
            )
            .all()
        )

    @staticmethod
    def get_goal_by_id(
    db: Session,
    goal_id: int,
    user_id: int
):

     return (
        db.query(Goal)
        .filter(
            Goal.goal_id == goal_id,
            Goal.user_id == user_id
        )
        .first()
    )

    @staticmethod
    def get_by_id_and_user(
        db: Session,
        goal_id: int,
        user_id: int
    ):

        return (
            db.query(Goal)
            .filter(
                Goal.goal_id == goal_id,
                Goal.user_id == user_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        goal: Goal
    ):

        db.commit()

        db.refresh(goal)

        return goal

    @staticmethod
    def delete(
        db: Session,
        goal: Goal
    ):

        db.delete(goal)

        db.commit()