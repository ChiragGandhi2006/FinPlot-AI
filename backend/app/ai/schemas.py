from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    reply: str
    intent: str


class ForecastRequest(BaseModel):
    months: int = Field(default=3, ge=1, le=12)


class TransactionRecord(BaseModel):
    date: Optional[str] = None
    merchant: Optional[str] = None
    amount: float = 0.0
    type: str = "debit"
    category: Optional[str] = None


class StatementSummary(BaseModel):
    debit_total: float = 0.0
    credit_total: float = 0.0
    net: float = 0.0
    transaction_count: int = 0


class StatementResponse(BaseModel):
    filename: str
    transactions: List[TransactionRecord] = []
    summary: StatementSummary
    categories: List[List] = []
    recurring: List[List] = []
    suggestions: List[str] = []


class ReceiptResponse(BaseModel):
    merchant: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None
    category: Optional[str] = None
