import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { incomeApi } from '../api/income'
import { expenseApi } from '../api/expense'
import { goalApi } from '../api/goal'
import { dashboardApi } from '../api/dashboard'
import { categoryApi } from '../api/categories'
import { ACHIEVEMENTS, DEFAULTS_BUDGETS, LS_KEYS } from '../constants'
import { extractErrorMessage } from '../api/client'
import {
  buildCategoryTotals,
  buildHeatmap,
  buildMonthlySeries,
  buildRecentTransactions,
  computeCashFlow,
  computeHealthScore,
  computeSavingsRate,
  computeWeeklySpending,
  computeYearlyAnalytics,
  goalDaysLeft,
  healthTier,
  monthKey,
  totalByMonth,
} from '../utils/analytics'
import { generateInsights } from '../utils/insights'
import {
  getItem, setItem, exportBackup, importBackup,
  encryptBackup, decryptBackup,
  enqueueSync, runSync
} from '../utils/storage'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)

function computeEarned(now) {
  const earned = {}
  now.incomeCount = now.incomeCount || 0
  earned.first_income = now.incomeCount >= 1
  earned.first_goal = now.goals.length >= 1
  earned.saved_10000 = now.balance >= 10000
  earned.streak_30 = now.streak >= 30
  earned.budget_master = now.budgetMaster
  earned.goal_achiever = now.goals.some((g) => g.saved_amount >= g.target_amount || g.status === 'completed')
  earned.income_streak = now.incomeStreak >= 7
  earned.super_saver = now.savingsRate >= 40
  return earned
}

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [summary, setSummary] = useState(null)
  const [monthlySummary, setMonthlySummary] = useState([])
  const [categoryExpense, setCategoryExpense] = useState([])
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [goals, setGoals] = useState([])
  const [incomeCategories, setIncomeCategories] = useState([])
  const [expenseCategories, setExpenseCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [budgets, setBudgets] = useState(() => getItem(LS_KEYS.budgets, DEFAULTS_BUDGETS))
  const [subscriptions, setSubscriptions] = useState(() => getItem(LS_KEYS.subscriptions, []))
  const [notifications, setNotifications] = useState(() => getItem(LS_KEYS.notifications, []))
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => getItem(LS_KEYS.achievements, []))

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    try {
      const [summaryRes, monthly, cats, inc, exp, goalsRes, incomeCats, expenseCats] =
        await Promise.all([
          dashboardApi.summary(),
          dashboardApi.monthlySummary(),
          dashboardApi.categoryExpense(),
          incomeApi.getAll(),
          expenseApi.getAll(),
          goalApi.getAll(),
          categoryApi.income(),
          categoryApi.expense(),
        ])
      setSummary(summaryRes)
      setMonthlySummary(monthly || [])
      setCategoryExpense(cats || [])
      setIncomes(inc || [])
      setExpenses(exp || [])
      setGoals(goalsRes || [])
      setIncomeCategories(incomeCats || [])
      setExpenseCategories(expenseCats || [])
      return {
        incomes: inc || [],
        expenses: exp || [],
        goals: goalsRes || [],
        incomeCategories: incomeCats || [],
        expenseCategories: expenseCats || [],
      }
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const bootstrapped = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      bootstrapped.current = false
      setSummary(null)
      setMonthlySummary([])
      setCategoryExpense([])
      setIncomes([])
      setExpenses([])
      setGoals([])
      return
    }
    if (bootstrapped.current) return
    bootstrapped.current = true
    fetchData()
    // Run sync check on mount
    runSync()
  }, [isAuthenticated, fetchData])

  const streak = useMemo(() => {
    const all = incomes.map((i) => ({ date: i.income_date })).concat(expenses.map((e) => ({ date: e.expense_date })))
    return useActiveStreak(all)
  }, [incomes, expenses])

  const incomeStreak = useMemo(
    () => useActiveStreak(incomes.map((i) => ({ date: i.income_date }))),
    [incomes]
  )

  /* ---------- Derived analytics ---------- */
  const derived = useMemo(() => {
    const nowKey = dayjs().format('YYYY-MM')
    const incomeMap = totalByMonth(incomes, 'income_date')
    const expenseMap = totalByMonth(expenses, 'expense_date')
    const monthlyIncome = incomeMap[nowKey] || 0
    const monthlyExpense = expenseMap[nowKey] || 0
    const totalIncome = summary?.total_income ?? Object.values(incomeMap).reduce((a, b) => a + b, 0)
    const totalExpense = summary?.total_expense ?? Object.values(expenseMap).reduce((a, b) => a + b, 0)
    const savingsRate = computeSavingsRate(totalIncome, totalExpense)
    const balance = summary?.current_balance ?? totalIncome - totalExpense

    const recentTransactions = buildRecentTransactions(incomes, expenses, incomeCategories, expenseCategories, 10)
    const cashFlow = computeCashFlow(incomes, expenses)
    const weeklySpending = computeWeeklySpending(expenses)
    const yearlyAnalytics = computeYearlyAnalytics(incomes, expenses)
    const monthlySeries = buildMonthlySeries(monthlySummary)
    const heatmap = buildHeatmap(expenses)
    const categoryTotals = buildCategoryTotals(expenses, expenseCategories)

    const nowMonth = expenses.filter((e) => monthKey(e.expense_date) === nowKey)
    const spentByCategory = {}
    expenseCategories.forEach((c) => {
      spentByCategory[c.category_name] = nowMonth
        .filter((e) => e.category_id === c.category_id)
        .reduce((s, e) => s + Number(e.amount), 0)
    })
    const budgetMaster =
      budgets.length > 0 && budgets.every((b) => (spentByCategory[b.category] || 0) <= b.limit || b.limit === 0)

    const healthScore = computeHealthScore({ incomes, expenses, goals, budgets })
    const tier = healthTier(healthScore)

    const insights = generateInsights({ incomes, expenses, incomeCategories, expenseCategories, goals })

    return {
      monthlyIncome,
      monthlyExpense,
      totalIncome,
      totalExpense,
      savingsRate,
      balance,
      recentTransactions,
      cashFlow,
      weeklySpending,
      yearlyAnalytics,
      monthlySeries,
      heatmap,
      categoryTotals,
      healthScore,
      healthTier: tier,
      insights,
      streak,
      incomeStreak,
      spentByCategory,
      budgetMaster,
      goalDaysLeft,
    }
  }, [summary, incomes, expenses, goals, incomeCategories, expenseCategories, monthlySummary, budgets])

  /* ---------- Achievements ---------- */
  useEffect(() => {
    if (!incomes.length && !expenses.length && !goals.length) return
    const earned = computeEarned({
      incomeCount: incomes.length,
      goals,
      balance: derived.balance,
      streak: derived.streak,
      incomeStreak: derived.incomeStreak,
      savingsRate: derived.savingsRate,
      budgetMaster: derived.budgetMaster,
    })
    const current = getItem(LS_KEYS.achievements, [])
    const newly = ACHIEVEMENTS.filter((a) => earned[a.id] && !current.includes(a.id))
    if (newly.length) {
      const next = [...current, ...newly.map((a) => a.id)]
      setUnlockedAchievements(next)
      setItem(LS_KEYS.achievements, next)
      newly.forEach((a) => {
        toast.success(`Achievement unlocked: ${a.title}!`, { id: `ach-${a.id}` })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes.length, expenses.length, goals.length, derived.balance, derived.savingsRate, derived.budgetMaster])

  /* ---------- Notifications ---------- */
  const generateNotifications = useCallback(() => {
    const list = [...notifications]
    const add = (item) => {
      if (!list.some((n) => n.id === item.id)) list.unshift(item)
    }
    const nowKey = dayjs().format('YYYY-MM')
    const nowMonth = expenses.filter((e) => monthKey(e.expense_date) === nowKey)
    budgets.forEach((b) => {
      const spent = nowMonth
        .filter((e) => e.category_name === b.category || e.category_id === b.categoryId)
        .reduce((s, e) => s + Number(e.amount), 0)
      if (b.limit > 0 && spent > b.limit) {
        add({
          id: `budget-${b.id}`,
          type: 'budget',
          title: `${b.category} budget exceeded`,
          message: `You've spent ${Math.round(spent)} of your ${b.limit} budget.`,
          createdAt: dayjs().toISOString(),
          read: false,
        })
      }
    })
    goals.forEach((g) => {
      const days = goalDaysLeft(g)
      if (g.status !== 'completed' && days >= 0 && days <= 7) {
        add({
          id: `goal-${g.goal_id}`,
          type: 'goal',
          title: `Goal due soon: ${g.goal_name}`,
          message: `${days === 0 ? 'Due today' : `${days} day${days > 1 ? 's' : ''} left`} — keep going!`,
          createdAt: dayjs().toISOString(),
          read: false,
        })
      }
    })
    const rate = derived.savingsRate
    if (rate >= 20) {
      add({
        id: 'monthly-summary',
        type: 'summary',
        title: 'Monthly summary',
        message: `You saved ${rate.toFixed(1)}% of your income this month. Great job!`,
        createdAt: dayjs().toISOString(),
        read: false,
      })
    }
    setNotifications(list.slice(0, 20))
    setItem(LS_KEYS.notifications, list.slice(0, 20))
  }, [notifications, budgets, goals, expenses, derived.savingsRate])

  useEffect(() => {
    if (!loading && (incomes.length || expenses.length || goals.length)) {
      generateNotifications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  /* ---------- Mutations ---------- */
  const runMutation = useCallback(
    async (fn, successMessage) => {
      try {
        const result = await fn()
        if (successMessage) toast.success(successMessage)
        await fetchData()
        return result
      } catch (err) {
        toast.error(extractErrorMessage(err))
        throw err
      }
    },
    [fetchData]
  )

  const addIncome = useCallback((payload) => runMutation(() => incomeApi.create(payload), 'Income added'), [runMutation])
  const updateIncome = useCallback((id, payload) => runMutation(() => incomeApi.update(id, payload), 'Income updated'), [runMutation])
  const deleteIncome = useCallback((id) => runMutation(() => incomeApi.remove(id), 'Income deleted'), [runMutation])

  const addExpense = useCallback((payload) => runMutation(() => expenseApi.create(payload), 'Expense added'), [runMutation])
  const updateExpense = useCallback((id, payload) => runMutation(() => expenseApi.update(id, payload), 'Expense updated'), [runMutation])
  const deleteExpense = useCallback((id) => runMutation(() => expenseApi.remove(id), 'Expense deleted'), [runMutation])

  const addGoal = useCallback((payload) => runMutation(() => goalApi.create(payload), 'Goal created'), [runMutation])
  const updateGoal = useCallback((id, payload) => runMutation(() => goalApi.update(id, payload), 'Goal updated'), [runMutation])
  const deleteGoal = useCallback((id) => runMutation(() => goalApi.remove(id), 'Goal deleted'), [runMutation])

  /* ---------- Client-side stores with sync backup ---------- */
  const saveBudgets = useCallback((next) => {
    setBudgets(next)
    setItem(LS_KEYS.budgets, next)
    enqueueSync('budgets', next)
  }, [])
  const saveSubscriptions = useCallback((next) => {
    setSubscriptions(next)
    setItem(LS_KEYS.subscriptions, next)
    enqueueSync('subscriptions', next)
  }, [])
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      setItem(LS_KEYS.notifications, next)
      return next
    })
  }, [])
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }))
      setItem(LS_KEYS.notifications, next)
      return next
    })
  }, [])
  const clearNotifications = useCallback(() => {
    setNotifications([])
    setItem(LS_KEYS.notifications, [])
  }, [])

  const value = useMemo(
    () => ({
      ...derived,
      summary,
      monthlySummary,
      categoryExpense,
      incomes,
      expenses,
      goals,
      incomeCategories,
      expenseCategories,
      loading,
      error,
      budgets,
      subscriptions,
      notifications,
      unlockedAchievements,
      refresh: fetchData,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addGoal,
      updateGoal,
      deleteGoal,
      saveBudgets,
      saveSubscriptions,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      achievements: ACHIEVEMENTS,
    }),
    [
      derived, summary, monthlySummary, categoryExpense, incomes, expenses, goals,
      incomeCategories, expenseCategories, loading, error, budgets, subscriptions,
      notifications, unlockedAchievements, fetchData, addIncome, updateIncome,
      deleteIncome, addExpense, updateExpense, deleteExpense, addGoal, updateGoal,
      deleteGoal, saveBudgets, saveSubscriptions, markNotificationRead,
      markAllNotificationsRead, clearNotifications,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

function useActiveStreak(items) {
  let streak = 0
  const dates = new Set(items.map((i) => dayjs(i.date).format('YYYY-MM-DD')))
  let cursor = dayjs()
  while (dates.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }
  return streak
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
