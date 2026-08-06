import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Sparkles, RefreshCw, TrendingUp, ArrowDownRight, ArrowUpRight, Scale, AlertTriangle, Receipt, CalendarRange } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { aiApi } from '../api/ai'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { formatMoney } from '../utils/format'
import ProgressBar from '../components/ui/ProgressBar'
import { EXPENSE_CATEGORY_META } from '../constants'

const ACCEPT = 'text/csv,text/plain,application/pdf,.csv,.txt,.pdf'

function cardCls(value) {
  const num = Number(value)
  if (num > 0) return 'from-emerald-500 to-green-600'
  if (num < 0) return 'from-amber-500 to-orange-600'
  return 'from-cyan-500 to-teal-600'
}

export default function Statements() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [forecast, setForecast] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(false)

  const onFile = async (file) => {
    if (!file || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    setForecast(null)
    try {
      const res = await aiApi.analyzeStatement(file)
      setResult(res)
    } catch (err) {
      setError(err?.message || 'Failed to analyze the statement.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    onFile(e.dataTransfer?.files?.[0])
  }

  const summary = result?.summary || {}
  const maxCat = Math.max(...(result?.categories || []).map(([, v]) => Number(v) || 0), 1)

  const loadForecast = async () => {
    if (forecastLoading || !result) return
    setForecastLoading(true)
    try {
      const res = await aiApi.forecast(3)
      setForecast(res)
    } catch (err) {
      setError(err?.message || 'Could not generate a forecast.')
    } finally {
      setForecastLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Bank Statement Analyzer"
        subtitle="Upload your bank statement and get instant, personalized suggestions"
      />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-12 text-center transition ${
          dragOver ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-slate-700'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow">
          <Upload size={24} />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-white">
          {loading ? 'Analyzing your statement…' : 'Drop your bank statement here'}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">CSV, TXT or PDF · We never store your file</p>
        {loading && <Spinner className="mt-3" />}
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Couldn't analyze</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!result && !error && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Sparkles, title: 'Get insights', text: 'See where your money goes by category.', cls: 'from-indigo-500 to-violet-600' },
            { icon: RefreshCw, title: 'Find recurring charges', text: 'Spot subscriptions eating your budget.', cls: 'from-rose-500 to-red-600' },
            { icon: TrendingUp, title: 'Receive suggestions', text: 'Personalized tips to save more.', cls: 'from-emerald-500 to-green-600' },
          ].map((c) => {
            const Icon = c.icon
            return (
              <div key={c.title} className="glass-card p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${c.cls} text-white`}>
                  <Icon size={20} />
                </div>
                <h4 className="mt-3 font-extrabold text-slate-900 dark:text-white">{c.title}</h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.text}</p>
              </div>
            )
          })}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard icon={Receipt} label="Transactions read" value={summary.transaction_count ?? 0} cls="from-indigo-500 to-violet-600" />
            <SummaryCard icon={ArrowDownRight} label="Total debits" value={formatMoney(summary.debit_total)} cls="from-rose-500 to-red-600" />
            <SummaryCard icon={ArrowUpRight} label="Total credits" value={formatMoney(summary.credit_total)} cls="from-emerald-500 to-green-600" />
            <SummaryCard icon={Scale} label="Net cash flow" value={formatMoney(summary.net)} cls={cardCls(summary.net)} />
          </div>

          <div className="glass-card p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                  <TrendingUp size={18} className="text-indigo-500" /> Cash flow forecast
                </h3>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Trend estimate for the next 3 months based on your recorded income &amp; expenses.
                </p>
              </div>
              <Button
                size="sm"
                icon={CalendarRange}
                loading={forecastLoading}
                onClick={loadForecast}
                disabled={!!forecast}
              >
                {forecast ? 'Forecast ready' : 'Generate forecast'}
              </Button>
            </div>

            {!forecast ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tap "Generate forecast" to project your savings from recent transaction history.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:border-slate-700">
                      <th className="pb-2 pr-4">Month</th>
                      <th className="pb-2 pr-4">Income</th>
                      <th className="pb-2 pr-4">Expense</th>
                      <th className="pb-2">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(forecast.savings || []).map((row) => {
                      const income = (forecast.income || []).find((i) => i.month === row.month)
                      const expense = (forecast.expense || []).find((i) => i.month === row.month)
                      return (
                        <tr key={row.month} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                          <td className="py-2.5 pr-4 font-bold capitalize text-slate-700 dark:text-slate-200">
                            {row.month}
                          </td>
                          <td className="py-2.5 pr-4 font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatMoney(income?.value)}
                          </td>
                          <td className="py-2.5 pr-4 font-semibold text-rose-600 dark:text-rose-400">
                            {formatMoney(expense?.value)}
                          </td>
                          <td className="py-2.5 font-extrabold text-slate-900 dark:text-white">
                            {formatMoney(row.value)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">
                <Sparkles size={18} className="text-indigo-500" /> Personalized suggestions
              </h3>
              {(result.suggestions || []).length === 0 ? (
                <p className="text-sm text-slate-500">No suggestions yet.</p>
              ) : (
                <ul className="space-y-3">
                  {result.suggestions.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                      <Sparkles size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Button className="mt-4" icon={Sparkles} onClick={() => navigate('/app/insights')}>
                Explore in AI chat
              </Button>
            </div>

            <div className="glass-card p-6">
              <h3 className="mb-4 text-base font-extrabold text-slate-900 dark:text-white">Spending by category</h3>
              {(result.categories || []).length === 0 ? (
                <p className="text-sm text-slate-500">No debit transactions found.</p>
              ) : (
                <div className="space-y-4">
                  {result.categories.map(([cat, amount]) => {
                    const meta = EXPENSE_CATEGORY_META[cat] || { color: '#64748B' }
                    return (
                      <div key={cat}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-bold text-slate-700 dark:text-slate-200">{cat}</span>
                          <span className="font-semibold text-slate-500">{formatMoney(amount)}</span>
                        </div>
                        <ProgressBar value={Number(amount)} max={maxCat} height="h-2.5" color={meta.color} />
                      </div>
                    )
                  })}
                </div>
              )}
              {(result.recurring || []).length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <RefreshCw size={14} className="text-rose-500" /> Repeated charges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recurring.slice(0, 6).map(([m, n]) => (
                      <Badge key={m} color="rose" className="capitalize">{m} · {n}x</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, cls }) {
  return (
    <div className="glass-card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cls} text-white`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 truncate text-lg font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}