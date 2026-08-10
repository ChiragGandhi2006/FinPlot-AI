"""Bank statement parsing and analysis.

Primary format: CSV (auto-detects columns). Also supports plain text and
PDF (if pypdf/PyPDF2 is installed). Produces normalized transactions plus
a summary and actionable, personalised suggestions.
"""

import codecs
import csv
import io
import re
from datetime import date, datetime

from app.ai.categories import infer_expense_category

DATE_FORMATS = [
    "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%d/%m/%y", "%d-%m-%y",
    "%d-%b-%Y", "%d-%b-%y", "%d %b %Y", "%d %B %Y", "%d %b %y",
    "%b %d, %Y", "%B %d, %Y", "%b %d, %y",
    "%Y-%m-%d",
    "%m/%d/%Y", "%m-%d-%Y", "%m/%d/%y", "%m-%d-%y",
]


def parse_date(value):
    """Parse a date cell, tolerating trailing time/junk components."""
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    candidates = [text]
    if len(text) > 11:
        candidates += [text[:11], text[:10]]
    first_token = text.split()[0]
    if first_token != text and len(first_token) <= 11:
        candidates.append(first_token)
    for cand in candidates:
        for fmt in DATE_FORMATS:
            try:
                dt = datetime.strptime(cand, fmt)
                return date(dt.year, dt.month, dt.day)
            except (ValueError, TypeError):
                continue
    return None


def parse_amount(value):
    """Parse an amount cell, preserving its sign.

    Returns the signed value: negative for debits written as negative
    numbers or in parentheses (e.g. ``-450`` or ``(450)``).
    """
    if value is None:
        return 0.0
    text = str(value).strip()
    if text in ("", "-"):
        return 0.0
    sign = -1.0
    if text.startswith("(") and text.endswith(")"):
        text = text[1:-1]
    elif text.startswith("-"):
        text = text[1:]
    else:
        sign = 1.0
    cleaned = text.replace(",", "").replace("₹", "").replace("Rs.", "").replace("Rs ", "").strip()
    try:
        return sign * float(cleaned)
    except ValueError:
        return 0.0


HEADER_SYNONYMS = {
    "date": ["date", "txn", "value date", "posting date", "dtar", "trans date", "transdate"],
    "narration": ["narration", "details", "description", "merchant", "particulars",
                  "remarks", "memo", "transaction", "transaction detail"],
    "debit": ["debit", "withdrawal", "withdrawl", "paid amount", "amount dr", "dr amount"],
    "credit": ["credit", "deposit", "amount cr", "cr amount", "deposits"],
    "balance": ["balance", "closing balance", "running balance", "avail bal"],
    "type": ["dr/cr", "dr or cr", "dr cr", "type", "txn type", "tran type",
             "transaction type", "debit/credit", "credit/debit", "debit credit"],
    "amount": ["amount", "amt", "transaction amount", "txn amount", "value"],
}


def _norm(value):
    return (value or "").strip().lower().replace("_", " ").replace("-", " ")


def _match(norm, targets):
    return any(t in norm for t in targets)


def _resolve_columns(headers):
    mapping = {
        "date": None, "narration": None, "debit": None, "credit": None,
        "balance": None, "type": None, "amount": None,
    }
    if not headers:
        return mapping
    for idx, header in enumerate(headers):
        norm = _norm(header)
        for key, targets in HEADER_SYNONYMS.items():
            if mapping[key] is None and _match(norm, targets):
                mapping[key] = idx
    if mapping["debit"] is not None and mapping["debit"] == mapping["amount"]:
        mapping["amount"] = None
    if mapping["credit"] is not None and mapping["credit"] == mapping["amount"]:
        mapping["amount"] = None
    return mapping


def _cell(row, idx):
    if idx is None or idx >= len(row):
        return None
    value = str(row[idx]).strip()
    return value or None


def _looks_like_data_row(row):
    return any(parse_date(cell) for cell in row)


def _decode_bytes(content):
    """Decode statement bytes, honouring common encodings (UTF-8 BOM / UTF-16)."""
    try:
        if content.startswith(codecs.BOM_UTF16_LE) or content.startswith(codecs.BOM_UTF16_BE):
            return content.decode("utf-16", errors="replace")
        if content.startswith(codecs.BOM_UTF32_LE) or content.startswith(codecs.BOM_UTF32_BE):
            return content.decode("utf-32", errors="replace")
    except (UnicodeDecodeError, LookupError):
        pass
    return content.decode("utf-8-sig", errors="replace")


def parse_csv_statement(content):
    reader = csv.reader(io.StringIO(_decode_bytes(content)))
    raw = [r for r in reader if any(str(c).strip() for c in r)]
    if not raw:
        return []

    first_row = raw[0]
    starting_cells = [str(c).strip() for c in first_row if str(c).strip()]
    has_header = False
    if starting_cells:
        # A header row mentions a "date" column, or contains no date-like cells.
        if any(_match(_norm(h), HEADER_SYNONYMS["date"]) for h in starting_cells):
            has_header = True
        elif not _looks_like_data_row(first_row):
            has_header = True

    headers = starting_cells if has_header else None
    col = _resolve_columns(headers)
    data_rows = raw[1:] if has_header else raw

    transactions = []
    for row in data_rows:
        txn = _build_transaction(row, col)
        if txn:
            transactions.append(txn)
    return transactions


def _build_transaction(row, col):
    date_val = _cell(row, col["date"])
    if date_val is None:
        return None
    txn_date = parse_date(date_val)
    if txn_date is None:
        return None

    narration_val = _cell(row, col["narration"])
    if narration_val is None:
        narration_col = next(
            (i for i in range(len(row)) if i not in
             (col["date"], col["debit"], col["credit"], col["balance"], col["type"], col["amount"])),
            None,
        )
        narration_val = _cell(row, narration_col) or "Transaction"

    debit = parse_amount(_cell(row, col["debit"]))
    credit = parse_amount(_cell(row, col["credit"]))
    type_token = (_cell(row, col["type"]) or "").strip().lower()

    if col["debit"] is not None or col["credit"] is not None:
        if debit > 0 and credit == 0:
            amount, txn_type = debit, "debit"
        elif credit > 0 and debit == 0:
            amount, txn_type = credit, "credit"
        elif debit < 0 and credit == 0:
            amount, txn_type = abs(debit), "credit"
        elif credit < 0 and debit == 0:
            amount, txn_type = abs(credit), "debit"
        else:
            return None
    elif type_token:
        amount_raw = _cell(row, col["amount"]) if col["amount"] is not None else _find_amount_cell(row, col)
        amount = parse_amount(amount_raw)
        if amount <= 0:
            return None
        txn_type = "debit" if type_token.startswith(("d", "w", "-", "(")) else "credit"
    elif col["amount"] is not None:
        amount = parse_amount(_cell(row, col["amount"]))
        if amount == 0:
            return None
        txn_type = "debit" if amount < 0 else "credit"
        amount = abs(amount)
    else:
        amount = _find_amount_cell(row, col)
        if amount is None:
            return None
        txn_type = "debit" if amount < 0 else "credit"
        amount = abs(amount)

    narration = (narration_val or "Transaction")
    if len(narration) > 80:
        narration = narration[:80]

    return {
        "date": txn_date.isoformat(),
        "merchant": narration.strip(),
        "amount": float(amount),
        "type": txn_type,
        "category": infer_expense_category(narration),
    }


def _find_amount_cell(row, col):
    """Fallback: pick the signed amount from the remaining non-meta cells."""
    used = {col["date"], col["narration"], col["debit"], col["credit"],
            col["balance"], col["type"], col["amount"]}
    values = [(i, parse_amount(c)) for i, c in enumerate(row) if i not in used and parse_amount(c) != 0]
    if not values:
        return None
    return values[-1][1]


def parse_text_statement(text):
    transactions = []
    numeric_token = re.compile(r"^-?[0-9][0-9,]*(\.[0-9]{1,2})?$")
    for line in (text or "").splitlines():
        tokens = line.split()
        if not tokens:
            continue
        date_idx = next((i for i, t in enumerate(tokens) if parse_date(t)), None)
        if date_idx is None:
            continue
        txn_date = parse_date(tokens[date_idx])
        rest = [t for i, t in enumerate(tokens) if i != date_idx]
        numeric = [parse_amount(t) for t in rest if numeric_token.match(t)]
        real = [a for a in numeric if a != 0]
        if not real:
            continue
        amount = real[-1]
        merchant_words = [t.strip(",") for t in rest if not numeric_token.match(t)]
        merchant = " ".join(merchant_words).strip() or "Statement txn"
        type_hint = next((t.upper() for t in rest if t.upper() in ("DR", "DEBIT", "DBT", "CR", "CREDIT", "CDT")), "")
        if type_hint in ("CR", "CREDIT", "CDT"):
            txn_type = "credit"
        elif type_hint:
            txn_type = "debit"
        else:
            txn_type = "debit" if amount < 0 else "credit"
        transactions.append({
            "date": txn_date.isoformat(),
            "merchant": merchant,
            "amount": abs(amount),
            "type": txn_type,
            "category": infer_expense_category(merchant),
        })
    return transactions


class StatementParseError(Exception):
    """Raised when a statement file cannot be parsed, with a user-facing message."""


def parse_statement(filename, content, pdf_password=None):
    name = (filename or "").lower()
    if name.endswith(".csv"):
        return parse_csv_statement(content)
    if name.endswith((".txt", ".text")):
        return parse_text_statement(_decode_bytes(content))
    if name.endswith(".pdf"):
        text, err = _read_pdf(content, pdf_password)
        if err:
            raise StatementParseError(err)
        if text and text.strip():
            return parse_text_statement(text)
        ocr_text = _ocr_pdf(content)
        if ocr_text and ocr_text.strip():
            return parse_text_statement(ocr_text)
        raise StatementParseError(
            "No text could be read from this PDF. If it is password-protected, "
            "enter the statement password. If it is a scanned image and OCR is "
            "not available, export the statement as CSV instead."
        )
    # Unknown extension: try CSV then text
    try:
        txns = parse_csv_statement(content)
        if txns:
            return txns
    except Exception:
        pass
    return parse_text_statement(_decode_bytes(content))


def _pdf_reader(content):
    try:
        from pypdf import PdfReader
        return PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
            return PdfReader
        except ImportError:
            return None


def _read_pdf(content, pdf_password=None):
    """Extract text from a PDF. Returns (text, error_message)."""
    Reader = _pdf_reader(content)
    if Reader is None:
        return None, "PDF support is not installed. Install pypdf and try again."
    try:
        reader = Reader(io.BytesIO(content))
    except Exception:
        return None, "Could not open the PDF. The file may be corrupted."
    if reader.is_encrypted:
        if not pdf_password:
            return None, "This PDF is password-protected. Enter the statement password to unlock it."
        try:
            if reader.decrypt(pdf_password) == 0:
                return None, "Incorrect PDF password. Please re-check the statement password and try again."
        except Exception:
            return None, "Could not unlock the PDF with the given password."
    try:
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception:
        text = ""
    return text, None


def _ocr_pdf(content):
    """Best-effort OCR for scanned (image-only) PDFs using embedded page images."""
    Reader = _pdf_reader(content)
    if Reader is None:
        return ""
    try:
        from io import BytesIO
        from PIL import Image
        import pytesseract
    except ImportError:
        return ""
    try:
        reader = Reader(io.BytesIO(content))
        chunks = []
        for page in reader.pages:
            if getattr(page, "images", None):
                for img in page.images:
                    data = getattr(img, "data", None)
                    if not data:
                        continue
                    image = Image.open(BytesIO(data))
                    chunks.append(pytesseract.image_to_string(image))
        return "\n".join(chunks)
    except Exception:
        return ""


def analyze_transactions(transactions):
    if not transactions:
        return {
            "summary": {"debit_total": 0, "credit_total": 0, "net": 0, "transaction_count": 0},
            "categories": [],
            "recurring": [],
            "suggestions": ["No transactions were parsed. Try a CSV bank statement."],
        }

    debit_total = sum(t["amount"] for t in transactions if t["type"] == "debit")
    credit_total = sum(t["amount"] for t in transactions if t["type"] == "credit")
    net = credit_total - debit_total

    cat_spend = {}
    for t in transactions:
        if t["type"] != "debit":
            continue
        cat = t.get("category") or "Other"
        cat_spend[cat] = cat_spend.get(cat, 0) + t["amount"]
    top_categories = sorted(cat_spend.items(), key=lambda kv: kv[1], reverse=True)

    counts = {}
    for t in transactions:
        if t["type"] == "debit" and t["merchant"]:
            key = t["merchant"].lower()
            counts[key] = counts.get(key, 0) + 1
    recurring = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)

    suggestions = []
    if debit_total > 0 and top_categories:
        top_name, top_amt = top_categories[0]
        pct = top_amt / debit_total * 100
        suggestions.append(
            f"{top_name} is your largest spend at ₹{top_amt:,.0f} "
            f"({pct:.0f}% of debits). Set a budget about 15% lower."
        )
    if recurring:
        names = ", ".join(m for m, _ in recurring[:3])
        suggestions.append(f"Repeated charges to {names} — audit these subscriptions.")
    if credit_total > 0:
        rate = max((credit_total - debit_total) / credit_total * 100, 0)
        suggestions.append(f"Your statement savings rate is {rate:.0f}%. Aim for 20-30%.")
    if net < 0:
        suggestions.append("Spending exceeded income here — trim discretionary categories.")
    suggestions.append("Automate a fixed transfer to savings on pay day.")

    return {
        "summary": {
            "debit_total": round(debit_total, 2),
            "credit_total": round(credit_total, 2),
            "net": round(net, 2),
            "transaction_count": len(transactions),
        },
        "categories": top_categories,
        "recurring": recurring,
        "suggestions": suggestions,
    }