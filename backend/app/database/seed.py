from sqlalchemy.orm import Session

from app.models.income_category import IncomeCategory


DEFAULT_INCOME_CATEGORIES = [

    "Salary",

    "Business",

    "Freelancing",

    "Investment",

    "Rental Income",

    "Interest",

    "Bonus",

    "Gift",

    "Other"
]


def seed_income_categories(db: Session):

    existing = db.query(IncomeCategory).count()

    if existing > 0:
        return

    for category in DEFAULT_INCOME_CATEGORIES:

        db.add(
            IncomeCategory(
                category_name=category,
                is_default=True
            )
        )

    db.commit()

    print("✅ Default Income Categories Inserted")