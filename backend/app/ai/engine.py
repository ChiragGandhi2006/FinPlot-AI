"""FinPilot AI chat engine.

A deterministic, data-grounded financial assistant. It interprets a broad
range of natural-language finance questions and answers from the user's real
transaction data. Pure Python, no external AI dependencies, fully offline.

An optional LLM adapter can be layered on top — when an API key is configured
the orchestrator prefers the LLM; this engine is the reliable fallback.
"""

import datetime as _dt
import math
import re

from app.ai.forecast import forecast_monthly


def _month_key(value):
    if not value:
        return None
    try:
        return _dt.datetime.fromisoformat(str(value)[:10]).strftime("%Y-%m")
    except (ValueError, TypeError):
        return None


def _now_key():
    return _dt.datetime.now().strftime("%Y-%m")


def _prev_key():
    d = _dt.datetime.now().replace(day=1) - _dt.timedelta(days=1)
    return d.strftime("%Y-%m")


def _fmt(value):
    try:
        return f"₹{float(value or 0):,.0f}"
    except (ValueError, TypeError):
        return f"₹{value}"


def _compute(context):
    incomes = context.get("incomes") or []
    expenses = context.get("expenses") or []
    goals = context.get("goals") or []

    total_income = sum(float(i["amount"]) for i in incomes)
    total_expense = sum(float(e["amount"]) for e in expenses)
    balance = total_income - total_expense
    savings_rate = max((total_income - total_expense) / total_income * 100, 0) if total_income else 0.0

    now_key = _now_key()
    month_income = sum(float(i["amount"]) for i in incomes if _month_key(i.get("income_date")) == now_key)
    month_expense = sum(float(e["amount"]) for e in expenses if _month_key(e.get("expense_date")) == now_key)

    cat_totals = {}
    cat_prev = {}
    for e in expenses:
        cat = e.get("category") or "Other"
        key = _month_key(e.get("expense_date"))
        if key == now_key:
            cat_totals[cat] = cat_totals.get(cat, 0) + float(e["amount"])
        elif key == _prev_key():
            cat_prev[cat] = cat_prev.get(cat, 0) + float(e["amount"])
    top = sorted(cat_totals.items(), key=lambda kv: kv[1], reverse=True)
    top_entry = top[0] if top else None

    monthly_map = {}
    for i in incomes:
        k = _month_key(i.get("income_date"))
        if k:
            monthly_map[k] = monthly_map.get(k, 0) + float(i["amount"])
    for e in expenses:
        k = _month_key(e.get("expense_date"))
        if k:
            monthly_map[k] = monthly_map.get(k, 0) - float(e["amount"])
    monthly_saving = (sum(monthly_map.values()) / len(monthly_map)) if monthly_map else 0.0

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "savings_rate": savings_rate,
        "month_income": month_income,
        "month_expense": month_expense,
        "monthly_saving": monthly_saving,
        "top": top_entry,
        "cat_totals": cat_totals,
        "cat_prev": cat_prev,
        "goals": goals,
    }


def _reply(text, intent):
    return {"reply": text.strip(), "intent": intent}


# ==========================================
# Intent handlers
# ==========================================

def _salutation(context, c):
    return _reply(
        "Hello! 👋 I'm your FinPilot AI. I've analyzed your live data and can tell you about your "
        "balance, spending, savings, goals, budgets, and more.\n\n"
        'Try asking:\n• "Where am I spending too much?"\n• "Can I buy an iPhone for ₹70,000?"\n'
        '• "Create a monthly budget plan"\n• "Am I on track with my goals?"',
        "greeting",
    )


def _affordability(context, c, q):
    match = re.search(r"(\d[\d,]*(?:\.\d+)?)\s*(k|lakh|l)?", q, re.IGNORECASE)
    cost = 0
    if match:
        cost = float(match.group(1).replace(",", ""))
        unit = (match.group(2) or "").lower()
        if unit == "k":
            cost *= 1000
        elif unit == "lakh":
            cost *= 100000
    balance = c["balance"]
    monthly_saving = c["monthly_saving"]
    if cost > 0:
        months = math.ceil(cost / monthly_saving) if monthly_saving > 0 else None
        if cost <= balance:
            text = (
                f"Good news! You have {_fmt(balance)} in the bank, which covers {_fmt(cost)}. 💚\n\n"
                "My advice: keep 3-6 months of expenses as an emergency fund before big splurges."
            )
        elif months:
            text = (
                f"Let's do the math 🧮\n\n"
                f"• Cost: {_fmt(cost)}\n• Current balance: {_fmt(balance)}\n"
                f"• You save about {_fmt(monthly_saving)}/month\n"
                f"• Estimated time to save: ~{months} month{'s' if months > 1 else ''}\n\n"
                f"Your savings rate is {c['savings_rate']:.1f}%. Set a goal and I'll track it!"
            )
        else:
            text = (
                f"You currently have {_fmt(balance)} available, and your monthly savings are "
                f"{'negative right now' if monthly_saving <= 0 else _fmt(monthly_saving)}. "
                "Build a savings habit first before large purchases."
            )
    else:
        text = (
            f"Looking at your finances: you have {_fmt(balance)} available and a savings rate of "
            f"{c['savings_rate']:.1f}%. Tell me the price — e.g. "
            '"Can I buy a MacBook for ₹1,20,000?"'
        )
    return _reply(text, "affordability")


def _spend_overview(context, c, q):
    if not c["top"]:
        return _reply(
            "You haven't recorded any expenses this month yet. Add a few transactions and I'll "
            "break down exactly where your money goes. 💸",
            "spending",
        )
    name, amount = c["top"]
    pct = (amount / max(c["month_expense"], 1)) * 100
    prev = c["cat_prev"].get(name) or 0
    delta = ""
    if prev:
        diff = amount - prev
        delta = f"\nNote: that's {_fmt(diff)} vs last month."
    return _reply(
        f"This month you spent the most on {name}: {_fmt(amount)} — that's {pct:.0f}% of your "
        f"total spending.{delta}\n\nConsider setting a category budget to keep it in check.",
        "spending",
    )


def _save_advice(context, c, q):
    tips = []
    if c["top"]:
        name, amount = c["top"]
        tips.append(f"• {name} is your biggest cost ({_fmt(amount)} this month) — cut it 10-15%.")
    tips.append("• Automate 20% of income to savings on pay day (pay yourself first).")
    tips.append("• Audit subscriptions — cancel ones you rarely use.")
    tips.append("• Trim dining out; the difference compounds over time.")
    return _reply(
        f"Here's your personalized savings plan 💡\n\n" + "\n".join(tips) +
        f"\n\nCurrent monthly savings rate: {c['savings_rate']:.1f}%.",
        "save",
    )


def _goals(context, c, q):
    goals = c["goals"]
    if not goals:
        return _reply(
            "You haven't created any savings goals yet. Go to Goals → \"Create Goal\" (a MacBook, "
            "a trip, or an emergency fund) and I'll forecast when you'll reach them.",
            "goals",
        )
    lines = []
    all_done = True
    for g in goals:
        target = float(g.get("target_amount") or 0)
        saved = float(g.get("saved_amount") or 0)
        pct = min(saved / target * 100, 100) if target else 0
        remaining = max(target - saved, 0)
        if remaining <= 0:
            lines.append(f"• {g['goal_name']}: 🏆 COMPLETE ({_fmt(saved)})")
        else:
            all_done = False
            months = math.ceil(remaining / c["monthly_saving"]) if c["monthly_saving"] > 0 else None
            eta = f"~{months} months away" if months else "— add savings to speed it up"
            lines.append(f"• {g['goal_name']}: {pct:.0f}% funded · {eta}")
    verdict = "fully achieved — amazing! 🎉" if all_done else "achievable. Keep the momentum!"
    return _reply(
        f"📊 Your goals\n\n" + "\n".join(lines) +
        f"\n\nBased on your current pace ({_fmt(c['monthly_saving'])}/mo), these look {verdict}",
        "goals",
    )


def _budget_plan(context, c, q):
    income = c["month_income"] or c["total_income"]
    if income <= 0:
        return _reply(
            "I couldn't find income for this period. Add income first and I'll build a plan.",
            "budget",
        )
    alloc = lambda pct: income * pct  # noqa: E731
    return _reply(
        f"Here's a balanced plan based on your monthly income of {_fmt(income)} 💰\n\n"
        f"• Housing/Rent: {_fmt(alloc(0.3))}\n• Food: {_fmt(alloc(0.2))}\n"
        f"• Savings: {_fmt(alloc(0.2))} (non-negotiable 😉)\n• Transport: {_fmt(alloc(0.1))}\n"
        f"• Fun: {_fmt(alloc(0.1))}\n• Bills & Other: {_fmt(alloc(0.1))}\n\n"
        f"That's roughly ₹{income / 30:,.0f}/day to spend.",
        "budget",
    )


def _month_summary(context, c, q):
    net = c["month_income"] - c["month_expense"]
    status = "in the green. Keep flying ✈️" if net >= 0 else "over budget — let's review your plan."
    return _reply(
        f"Here's your month in numbers 📅\n\n"
        f"• Income: {_fmt(c['month_income'])}\n"
        f"• Expenses: {_fmt(c['month_expense'])}\n"
        f"• Net: {_fmt(net)}\n"
        f"• Savings rate: {c['savings_rate']:.1f}%\n\nYou're {status}",
        "monthly",
    )


def _balance(context, c, q):
    return _reply(
        f"Your current balance is {_fmt(c['balance'])}.\n"
        f"Lifetime income: {_fmt(c['total_income'])} · expenses: {_fmt(c['total_expense'])} "
        f"· savings rate: {c['savings_rate']:.1f}%.",
        "balance",
    )


def _savings_rate(context, c, q):
    saved = c["total_income"] - c["total_expense"]
    extra = (
        "You're above the 20-30% target — great discipline! 💎"
        if c["savings_rate"] >= 20
        else "Let's build a plan to lift it above 20%."
    )
    return _reply(
        f"Your savings rate is {c['savings_rate']:.1f}% "
        f"({_fmt(saved)} saved of {_fmt(c['total_income'])}).\nTarget: 20-30% of income. {extra}",
        "savings_rate",
    )


def _forecast(context, c, q):
    months = 3
    inc = forecast_monthly(context.get("incomes") or [], "income_date", months)
    exp = forecast_monthly(context.get("expenses") or [], "expense_date", months)
    lines = []
    for i in range(months):
        key = exp[i]["month"]
        lines.append(
            f"• {key}: income {_fmt(inc[i]['value'])} · expense {_fmt(exp[i]['value'])} · "
            f"savings {_fmt(inc[i]['value'] - exp[i]['value'])}"
        )
    return _reply(
        "📈 Next 3 months (trend estimate)\n\n" + "\n".join(lines) +
        "\n\nThese are trend estimates, not guarantees.",
        "forecast",
    )


def _category_query(context, c, q):
    target = None
    for cat in context.get("expenseCategories") or []:
        name = cat["category_name"]
        if name.lower() in q:
            target = name
            break
    if target:
        amount = c["cat_totals"].get(target, 0)
        prev = c["cat_prev"].get(target, 0)
        delta = f" vs {_fmt(prev)} last month" if prev else ""
        return _reply(f"This month you spent {_fmt(amount)} on {target}{delta}.", "category")
    if not c["cat_totals"]:
        return _reply("You have no expenses this month to break down yet.", "category")
    listing = "\n".join(
        f"• {name}: {_fmt(amount)}"
        for name, amount in sorted(c["cat_totals"].items(), key=lambda kv: kv[1], reverse=True)
    )
    return _reply(f"Here's your spending by category 📊\n\n{listing}", "category")


def _subscriptions(context, c, q):
    expenses = context.get("expenses") or []
    counts = {}
    for e in expenses:
        m = (e.get("merchant") or "").lower()
        if m:
            counts[m] = counts.get(m, 0) + 1
    recurring = sorted(((m, n) for m, n in counts.items() if n >= 2), key=lambda kv: kv[1], reverse=True)
    text = "Subscription health 📣\n\n"
    if recurring:
        names = ", ".join(m for m, _ in recurring[:3])
        text += f"• Repeated charges to: {names}\n"
    else:
        text += "• No repeated merchant charges detected yet.\n"
    text += "\nRecommend: cancel anything you haven't used in 30 days, and add subscriptions "
    text += "in the Subscriptions tab to track renewals."
    return _reply(text.strip(), "subscriptions")


def _health(context, c, q):
    score = _health_score(context)
    label = _health_label(score)
    return _reply(
        f"Your financial health score is {score}/100 ({label}).\n\n"
        f"Key inputs: savings rate {c['savings_rate']:.1f}%, balance {_fmt(c['balance'])}, "
        f"{len(c['goals'])} active goal(s).",
        "health",
    )


def _health_score(context):
    c = _compute(context)
    score = 0
    rate = c["savings_rate"]
    if rate >= 40:
        score += 35
    elif rate >= 20:
        score += 26
    elif rate > 0:
        score += 14
    if c["balance"] > 0:
        score += 20
    elif c["balance"] < 0:
        score += 5
    else:
        score += 10
    if c["goals"]:
        score += min(len(c["goals"]) * 10, 20)
    months_active = len(
        {_month_key(i.get("income_date")) for i in context.get("incomes") or []}
        | {_month_key(e.get("expense_date")) for e in context.get("expenses") or []}
    )
    score += min(months_active * 5, 15)
    return max(0, min(100, score))


def _health_label(score):
    if score >= 80:
        return "Excellent"
    if score >= 60:
        return "Good"
    if score >= 40:
        return "Fair"
    return "Needs improvement"


def _emergency_fund(context, c, q):
    monthly = c["month_expense"] or (c["total_expense"] / max(len({
        _month_key(e.get("expense_date")) for e in context.get("expenses") or []
    }), 1)) if c["total_expense"] else 0
    if monthly <= 0:
        return _reply(
            "To plan an emergency fund I need your typical monthly spend — add a few expenses "
            "and I'll size it for you.",
            "emergency_fund",
        )
    months_covered = c["balance"] / monthly if monthly else 0
    target = monthly * 6
    return _reply(
        f"An emergency fund should cover 3-6 months of expenses.\n\n"
        f"• Monthly expenses: {_fmt(monthly)}\n"
        f"• 6-month target: {_fmt(target)}\n"
        f"• Current balance: {_fmt(c['balance'])} "
        f"({months_covered:.1f} months covered)\n\n"
        + ("You're fully covered — nice safety net! 🛡️" if months_covered >= 6 else
           f"Aim to set aside {_fmt(target - c['balance'])} more, at about {_fmt(c['monthly_saving'] or 0)}/mo."),
        "emergency_fund",
    )


def _debt(context, c, q):
    return _reply(
        "Debt advice 🧭\n\n"
        "• Pay off the highest-interest debt first (avalanche) while keeping minimums current.\n"
        "• Keep credit utilization under 30%.\n"
        "• If you have a loan, an extra payment toward principal each month cuts interest a lot.\n\n"
        "Track payments as expenses in FinPilot so I can monitor your progress.",
        "debt",
    )


def _education(context, c, q, text):
    lower = text.lower()
    if "compound" in lower:
        body = "Compound interest rewards patience: with 10% annual growth, money doubles in ~7 years. Start early and let time work for you. 📈"
    elif "emergency" in lower:
        return _emergency_fund(context, c, q)
    elif "50/30/20" in lower or "50 30 20" in lower:
        body = "50/30/20 rule: 50% needs, 30% wants, 20% savings & debt. Simple and effective."
    elif "invest" in lower or "investing" in lower or "mutual fund" in lower or "stock" in lower:
        body = ("Investing basics: build an emergency fund first, then diversify — index funds "
                "and SIPs are a solid starting point. Never invest money you need within 3 years.")
    elif "debt" in lower or "loan" in lower:
        return _debt(context, c, q)
    elif "tax" in lower:
        body = "Tax tips: use Section 80C investments (ELSS, PPF), track deductible expenses, and keep receipts for claims."
    elif "budget" in lower:
        body = "Budgeting 101: track every expense for 30 days, then allocate 50/30/20 and automate your savings."
    else:
        body = ("Personal finance in one line: spend less than you earn, automate savings, "
                "build an emergency fund, and invest the rest for the long term.")
    return _reply(f"Great question! 💡\n\n{body}", "education")


# ==========================================
# Intent router
# ==========================================

def get_ai_response(query, context):
    """Entry point used by the API. Returns {'reply', 'intent'}."""
    q = query.strip().lower()
    if not q:
        return _reply("How can I help you today? Try asking about your balance, spending, or savings.", "greeting")

    c = _compute(context)

    # ---- affordability ----
    has_price = bool(re.search(r"₹|\d[\d,]*(?:\.\d+)?\s*(k|lakh|k rupees|l)", q))
    if has_price or re.search(r"\bbuy\b|\bafford\b|\bpurchase\b|\bworth it\b", q):
        return _affordability(context, c, q)

    # ---- emergency fund ----
    if re.search(r"emergency|rainy day", q):
        return _emergency_fund(context, c, q)

    # ---- category (only when explicitly about a category's spend) ----
    spent_name = next(
        (cat["category_name"] for cat in context.get("expenseCategories") or []
         if cat["category_name"].lower() in q),
        None,
    )
    if spent_name and re.search(r"spend|spent|how much|category|cost", q):
        return _category_query(context, c, q)
    if re.search(r"category|categor", q):
        return _category_query(context, c, q)

    # ---- spending analysis ----
    if re.search(r"where.*(spend|go)|spend.*too much|too much.*spend|top.*category|biggest|most.*(spend|on)", q):
        return _spend_overview(context, c, q)
    if re.search(r"top category|biggest expense|main expense", q):
        return _spend_overview(context, c, q)

    # ---- savings ----
    if re.search(r"how.*save|save.*more|cut.*cost|reduce.*(spend|expense)|saving plan", q):
        return _save_advice(context, c, q)
    if re.search(r"savings rate|savings %|what.*save|how much.*save|percent", q):
        return _savings_rate(context, c, q)

    # ---- goals ----
    if re.search(r"\bgoal\b|on track|progress against|goal forecast|track progress", q):
        return _goals(context, c, q)

    # ---- budget ----
    if re.search(r"budget.*plan|weekly budget|split.*budget|allocate|50/30/20|50 30 20", q):
        return _budget_plan(context, c, q)

    # ---- month summary ----
    if re.search(r"this month|monthly|spent (in|this) month|how much.*month|month summary", q):
        return _month_summary(context, c, q)

    # ---- balance / net worth ----
    if re.search(r"\bbalance\b|net worth|how much.*(have|money)|total money", q):
        return _balance(context, c, q)

    # ---- forecast ----
    if re.search(r"forecast|predict|future|next month|will i", q):
        return _forecast(context, c, q)

    # ---- subscriptions ----
    if re.search(r"subscription|recurring|renew", q):
        return _subscriptions(context, c, q)

    # ---- health ----
    if re.search(r"health|score|how am i doing|financial fitness", q):
        return _health(context, c, q)

    # ---- education / general finance ----
    if re.search(r"what is|explain|how does|tips|advice|learn|invest|debt|loan|tax|compound", q):
        return _education(context, c, q, q)

    # ---- greeting ----
    if re.search(r"^(hi|hello|hey|yo|namaste|hai|hola)\b", q):
        return _salutation(context, c)

    # ---- fallback ----
    return _reply(
        f"Here's a snapshot of your financial health right now 📊\n\n"
        f"• Balance: {_fmt(c['balance'])}\n"
        f"• Savings rate: {c['savings_rate']:.1f}%\n"
        f"• Top category: {c['top'][0] if c['top'] else 'n/a'}"
        + (f" ({_fmt(c['top'][1])})" if c["top"] else "")
        + f"\n\nTry asking: \"Where am I spending too much?\", \"Can I buy an iPhone?\", "
          "or \"How can I save more?\".",
        "misc",
    )