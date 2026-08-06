from io import BytesIO

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer
)

from sqlalchemy.orm import Session

from app.repositories.report_repository import (
    ReportRepository
)


class ReportService:

    @staticmethod
    def generate_pdf(
        db: Session,
        user_id: int
    ):

        income = ReportRepository.get_income(
            db,
            user_id
        )

        expense = ReportRepository.get_expense(
            db,
            user_id
        )

        goals = ReportRepository.get_goals(
            db,
            user_id
        )

        total_income = sum(
            i.amount for i in income
        )

        total_expense = sum(
            e.amount for e in expense
        )

        balance = total_income - total_expense

        buffer = BytesIO()

        doc = SimpleDocTemplate(buffer)

        styles = getSampleStyleSheet()

        story = []

        story.append(
            Paragraph(
                "<b>FinPilot AI Report</b>",
                styles["Title"]
            )
        )

        story.append(
            Spacer(1,20)
        )

        story.append(
            Paragraph(
                f"Total Income : ₹{total_income}",
                styles["BodyText"]
            )
        )

        story.append(
            Paragraph(
                f"Total Expense : ₹{total_expense}",
                styles["BodyText"]
            )
        )

        story.append(
            Paragraph(
                f"Balance : ₹{balance}",
                styles["BodyText"]
            )
        )

        story.append(
            Spacer(1,20)
        )

        story.append(
            Paragraph(
                "<b>Goals</b>",
                styles["Heading2"]
            )
        )

        for goal in goals:

            story.append(
                Paragraph(
                    f"{goal.goal_name} "
                    f"(Saved ₹{goal.saved_amount}/₹{goal.target_amount})",
                    styles["BodyText"]
                )
            )

        doc.build(story)

        buffer.seek(0)

        return buffer