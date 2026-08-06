import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Flame, PieChart, TrendingUp, TrendingDown, BarChart3, Target, Wallet } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import HeatMap from '../components/charts/HeatMap'
import YearlyAnalyticsChart from '../components/charts/YearlyAnalyticsChart'
import CashFlowChart from '../components/charts/CashFlowChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import SavingsAreaChart from '../components/charts/SavingsAreaChart'
import { formatMoney } from '../utils/format'
import { buildHeatmap, buildCategoryTotals, computeSavingsRate } from '../utils/analytics'

const PERIODS = [
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'Last 3 Months' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
]

export default function Analytics() {
  const { incomes, expenses, incomeCategories, expenseCategories, goals } = useData()
  const [period, setPeriod] = useState('month')

  const filtered = useMemo(() => {
    const cutoff = (() => {
      if (period === 'month') return dayjs().startOf('month')
      if (period === 'quarter') return dayjs().startOf('month').subtract(2, 'month')
      if (period === 'year') return dayjs().startOf('year')
      return null
    })()
    const inRange = (date) => !cutoff || dayjs(date).isAfter(cutoff.subtract(1, 'day'))
    return {
      incomes: incomes.filter((i) => inRange(i.income_date)),
      expenses: expenses.filter((e) => inRange(e.expense_date)),
    }
  }, [incomes, expenses, period])

  const incomeBreakdown = useMemo(() => {
    const map = {}
    const catName = {}
    incomeCategories.forEach((c) => {
      catName[c.category_id] = c.category_name
    })
    filtered.incomes.forEach((i) => {
      const name = catName[i.category_id] || 'Other'
      map[name] = (map[name] || 0) + Number(i.amount)
    })
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered.incomes, incomeCategories])

  const expenseBreakdown = useMemo(
    () => buildCategoryTotals(filtered.expenses, expenseCategories),
    [filtered.expenses, expenseCategories]
  )

  const monthlySummary = useMemo(() => {
    const iMap = {}
    const eMap = {}
    filtered.incomes.forEach((i) => {
      const k = dayjs(i.income_date).format('MMM YY')
      iMap[k] = (iMap[k] || 0) + Number(i.amount)
    })
    filtered.expenses.forEach((e) => {
      const k = dayjs(e.expense_date).format('MMM YY')
      eMap[k] = (eMap[k] || 0) + Number(e.amount)
    })
    const keys = new Set([...Object.keys(iMap), ...Object.keys(eMap)])
    return Array.from(keys)
      .sort((a, b) => dayjs(a, 'MMM YY').diff(dayjs(b, 'MMM YY')))
      .map((k) => ({ month: k, income: iMap[k] || 0, expense: eMap[k] || 0, savings: (iMap[k] || 0) - (eMap[k] || 0) }))
  }, [filtered])

  const totalIncome = filtered.incomes.reduce((s, i) => s + Number(i.amount), 0)
  const totalExpense = filtered.expenses.reduce((s, e) => s + Number(e.amount), 0)
  const savingsRate = computeSavingsRate(totalIncome, totalExpense)
  const totalTransactions = filtered.incomes.length + filtered.expenses.length
  const heatmap = useMemo(() => buildHeatmap(filtered.expenses), [filtered.expenses])

  const stats = [
    { label: 'Total Income', value: formatMoney(totalIncome), icon: TrendingUp, cls: 'from-emerald-500 to-green-600' },
    { label: 'Total Expense', value: formatMoney(totalExpense), icon: TrendingDown, cls: 'from-rose-500 to-red-600' },
    { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, icon: Wallet, cls: 'from-indigo-500 to-violet-600' },
    { label: 'Transactions', value: totalTransactions, icon: BarChart3, cls: 'from-amber-500 to-orange-600' },
  ]

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Deep-dive into every rupee"
        actions={
          <div className="flex rounded-full border border-slate-200 bg-white/70 p-1 backdrop-blur dark:border-slate-700 dark:bg-slate-800/60">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  period === p.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card flex items-center gap-3 p-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.cls} text-white shadow-lg`}>
              <s.icon size={19} strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <CardHeader title="Monthly Trend" subtitle="Income, expenses & net savings" icon={BarChart3} />
          <div className="px-2 pt-4">
            <YearlyAnalyticsChart data={monthlySummary} height={300} />
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Cash Flow" subtitle="Money in vs money out" icon={TrendingUp} />
          <div className="px-2 pt-4">
            <CashFlowChart data={monthlySummary} height={300} />
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Expense Breakdown" subtitle="Where you're spending" icon={PieChart} />
          <div className="px-2 pt-4">
            <CategoryPieChart data={expenseBreakdown} height={280} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {expenseBreakdown.slice(0, 6).map((c) => (
              <div key={c.category} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <span className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{c.category}</span>
                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-200">{formatMoney(c.amount, { compact: true })}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Income Breakdown" subtitle="Sources of income" icon={TrendingUp} />
          <div className="px-2 pt-4">
            <CategoryPieChart data={incomeBreakdown} height={280} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {incomeBreakdown.slice(0, 6).map((c) => (
              <div key={c.category} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <span className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{c.category}</span>
                <span className="ml-2 text-xs font-bold text-slate-700 dark:text-slate-200">{formatMoney(c.amount, { compact: true })}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <CardHeader title="Spending Heatmap" subtitle="Last 12 weeks · darker = more spent" icon={Flame} />
        <div className="pt-5">
          <HeatMap weeks={heatmap} />
        </div>
      </Card>

      {goals.length > 0 && (
        <Card className="mt-4 p-6">
          <CardHeader title="Goal Analytics" subtitle="Progress across all goals" icon={Target} />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {goals.map((g) => {
              const pct = g.target_amount > 0 ? Math.min((g.saved_amount / g.target_amount) * 100, 100) : 0
              return (
                <div key={g.goal_id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{g.goal_name}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{Math.round(pct)}%</p>
                    <p className="text-[10px] font-semibold text-slate-400">{formatMoney(g.saved_amount)} / {formatMoney(g.target_amount)}</p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
