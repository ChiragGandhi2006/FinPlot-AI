from sqlalchemy.orm import Session

from app.models.income_category import IncomeCategory


class IncomeCategoryRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(IncomeCategory).all()

    @staticmethod
    def get_by_name(
        db: Session,
        category_name: str
    ):
        return (
            db.query(IncomeCategory)
            .filter(
                IncomeCategory.category_name == category_name
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        category: IncomeCategory
    ):

        db.add(category)

        db.commit()

        db.refresh(category)

        return category