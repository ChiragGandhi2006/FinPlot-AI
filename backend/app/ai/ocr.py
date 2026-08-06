"""Receipt / document OCR.

Primary path: extract text from uploaded documents.
  - Image files: OCR via pytesseract + Pillow when installed; otherwise we
    return None so the UI can prompt for a text/CSV receipt.
  - Text/CSV/PDF: extract plainly.

Then parse the extracted text with heuristics into
{merchant, amount, date, category}.
"""
import io
import re

from app.ai.categories import infer_expense_category
from app.ai.statement import parse_amount, parse_date


def extract_text(filename, content):
    """Return raw text from an upload, or None if it can't be read."""
    name = (filename or "").lower()
    if name.endswith((".txt", ".text", ".csv")):
        return content.decode("utf-8", errors="replace")
    if name.endswith(".pdf"):
        return _pdf_text(content)
    if name.endswith((".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff")):
        return _ocr_image(content)
    return None


def _pdf_text(content):
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            return None
    try:
        reader = PdfReader(io.BytesIO(content))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        return None


def _ocr_image(content):
    try:
        from PIL import Image
        import pytesseract
    except ImportError:
        return None
    try:
        image = Image.open(io.BytesIO(content))
        return pytesseract.image_to_string(image)
    except Exception:
        return None


def parse_receipt(text):
    """Extract structured fields from receipt/statement text."""
    if not text:
        return None

    amounts = [float(a) for a in (parse_amount(m) for m in re.findall(r"₹?\s*([0-9][0-9,.]+)", text)) if a > 0]
    amount = max(amounts) if amounts else None

    txn_date = None
    for token in re.findall(r"\S+", text):
        parsed = parse_date(token)
        if parsed:
            txn_date = parsed
            break

    merchant = None
    for ln in text.splitlines():
        line = ln.strip()
        if len(line) < 2 or re.search(r"\d", line):
            continue
        merchant = line
        break

    return {
        "merchant": merchant,
        "amount": amount,
        "date": txn_date.isoformat() if txn_date else None,
        "category": infer_expense_category(merchant or ""),
    }