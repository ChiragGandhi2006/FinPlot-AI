import dayjs from 'dayjs'
import {
  avgMonthlySavings,
  computeSavingsRate,
  goalForecast,
  healthTier,
  monthKey,
  totalByMonth,
} from './analytics'
import { DEFAULTS_BUDGETS, LS_KEYS } from '../constants'
import { getItem } from './storage'

function catExpense(expenses, catName) {
  return expenses.filter((e) => e.category_name === catName).reduce((s, e) => s + Number(e.amount), 0)
}

function catNameFor(expenses, categories, catId) {
  const cat = categories.find((c) => c.category_id === catId)
  return cat ? cat.category_name : 'Other'
}

/**
 * Generates rule-based, data-driven smart insights similar to an AI advisor.
 * @param {Object} data
 * @returns {Array<import('../types').Insight>}
 */
export function generateInsights({
  incomes = [],
  expenses = [],
  incomeCategories = [],
  expenseCategories = [],
  goals = [],
}) {
  const insights = []
  const now = dayjs()
  const thisKey = now.format('YYYY-MM')
  const lastKey = now.subtract(1, 'month').format('YYYY-MM')

  const incomeMap = totalByMonth(incomes, 'income_date')
  const expenseMap = totalByMonth(expenses, 'expense_date')

  const thisIncome = incomeMap[thisKey] || 0
  const thisExpense = expenseMap[thisKey] || 0
  const lastIncome = incomeMap[lastKey] || 0
  const lastExpense = expenseMap[lastKey] || 0

  const thisRate = computeSavingsRate(thisIncome, thisExpense)
  const lastRate = computeSavingsRate(lastIncome, lastExpense)

  if (!incomes.length && !expenses.length) {
    insights.push({
      id: 'intro',
      type: 'tip',
      title: 'Welcome aboard ✈️',
      message: 'Add your first income and expense to unlock personalized financial intelligence.',
    })
    return insights
  }

  /* Category delta vs last month */
  const thisMonth = expenses.filter((e) => monthKey(e.expense_date) === thisKey)
  const lastMonth = expenses.filter((e) => monthKey(e.expense_date) === lastKey)

  const lastCatTotals = {}
  lastMonth.forEach((e) => {
    const name = catNameFor(expenses, expenseCategories, e.category_id)
    lastCatTotals[name] = (lastCatTotals[name] || 0) + Number(e.amount)
  })

  const deltas = []
  thisMonth.forEach((e) => {
    const name = catNameFor(expenses, expenseCategories, e.category_id)
    deltas[name] = (deltas[name] || 0) + Number(e.amount)
  })

  Object.entries(deltas).forEach(([name, amount]) => {
    const prev = lastCatTotals[name] || 0
    if (prev > 0) {
      const pct = Math.round(((amount - prev) / prev) * 100)
      if (pct >= 15) {
        insights.push({
          id: `up-${name}`,
          type: 'warning',
          title: `${name} spending up`,
          message: `Your ${name} expenses increased by ${pct}% this month.`,
        })
      } else if (pct <= -15) {
        insights.push({
          id: `down-${name}`,
          type: 'positive',
          title: `${name} spending down`,
          message: `Your ${name} spending dropped by ${Math.abs(pct)}%. Nice work!`,
        })
      }
    }
  })

  /* Savings trend */
  if (lastIncome > 0 && thisRate > lastRate) {
    insights.push({
      id: 'saving-more',
      type: 'positive',
      title: 'Saving more 🎉',
      message: `You are saving more than last month — ${thisRate.toFixed(1)}% vs ${lastRate.toFixed(1)}%.`,
    })
  } else if (thisIncome > 0 && thisRate < lastRate) {
    insights.push({
      id: 'saving-less',
      type: 'warning',
      title: 'Savings slipped',
      message: `Your savings rate fell to ${thisRate.toFixed(1)}% from ${lastRate.toFixed(1)}%. Consider trimming non-essentials.`,
    })
  }

  /* Top category */
  if (thisMonth.length) {
    const top = { name: '', amount: 0 }
    thisMonth.forEach((e) => {
      const name = catNameFor(expenses, expenseCategories, e.category_id)
      if (deltas[name] > top.amount) {
        top.name = name
        top.amount = deltas[name]
      }
    })
    if (top.name) {
      insights.push({
        id: 'top-cat',
        type: 'tip',
        title: 'Top spending area',
        message: `You spent the most on ${top.name} this month. Review whether it aligns with your priorities.`,
      })
    }
  }

  /* Goal forecast */
  const saving = avgMonthlySavings(incomes, expenses)
  goals.forEach((goal) => {
    if (goal.status === 'completed') return
    const forecast = goalForecast(goal, saving)
    if (forecast.months !== null && forecast.months > 0) {
      insights.push({
        id: `goal-${goal.goal_id}`,
        type: 'goal',
        title: `Goal forecast: ${goal.goal_name}`,
        message: `At your current savings pace, you can reach "${goal.goal_name}" in approximately ${forecast.months} month${forecast.months > 1 ? 's' : ''} (by ${dayjs(forecast.date).format('MMM YYYY')}).`,
      })
    } else if (goal.saved_amount >= goal.target_amount) {
      insights.push({
        id: `goal-done-${goal.goal_id}`,
        type: 'positive',
        title: `Goal complete: ${goal.goal_name}`,
        message: `You fully funded "${goal.goal_name}". Time to celebrate! 🏆`,
      })
    }
  })

  /* Budget alerts */
  const budgetList = getItem(LS_KEYS.budgets, DEFAULTS_BUDGETS)
  budgetList.forEach((b) => {
    const spent = catExpense(expenses, b.category)
    if (b.limit > 0 && spent > b.limit) {
      insights.push({
        id: `budget-${b.id}`,
        type: 'danger',
        title: `Budget exceeded: ${b.category}`,
        message: `You crossed your ${b.category} budget — spent ${spent > b.limit ? 'over' : ''} the ₹${b.limit} limit this month.`,
      })
    }
  })

  /* Health nudge */
  const totalIncome = Object.values(incomeMap).reduce((a, b) => a + b, 0)
  const totalExpense = Object.values(expenseMap).reduce((a, b) => a + b, 0)
  const overall = computeSavingsRate(totalIncome, totalExpense)
  const tier = healthTier(overall)
  if (overall < 20 && totalIncome > 0) {
    insights.push({
      id: 'health',
      type: 'danger',
      title: 'Health score at risk',
      message: 'Your savings rate is below 20%. Aim to save at least 20-30% of income each month.',
    })
  } else if (overall >= 40) {
    insights.push({
      id: 'super-saver',
      type: 'positive',
      title: 'Super saver status 💎',
      message: `You're saving ${overall.toFixed(1)}% of your income — well above the recommended 20-30%.`,
    })
  }

  insights.push({
    id: 'tip',
    type: 'tip',
    title: 'Pro tip',
    message:
      'Automate at least 20% of your salary into a separate savings account the day it arrives. Pay yourself first!',
  })

  return insights.slice(0, 8)
}

export function generateWelcomeMessages(user) {
  return [
    `Hey ${user?.first_name || 'there'}! 👋 I'm your AI co-pilot. I've analyzed your finances and I'm ready to help.`,
    'Ask me anything — like "Can I buy an iPhone?", "Where am I spending too much?" or "How can I save more?".',
  ]
}
