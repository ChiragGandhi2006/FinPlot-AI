"""Simple, dependency-free forecasting for income/expense/savings.

Uses ordinary least-squares linear regression over monthly totals and adds
confidence bounds based on residual standard deviation. Pure Python stdlib only.
"""


def _monthly(value):
    """Return a (year, month) tuple from a date/datetime-like object."""
    if hasattr(value, "year") and hasattr(value, "month"):
        return (value.year, value.month)
    year, month, _ = str(value).split("-")[:3]
    return (int(year), int(month))


def _fit_line(points):
    """Fit y = a + b*x where x = month ordinal index (1,2,3...).

    points: list of (x, y). Returns (a, b, residuals_std) or None values.
    """
    n = len(points)
    if n < 2:
        return None, None, None
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    x_bar = sum(xs) / n
    y_bar = sum(ys) / n
    sxx = sum((x - x_bar) ** 2 for x in xs)
    if sxx == 0:
        return None, None, None
    b = sum((x - x_bar) * (y - y_bar) for x, y in points) / sxx
    a = y_bar - b * x_bar
    residuals = [y - (a + b * x) for x, y in points]
    return a, b, residuals


def forecast_monthly(items, date_field, months=3):
    """Forecast the next `months` totals from a list of {<date_field>, amount}.

    Aggregates by calendar month. Returns a list of
    {"month": "YYYY-MM", "value", "low", "high"}.
    """
    monthly = {}
    for item in items:
        key = _monthly(item[date_field])
        monthly[key] = monthly.get(key, 0) + float(item.get("amount") or 0)

    ordered = sorted(monthly.items())
    series = [
        {"x": idx, "key": key, "y": value}
        for idx, (key, value) in enumerate(ordered, start=1)
    ]

    a, b, residuals = _fit_line([(s["x"], s["y"]) for s in series])
    std = 0.0
    if residuals:
        std = (sum(r * r for r in residuals) / len(residuals)) ** 0.5

    last_x = series[-1]["x"] if series else 0
    result = []
    for step in range(1, months + 1):
        x = last_x + step
        if a is not None:
            pred = a + b * x
        else:
            pred = series[-1]["y"] if series else 0
        result.append(
            {
                "month": _future_month_key(last_x + step, ordered),
                "value": round(max(pred, 0), 2),
                "low": round(max(pred - std, 0), 2),
                "high": round(pred + std, 2),
            }
        )
    return result


def _future_month_key(month_index, ordered):
    """Map a 1-based month index to a 'YYYY-MM' string by advancing from the
    last actual month in `ordered`."""
    if not ordered:
        from datetime import date

        year, month = date.today().year, date.today().month
    else:
        year, month = ordered[-1][0]
        month += 1
        while month > 12:
            month -= 12
            year += 1
    return f"{year:04d}-{month:02d}"