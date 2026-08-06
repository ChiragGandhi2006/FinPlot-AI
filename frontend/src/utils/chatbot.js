import dayjs from 'dayjs'
import { computeSavingsRate, goalForecast, totalByMonth, avgMonthlySavings } from './analytics'
import { formatMoney } from './format'

function monthTotals(incomes, expenses) {
  const nowKey = dayjs().format('YYYY-MM')
  const iMap = totalByMonth(incomes, 'income_date')
  const eMap = totalByMonth(expenses, 'expense_date')
  return {
    income: iMap[nowKey] || 0,
    expense: eMap[nowKey] || 0,
  }
}

function categoryNameFor(categories, id) {
  return categories.find((c) => c.category_id === id)?.category_name || 'Other'
}

/**
 * A data-driven "AI" response engine. In production this would call an LLM,
 * but here it generates grounded answers from the user's real financial data.
 */
export function getAIResponse(query, data) {
  const q = query.toLowerCase()
  const {
    incomes = [],
    expenses = [],
    incomeCategories = [],
    expenseCategories = [],
    goals = [],
    budgets = [],
  } = data

  const { income, expense } = monthTotals(incomes, expenses)
  const totalIncome = incomes.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const balance = totalIncome - totalExpense
  const savingsRate = computeSavingsRate(totalIncome, totalExpense)
  const monthlySaving = avgMonthlySavings(incomes, expenses)
  const nowMonth = expenses.filter((e) => dayjs(e.expense_date).format('YYYY-MM') === dayjs().format('YYYY-MM'))

  /* Category deltas */
  const catTotals = {}
  const catPrev = {}
  nowMonth.forEach((e) => {
    const name = categoryNameFor(expenseCategories, e.category_id)
    catTotals[name] = (catTotals[name] || 0) + Number(e.amount)
  })
  expenses
    .filter((e) => dayjs(e.expense_date).format('YYYY-MM') === dayjs().subtract(1, 'month').format('YYYY-MM'))
    .forEach((e) => {
      const name = categoryNameFor(expenseCategories, e.category_id)
      catPrev[name] = (catPrev[name] || 0) + Number(e.amount)
    })

  const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]

  if (/buy|afford|purchase|costs? \d|phone|iphone|macbook|car|bike/.test(q) && !/how can i save/.test(q)) {
    const match = q.match(/(\d[\d,]*)\s*(k|lakh|l|k)?/)
    let cost = match ? parseFloat(match[1].replace(/,/g, '')) : 0
    if (match?.[2] === 'k' || match?.[2] === 'K') cost *= 1000
    if (match?.[2] === 'lakh' || match?.[2] === 'L') cost *= 100000

    if (cost > 0) {
      const months = monthlySaving > 0 ? Math.ceil(cost / monthlySaving) : null
      const affordableNow = cost <= balance
      return {
        text: affordableNow
          ? `Good news! 💚 You currently have ${formatMoney(balance)} in the bank, which covers a purchase of ${formatMoney(cost)}. My advice: keep at least 3–6 months of expenses as an emergency fund before big splurges. If you want to protect your savings rate (currently ${savingsRate.toFixed(1)}%), consider financing it with ${formatMoney(Math.min(cost, balance))} upfront.`
          : months
            ? `Let's do the math 🧮\n\nYou save about ${formatMoney(monthlySaving)}/month on average.\n\n• Cost: ${formatMoney(cost)}\n• Current balance: ${formatMoney(balance)}\n• Estimated time to save: ~${months} month${months > 1 ? 's' : ''}\n\nYou can absolutely do it! Set a goal in FinPilot and let me track your progress. You're ${(savingsRate >= 20) ? 'already saving at a healthy pace 🚀' : 'saving below 20% — tighten discretionary spending to speed this up.'}` 
            : `You currently have ${formatMoney(balance)} available. Since your monthly savings are ${monthlySaving <= 0 ? 'negative right now' : `around ${formatMoney(monthlySaving)}`}, I'd recommend building a savings habit first before large purchases.`
      }
    }
    return {
      text: `Looking at your finances: you have ${formatMoney(balance)} available and a savings rate of ${savingsRate.toFixed(1)}%. \n\nTell me the price — e.g. "Can I buy an iPhone for ₹70,000?" — and I'll tell you exactly how fast you can afford it.`,
    }
  }

  if (/where.*spend|spend.*too much|too much.*spend|top.*category|biggest|most.*spend/.test(q)) {
    if (!top) {
      return { text: "You haven't recorded any expenses this month yet. Add a few transactions and I'll break down exactly where your money goes. 💸" }
    }
    const pct = totalExpense > 0 ? ((top[1] / totalExpense) * 100).toFixed(0) : '0'
    const prev = catPrev[top[0]] || 0
    const delta = prev > 0 ? Math.round(((top[1] - prev) / prev) * 100) : null
    return {
      text: `This month you spent the most on ${top[0]}: ${formatMoney(top[1])} — that's ${pct}% of your total spending${delta !== null ? ` (${delta >= 0 ? '+' : ''}${delta}% vs last month)` : ''}.\n\n${
        delta !== null && delta > 15
          ? `That's a notable increase. Try setting a budget for ${top[0]} and I'll keep you on track.`
          : 'Consider setting a monthly budget for it so it never gets out of hand.'
      }`,
    }
  }

  if (/how.*save|save.*more|save money|cut.*cost|reduce/.test(q)) {
    const suggestions = []
    if (top) suggestions.push(`• ${top[0]} is your biggest cost (${formatMoney(top[1])} this month) — set a hard budget 10–15% lower.`)
    suggestions.push('• Automate 20% of income to savings the day salary arrives (pay yourself first).')
    suggestions.push('• Audit subscriptions — cancel the ones you rarely use.')
    suggestions.push('• Cook at home 3 more times a week and put the difference into savings.')
    if (savingsRate < 20) suggestions.push(`• Your savings rate is ${savingsRate.toFixed(1)}% — aim for 20–30%. Even ${formatMoney(Math.max(totalIncome * 0.05, 0), { compact: true })} extra a month compounds fast.`)
    return {
      text: `Here's your personalized savings plan 💡\n\n${suggestions.join('\n')}\n\nYour current monthly savings rate: ${savingsRate.toFixed(1)}%.`,
    }
  }

  if (/goal|on track|track|progress/.test(q)) {
    if (!goals.length) return { text: "You haven't created any savings goals yet. Go to Goals → \"Create Goal\" (try a MacBook, a trip, or an emergency fund) and I'll forecast exactly when you'll reach them." }
    const lines = goals.map((g) => {
      const pct = g.target_amount > 0 ? Math.min((g.saved_amount / g.target_amount) * 100, 100) : 0
      const f = goalForecast(g, monthlySaving)
      if (pct >= 100) return `• ${g.goal_name}: 🏆 COMPLETE (${formatMoney(g.saved_amount)})`
      return `• ${g.goal_name}: ${pct.toFixed(0)}% funded${f.months !== null ? ` · ~${f.months} month${f.months > 1 ? 's' : ''} away` : ''}`
    })
    return {
      text: `Here's your goal dashboard 📊\n\n${lines.join('\n')}\n\nBased on your current savings pace (${formatMoney(monthlySaving)}/month), ${goals.length === 1 ? 'this goal looks' : 'these goals look'} ${goals.every((g) => g.saved_amount >= g.target_amount) ? 'fully achieved — amazing!' : 'achievable. Keep the momentum!'}`,
    }
  }

  if (/budget plan|weekly budget|split.*budget|allocate/.test(q)) {
    const daily = income > 0 ? income / 30 : 0
    const alloc = (pct) => (income * pct).toFixed(0)
    return {
      text: `Here's a balanced weekly budget based on your monthly income of ${formatMoney(income)} 💰\n\n• Housing/Rent: ${formatMoney(alloc(0.3))}\n• Food: ${formatMoney(alloc(0.2))}\n• Savings: ${formatMoney(alloc(0.2))} (non-negotiable 😉)\n• Transport: ${formatMoney(alloc(0.1))}\n• Fun/Entertainment: ${formatMoney(alloc(0.1))}\n• Bills & Others: ${formatMoney(alloc(0.1))}\n\nThat's roughly ${formatMoney(daily)}/day to spend. I can track these as budgets in the Budgets tab!`,
    }
  }

  if (/this month|monthly|spent (in|this) month|how much.*month/.test(q)) {
    return {
      text: `Here's your month in numbers 📅\n\n• Income: ${formatMoney(income)}\n• Expenses: ${formatMoney(expense)}\n• Net: ${formatMoney(income - expense)}\n• Savings rate: ${computeSavingsRate(income, expense).toFixed(1)}%\n\n${income - expense >= 0 ? "You're in the green. Keep flying! ✈️" : "You're spending more than you earn this month — let's review your budget."}`,
    }
  }

  if (/budget.*exceed|over budget|alert/.test(q)) {
    const over = budgets.filter((b) => {
      const spent = nowMonth.filter((e) => categoryNameFor(expenseCategories, e.category_id) === b.category).reduce((s, e) => s + Number(e.amount), 0)
      return b.limit > 0 && spent > b.limit
    })
    if (!over.length) return { text: "Great news — you're within budget in every category this month. You're a Budget Master! 🏅" }
    return {
      text: `Heads up! You've exceeded ${over.length} budget${over.length > 1 ? 's' : ''}:\n\n${over.map((b) => `• ${b.category}: over by ${formatMoney(nowMonth.filter((e) => categoryNameFor(expenseCategories, e.category_id) === b.category).reduce((s, e) => s + Number(e.amount), 0) - b.limit)}`).join('\n')}\n\nLet's trim discretionary spending for the rest of the month.`,
    }
  }

  if (/hello|hi|hey/.test(q)) {
    return {
      text: `Hello! 👋 I'm your FinPilot AI co-pilot. I can answer questions like:\n\n• "Can I buy an iPhone?"\n• "Where am I spending too much?"\n• "How can I save more?"\n• "Am I on track with my goals?"\n\nWhat would you like to know?`,
    }
  }

  return {
    text: `Here's a snapshot of your financial health right now 📊\n\n• Balance: ${formatMoney(balance)}\n• Savings rate: ${savingsRate.toFixed(1)}%\n• Top category this month: ${top ? top[0] + ' (' + formatMoney(top[1]) + ')' : 'n/a'}\n\nTry asking me: "Where am I spending too much?", "Can I buy an iPhone?", or "How can I save more?".`,
  }
}
