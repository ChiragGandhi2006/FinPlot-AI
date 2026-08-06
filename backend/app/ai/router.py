from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.ai import llm
from app.ai.context import build_context
from app.ai.engine import get_ai_response
from app.ai.ocr import extract_text, parse_receipt
from app.ai.schemas import ChatMessage, ForecastRequest
from app.ai.statement import analyze_transactions, parse_statement
from app.api.dependencies import get_current_user
from app.database.dependencies import get_db
from app.utils.response import success

router = APIRouter(prefix="/api/v1", tags=["AI"])


@router.post("/chat")
def chat(
    payload: ChatMessage,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    context = build_context(db, current_user["user_id"])
    # Prefer a real LLM when configured, else the grounded rule engine.
    reply = None
    if llm.llm_configured():
        reply = llm.llm_answer(payload.message, context, payload.history)
    if reply:
        return success({"reply": reply, "intent": "llm"})
    result = get_ai_response(payload.message, context)
    return success(result)


@router.post("/forecast")
def forecast(
    payload: ForecastRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.ai.forecast import forecast_monthly
    from app.models import Expense, Income

    incomes = db.query(Income).filter(Income.user_id == current_user["user_id"]).all()
    expenses = db.query(Expense).filter(Expense.user_id == current_user["user_id"]).all()
    inc = forecast_monthly(
        [{"income_date": i.income_date, "amount": i.amount} for i in incomes],
        "income_date",
        payload.months,
    )
    exp = forecast_monthly(
        [{"expense_date": e.expense_date, "amount": e.amount} for e in expenses],
        "expense_date",
        payload.months,
    )
    return success(
        {
            "months": payload.months,
            "income": inc,
            "expense": exp,
            "savings": [
                {
                    "month": inc[i]["month"],
                    "value": round(inc[i]["value"] - exp[i]["value"], 2),
                    "low": round(inc[i]["low"] - exp[i]["high"], 2),
                    "high": round(inc[i]["high"] - exp[i]["low"], 2),
                }
                for i in range(len(inc))
            ],
        }
    )


@router.post("/statement")
async def analyze_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    try:
        transactions = parse_statement(file.filename or "statement.csv", content)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=422, detail=f"Could not parse statement: {exc}") from exc
    analysis = analyze_transactions(transactions)
    return success({
        "filename": file.filename or "statement",
        "transactions": transactions[:200],
        "summary": analysis["summary"],
        "categories": analysis["categories"],
        "recurring": analysis["recurring"],
        "suggestions": analysis["suggestions"],
    })


@router.post("/receive")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    text = extract_text(file.filename or "receipt.txt", content)
    if not text or not text.strip():
        raise HTTPException(
            status_code=422,
            detail="No text could be read. For images, ensure OCR (pytesseract) is installed; "
                   "otherwise upload a text/CSV receipt.",
        )
    result = parse_receipt(text.strip())
    if not result:
        raise HTTPException(status_code=422, detail="No receipt fields recognised.")
    return success(result)