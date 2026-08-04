from sqlalchemy.orm import Session

from app.models.income import Income


class IncomeRepository:

    @staticmethod
    def create(
        db: Session,
        income: Income
    ):
        db.add(income)
        db.commit()
        db.refresh(income)
        return income

    @staticmethod
    def get_all_by_user(
        db: Session,
        user_id: int
    ):
        return (
            db.query(Income)
            .filter(Income.user_id == user_id)
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        income_id: int
    ):
        return (
            db.query(Income)
            .filter(Income.income_id == income_id)
            .first()
        )

    @staticmethod
    def get_by_id_and_user(
        db: Session,
        income_id: int,
        user_id: int
    ):
        return (
            db.query(Income)
            .filter(
                Income.income_id == income_id,
                Income.user_id == user_id
            )
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        income: Income
    ):
        db.commit()
        db.refresh(income)
        return income

    @staticmethod
    def delete(
        db: Session,
        income: Income
    ):
        db.delete(income)
        db.commit()