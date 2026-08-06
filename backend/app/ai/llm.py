"""Optional LLM adapter.

When AI_OPENAI_API_KEY is configured and `requests` is available, the
orchestrator uses a real chat-completions model to answer questions grounded
in the user's data snapshot. Otherwise it falls back seamlessly to the built-in
rule engine, so the assistant always works offline.
"""
import os

from app.core.logging import logger

try:
    import requests

    _HAS_REQUESTS = True
except ImportError:  # pragma: no cover
    _HAS_REQUESTS = False


def llm_configured():
    return bool(os.getenv("AI_OPENAI_API_KEY", "").strip()) and bool(os.getenv("AI_MODEL", "").strip())


def context_text(context):
    """Compact, escaped financial context for the LLM prompt."""
    inc = [f"{i.get('source', 'income')} {i.get('amount')} on {i.get('income_date')}"
           for i in context.get("incomes", [])[:20]]
    exp = [f"{e.get('merchant')} {e.get('amount')} on {e.get('expense_date')}"
           for e in context.get("expenses", [])[:20]]
    goals = [f"{g.get('goal_name')} target={g.get('target_amount')} saved={g.get('saved_amount')}"
             for g in context.get("goals", [])]
    return str({"incomes": inc, "expenses": exp, "goals": goals})


def llm_answer(message, context, history=None):
    """Call an OpenAI-compatible chat completions endpoint.

    Returns a string reply, or None if not configured/unavailable.
    """
    if not _HAS_REQUESTS:
        return None
    key = os.getenv("AI_OPENAI_API_KEY", "").strip()
    model = os.getenv("AI_MODEL", "").strip()
    base = os.getenv("AI_BASE_URL", "https://api.openai.com/v1").strip().rstrip("/")
    if not key or not model:
        return None

    system = (
        "You are FinPilot AI, a personal finance copilot. Answer only finance-related "
        "questions. Use the user's supplied financial data to ground your answers. "
        "Keep replies friendly, concise (under 120 words), and use bullet points. "
        "If the data lacks the answer, say so and suggest what the user should add.\n\n"
        f"USER DATA (JSON): {context_text(context)}"
    )
    try:
        messages = [{"role": "system", "content": system}]
        for turn in (history or [])[-6:]:
            role = "user" if turn.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": str(turn.get("content", ""))})
        messages.append({"role": "user", "content": message})

        resp = requests.post(
            f"{base}/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": model, "messages": messages, "max_tokens": 500, "temperature": 0.4},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as exc:  # noqa: BLE001
        logger.warning("LLM lookup failed, falling back to rule engine: %s", exc)
        return None