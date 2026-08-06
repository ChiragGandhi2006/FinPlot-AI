"""Bank statement parsing and analysis.

Primary format: CSV (auto-detects columns). Also supports plain text and
PDF (if pypdf/PyPDF2 is installed). Produces normalized transactions plus
a summary and actionable, personalised suggestions.
"""

import csv
import io
import re
from datetime import date, datetime

from app.ai.categories import infer_expense_category

DATE_FORMATS = [
    "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y", "%Y-%m-%d",
    "%m/%d/%Y", "%m-%d-%Y", "%d %b %Y", "%d %B %Y",
    "%d %b %y", "%b %d, %Y",
]


def parse_date(value):
    if value is None:
        return None
    text = str(value).strip()
    for fmt in DATE_FORMATS:
        try:
            dt = datetime.strptime(text[:11], fmt)
            return date(dt.year, dt.month, dt.day)
        except (ValueError, TypeError):
            continue
    return None


def parse_amount(value):
    if value is None:
        return 0.0
    text = str(value).strip()
    if text in ("", "-"):
        return 0.0
    sign = -1.0 if (text.startswith("(") and text.endswith(")")) else 1.0
    if sign < 0:
        text = text[1:-1]
    cleaned = text.replace(",", "").replace("₹", "").replace("Rs.", "").replace("Rs ", "").strip()
    try:
        return sign * abs(float(cleaned))
    except ValueError:
        return 0.0


HEADER_SYNONYMS = {
    "date": ["date", "txn", "value date", "posting date", "dtar", "trans date", "transdate"],
    "narration": ["narration", "details", "description", "merchant", "particulars",
                  "remarks", "memo", "transaction", "transaction detail"],
    "debit": ["debit", "withdrawal", "paidamount", "amount dr", "dr amount", " dr", "withdrawl"],
    "credit": ["credit", "deposit", "amount cr", "cr amount", " cr", "deposits"],
    "balance": ["balance", "closing balance", "running balance", "avail bal", " bal"],
}


def _norm(value):
    return (value or "").strip().lower().replace("_", " ").replace("-", " ")


def _match(norm, targets):
    return any(t in norm for t in targets)


def _resolve_columns(headers):
    mapping = {"date": None, "narration": None, "debit": None, "credit": None, "balance": None}
    if not headers:
        return mapping
    for idx, header in enumerate(headers):
        norm = _norm(header)
        for key, targets in HEADER_SYNONYMS.items():
            if mapping[key] is None and _match(norm, targets):
                mapping[key] = idx
    return mapping


def _cell(row, idx):
    if idx is None or idx >= len(row):
        return None
    value = str(row[idx]).strip()
    return value or None


def _looks_like_data_row(row):
    return any(parse_date(cell) for cell in row)


def parse_csv_statement(content):
    reader = csv.reader(io.StringIO(content.decode("utf-8-sig", errors="replace")))
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
             (col["date"], col["debit"], col["credit"], col["balance"])),
            None,
        )
        narration_val = _cell(row, narration_col) or "Transaction"

    debit = parse_amount(_cell(row, col["debit"]))
    credit = parse_amount(_cell(row, col["credit"]))

    if col["debit"] is None and col["credit"] is None:
        amount = max([parse_amount(c) for c in row[col["date"] + 1:] if parse_amount(c) > 0] or [0])
        txn_type = "debit"
        if amount <= 0:
            return None
    elif debit > 0 and credit == 0:
        amount, txn_type = debit, "debit"
    elif credit > 0 and debit == 0:
        amount, txn_type = credit, "credit"
    else:
        return None

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


def parse_text_statement(text):
    transactions = []
    numeric_token = re.compile(r"^[0-9][0-9,]*(\.[0-9]{1,2})?$")
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
        real = [a for a in numeric if a > 0]
        if not real:
            continue
        amount = real[-1]
        merchant_words = [t.strip(",") for t in rest if not numeric_token.match(t)]
        merchant = " ".join(merchant_words).strip() or "Statement txn"
        txn_type = "debit" if any(t.upper() in ("DR", "DEBIT", "DBT") for t in rest) else "credit"
        transactions.append({
            "date": txn_date.isoformat(),
            "merchant": merchant,
            "amount": amount,
            "type": txn_type,
            "category": infer_expense_category(merchant),
        })
    return transactions


def parse_statement(filename, content):
    name = (filename or "").lower()
    if name.endswith(".csv"):
        return parse_csv_statement(content)
    if name.endswith((".txt", ".text")):
        return parse_text_statement(content.decode("utf-8", errors="replace"))
    if name.endswith(".pdf"):
        text = _pdf_text(content)
        return parse_text_statement(text) if text else []
    # Unknown extension: try CSV then text
    try:
        txns = parse_csv_statement(content)
        if txns:
            return txns
    except Exception:
        pass
    return parse_text_statement(content.decode("utf-8", errors="replace"))


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