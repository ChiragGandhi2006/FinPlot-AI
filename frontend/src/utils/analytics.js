import dayjs from 'dayjs'
import { DEFAULTS_BUDGETS, HEALTH_TIERS, LS_KEYS } from '../constants'
import { getItem } from './storage'

export function monthKey(date) {
  return dayjs(date).format('YYYY-MM')
}

export function monthLabel(key) {
  return dayjs(key).format('MMM')
}

export function getCurrentMonthKey() {
  return monthKey(dayjs())
}

export function getLastMonthKey() {
  return monthKey(dayjs().subtract(1, 'month'))
}

export function totalByMonth(items, dateField) {
  const map = {}
  items.forEach((item) => {
    const key = monthKey(item[dateField])
    map[key] = (map[key] || 0) + Number(item.amount)
  })
  return map
}

export function computeSavingsRate(income, expense) {
  if (!income) return 0
  return Math.max(((income - expense) / income) * 100, 0)
}

export function avgMonthlySavings(incomes, expenses) {
  const i = totalByMonth(incomes, 'income_date')
  const e = totalByMonth(expenses, 'expense_date')
  const keys = new Set([...Object.keys(i), ...Object.keys(e)])
  if (!keys.size) return 0
  let sum = 0
  keys.forEach((k) => {
    sum += (i[k] || 0) - (e[k] || 0)
  })
  return sum / keys.size
}

export function goalForecast(goal, monthlySaving) {
  const remaining = Math.max(goal.target_amount - goal.saved_amount, 0)
  if (remaining <= 0) return { months: 0, date: dayjs().format('YYYY-MM-DD') }
  if (monthlySaving <= 0) return { months: null, date: null }
  const months = Math.ceil(remaining / monthlySaving)
  return { months, date: dayjs().add(months, 'month').format('YYYY-MM-DD') }
}

export function goalDaysLeft(goal) {
  return dayjs(goal.target_date).startOf('day').diff(dayjs().startOf('day'), 'day')
}

export function computeWeeklySpending(expenses) {
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = dayjs().subtract(i, 'day')
    days.push({
      day: d.format('ddd'),
      date: d.format('YYYY-MM-DD'),
      amount: 0,
    })
  }
  const totals = {}
  expenses.forEach((e) => {
    const d = dayjs(e.expense_date).format('YYYY-MM-DD')
    totals[d] = (totals[d] || 0) + Number(e.amount)
  })
  return days.map((d) => ({ ...d, amount: totals[d.date] || 0 }))
}

export function computeYearlyAnalytics(incomes, expenses) {
  const months = []
  const iMap = totalByMonth(incomes, 'income_date')
  const eMap = totalByMonth(expenses, 'expense_date')
  for (let m = 11; m >= 0; m -= 1) {
    const d = dayjs().startOf('year').add(m, 'month')
    const key = d.format('YYYY-MM')
    months.push({
      month: d.format('MMM'),
      income: iMap[key] || 0,
      expense: eMap[key] || 0,
      savings: (iMap[key] || 0) - (eMap[key] || 0),
    })
  }
  return months.reverse()
}

export function buildMonthlySeries(monthlySummary) {
  if (monthlySummary?.length) {
    return monthlySummary.map((m) => ({
      month: m.month.slice(0, 3),
      income: m.income,
      expense: m.expense,
      savings: m.income - m.expense,
    }))
  }
  return computeYearlyAnalytics([], [])
}

export function buildCategoryTotals(expenses, categories) {
  const map = {}
  const catName = {}
  categories.forEach((c) => {
    catName[c.category_id] = c.category_name
  })
  expenses.forEach((e) => {
    const name = catName[e.category_id] || 'Other'
    map[name] = (map[name] || 0) + Number(e.amount)
  })
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function buildHeatmap(expenses) {
  const map = {}
  expenses.forEach((e) => {
    const d = dayjs(e.expense_date).format('YYYY-MM-DD')
    map[d] = (map[d] || 0) + Number(e.amount)
  })
  const weeks = []
  let max = 1
  Object.values(map).forEach((v) => {
    if (v > max) max = v
  })
  const start = dayjs().startOf('week').subtract(12, 'week')
  for (let w = 0; w < 13; w += 1) {
    const week = []
    for (let d = 0; d < 7; d += 1) {
      const date = start.add(w, 'week').add(d, 'day')
      const key = date.format('YYYY-MM-DD')
      const amount = map[key] || 0
      week.push({ date: key, amount, intensity: max > 0 ? amount / max : 0 })
    }
    weeks.push(week)
  }
  return weeks
}

export function computeCashFlow(incomes, expenses) {
  const monthlyIncome = totalByMonth(incomes, 'income_date')
  const monthlyExpense = totalByMonth(expenses, 'expense_date')
  const keys = new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpense)])
  return Array.from(keys)
    .sort()
    .map((k) => ({
      month: monthLabel(k),
      income: monthlyIncome[k] || 0,
      expense: monthlyExpense[k] || 0,
      net: (monthlyIncome[k] || 0) - (monthlyExpense[k] || 0),
    }))
}

export function buildRecentTransactions(incomes, expenses, incomeCats, expenseCats, limit = 8) {
  const icat = {}
  incomeCats.forEach((c) => {
    icat[c.category_id] = c.category_name
  })
  const ecat = {}
  expenseCats.forEach((c) => {
    ecat[c.category_id] = c.category_name
  })
  const items = [
    ...incomes.map((i) => ({
      id: `i-${i.income_id}`,
      type: 'income',
      title: i.source,
      category: icat[i.category_id] || 'Other',
      category_id: i.category_id,
      amount: Number(i.amount),
      date: i.income_date,
      created_at: i.created_at,
      payment_method: i.payment_method,
      raw: i,
    })),
    ...expenses.map((e) => ({
      id: `e-${e.expense_id}`,
      type: 'expense',
      title: e.merchant,
      category: ecat[e.category_id] || 'Other',
      category_id: e.category_id,
      amount: Number(e.amount),
      date: e.expense_date,
      created_at: e.created_at,
      payment_method: e.payment_method,
      raw: e,
    })),
  ]
  return items.sort((a, b) => dayjs(b.date).diff(dayjs(a.date))).slice(0, limit)
}

export function computeHealthScore({ incomes, expenses, goals, budgets = null }) {
  const iMap = totalByMonth(incomes, 'income_date')
  const eMap = totalByMonth(expenses, 'expense_date')
  const keys = new Set([...Object.keys(iMap), ...Object.keys(eMap)])

  let score = 0

  const totalIncome = Object.values(iMap).reduce((a, b) => a + b, 0)
  const totalExpense = Object.values(eMap).reduce((a, b) => a + b, 0)
  const rate = computeSavingsRate(totalIncome, totalExpense)
  if (rate >= 40) score += 35
  else if (rate >= 30) score += 30
  else if (rate >= 20) score += 24
  else if (rate >= 10) score += 16
  else if (rate > 0) score += 10
  else score += 2

  const monthsActive = Math.min(keys.size / 3, 1)
  score += monthsActive * 15

  const budgetList = budgets || getItem(LS_KEYS.budgets, DEFAULTS_BUDGETS)
  if (budgetList?.length && totalExpense > 0) {
    const within = budgetList.filter((b) => {
      const spent = expenses
        .filter((e) => {
          const now = dayjs()
          return (
            dayjs(e.expense_date).isSame(now, 'month') &&
            (e.category_name === b.category || e.category_id === b.categoryId)
          )
        })
        .reduce((s, e) => s + Number(e.amount), 0)
      return spent <= b.limit
    }).length
    score += Math.round((within / budgetList.length) * 20)
  } else {
    score += 10
  }

  if (goals?.length) {
    const progress =
      goals.reduce((s, g) => s + Math.min(g.saved_amount / g.target_amount, 1), 0) / goals.length
    score += Math.round(progress * 15)
  } else {
    score += 8
  }

  if (totalIncome > 0) {
    const incomeMonths = Object.keys(iMap).length
    score += Math.min(incomeMonths * 3, 15)
  } else {
    score += 3
  }

  return Math.min(Math.max(Math.round(score), 0), 100)
}

export function healthTier(score) {
  return HEALTH_TIERS.find((t) => score >= t.min) || HEALTH_TIERS[HEALTH_TIERS.length - 1]
}

export function activeStreak(items) {
  let streak = 0
  const dates = new Set(items.map((i) => dayjs(i.income_date || i.expense_date || i.date).format('YYYY-MM-DD')))
  let cursor = dayjs()
  while (dates.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }
  return streak
}
