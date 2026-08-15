import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  Percent,
  FileText,
  Sparkles,
  RefreshCw,
  Receipt,
  Activity,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { Card, CardHeader } from '../components/ui/Card'
import StatCard from '../components/dashboard/StatCard'
import HealthScore from '../components/dashboard/HealthScore'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import QuickActions from '../components/dashboard/QuickActions'
import InsightCard, { InsightsHeader } from '../components/dashboard/InsightCard'
import DailyShopSummary from '../components/dashboard/DailyShopSummary'
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import SavingsAreaChart from '../components/charts/SavingsAreaChart'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import { SkeletonChart, SkeletonCard } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { formatMoney, greeting } from '../utils/format'
import { reportApi } from '../api/report'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

function changePct(current, previous) {
  if (!previous && !current) return 0
  if (!previous) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export default function Dashboard() {
  const { user } = useAuth()
  const {
    loading,
    summary,
    monthlySummary,
    categoryExpense,
    incomes,
    expenses,
    incomeCategories,
    expenseCategories,
    balance,
    monthlyIncome,
    monthlyExpense,
    savingsRate,
    cashFlow,
    recentTransactions,
    healthScore,
    insights,
  } = useData()

  const last = monthlySummary.slice(-2)
  const prev = last.length > 1 ? last[0] : null
  const incomeChange = changePct(monthlyIncome, prev?.income)
  const expenseChange = changePct(monthlyExpense, prev?.expense)
  const savings = monthlyIncome - monthlyExpense

  const downloadReport = () =>
    toast.promise(reportApi.downloadPdf(), {
      loading: 'Generating your PDF report…',
      success: 'Report downloaded!',
      error: 'Could not generate report',
    })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{greeting()} 👋</p>
          <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, <span className="text-gradient">{user?.first_name || 'Pilot'}</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="ghost" icon={FileText} onClick={downloadReport}>Download Report</Button>
          <Link to="/app/insights">
            <Button icon={Sparkles}><span className="hidden sm:inline">Ask</span> AI</Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Current Balance"
          value={balance}
          icon={Wallet}
          gradient="from-indigo-500 to-violet-600"
          loading={loading}
        />
        <StatCard
          title="Monthly Income"
          value={monthlyIncome}
          icon={ArrowDownToLine}
          gradient="from-emerald-500 to-green-600"
          change={incomeChange}
          loading={loading}
        />
        <StatCard
          title="Monthly Expense"
          value={monthlyExpense}
          icon={ArrowUpFromLine}
          gradient="from-rose-500 to-red-600"
          change={expenseChange}
          loading={loading}
        />
        <StatCard
          title="Monthly Savings"
          value={savings}
          icon={PiggyBank}
          gradient="from-amber-500 to-orange-500"
          loading={loading}
        />
      </div>

      <DailyShopSummary />

      {/* Savings rate + health */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="relative overflow-hidden p-6 xl:col-span-2">
          <div className="absolute inset-0 bg-brand-gradient-soft dark:hidden" />
          <div className="relative flex h-full flex-col justify-between">
            <CardHeader
              title="Savings Rate"
              subtitle="Percentage of income you're keeping"
              icon={Percent}
            />
            <div className="px-6 pb-2">
              <p className="text-5xl font-extrabold tracking-tight text-gradient">
                {loading ? '—' : <AnimatedNumber value={savingsRate} suffix="%" decimals={1} />}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                {savingsRate >= 30
                    ? 'Outstanding — you\u2019re building serious wealth.'
                  : savingsRate >= 20
                    ? 'Great discipline. Keep it up!'
                    : 'Aim to save at least 20% of your income.'}
              </p>
            </div>
          </div>
        </Card>
        <HealthScore score={healthScore} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <CardHeader title="Income vs Expense" subtitle="Monthly comparison" icon={Activity} />
          <div className="px-2 pt-4">
            {loading ? <SkeletonChart /> : <IncomeExpenseBarChart data={cashFlow} height={280} />}
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Spending by Category" subtitle="This month" icon={Receipt} />
          <div className="px-2 pt-4">
            {loading ? <SkeletonChart /> : <CategoryPieChart data={categoryExpense} height={280} />}
          </div>
          <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto pr-1">
            {!loading &&
              categoryExpense.slice(0, 6).map((c) => (
                <div key={c.category} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{c.category}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{formatMoney(c.amount)}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Savings trend + cash flow */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <CardHeader title="Savings Trend" subtitle="Your net position over time" icon={PiggyBank} />
          <div className="px-2 pt-4">
            {loading ? <SkeletonChart /> : <SavingsAreaChart data={cashFlow} height={280} />}
          </div>
        </Card>
        <Card className="p-6">
          <CardHeader title="Recent Activity" subtitle="Latest transactions" action={<Link to="/app/expenses" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">View all</Link>} />
          <div className="px-4 pb-4 pt-3">
            <RecentTransactions
              transactions={recentTransactions}
              loading={loading}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
            />
          </div>
        </Card>
      </div>

      {/* Quick actions + insights */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <Card className="p-6">
            <CardHeader title="Quick Actions" subtitle="One-tap money moves" icon={RefreshCw} />
            <div className="px-6 pb-6 pt-4">
              <QuickActions />
            </div>
          </Card>
        </div>
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <InsightsHeader />
            <Link to="/app/insights" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
              Open AI chat
            </Link>
          </div>
          <div className="hide-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
            {loading
              ? [1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer h-32 w-64 shrink-0" />)
              : insights.slice(0, 4).map((insight, i) => <InsightCard key={insight.id} insight={insight} index={i} />)}
          </div>
        </Card>
      </div>
    </div>
  )
}
