from sqlalchemy.orm import Session

from app.models.expense_category import ExpenseCategory


class ExpenseCategoryRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(ExpenseCategory).all()

    @staticmethod
    def get_by_name(
        db: Session,
        category_name: str
    ):
        return (
            db.query(ExpenseCategory)
            .filter(
                ExpenseCategory.category_name == category_name
            )
            .first()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        category_id: int
    ):
        return (
            db.query(ExpenseCategory)
            .filter(
                ExpenseCategory.category_id == category_id
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        category: ExpenseCategory
    ):
        db.add(category)
        db.commit()
        db.refresh(category)
        return category