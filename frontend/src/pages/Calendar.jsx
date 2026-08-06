import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowDownToLine, ArrowUpFromLine, CalendarDays } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import { formatMoney } from '../utils/format'
import { EXPENSE_CATEGORY_META, INCOME_CATEGORY_META } from '../constants'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const { incomes, expenses, incomeCategories, expenseCategories } = useData()
  const [month, setMonth] = useState(() => dayjs().startOf('month'))
  const [selected, setSelected] = useState(() => dayjs().format('YYYY-MM-DD'))

  const byDate = useMemo(() => {
    const map = {}
    const icat = {}
    incomeCategories.forEach((c) => {
      icat[c.category_id] = c.category_name
    })
    const ecat = {}
    expenseCategories.forEach((c) => {
      ecat[c.category_id] = c.category_name
    })
    incomes.forEach((i) => {
      const d = dayjs(i.income_date).format('YYYY-MM-DD')
      map[d] = map[d] || { income: 0, expense: 0, items: [] }
      map[d].income += Number(i.amount)
      map[d].items.push({
        type: 'income',
        title: i.source,
        amount: Number(i.amount),
        category: icat[i.category_id] || 'Other',
        date: i.income_date,
      })
    })
    expenses.forEach((e) => {
      const d = dayjs(e.expense_date).format('YYYY-MM-DD')
      map[d] = map[d] || { income: 0, expense: 0, items: [] }
      map[d].expense += Number(e.amount)
      map[d].items.push({
        type: 'expense',
        title: e.merchant,
        amount: Number(e.amount),
        category: ecat[e.category_id] || 'Other',
        date: e.expense_date,
      })
    })
    Object.values(map).forEach((v) => v.items.sort((a, b) => b.amount - a.amount))
    return map
  }, [incomes, expenses, incomeCategories, expenseCategories])

  const days = useMemo(() => {
    const first = month.startOf('month')
    const start = first.startOf('week')
    const cells = []
    for (let i = 0; i < 42; i += 1) {
      const d = start.add(i, 'day')
      cells.push(d)
    }
    return cells
  }, [month])

  const selectedData = byDate[selected]
  const selectedDay = dayjs(selected)

  return (
    <div>
      <PageHeader title="Calendar" subtitle="See your spending and income day by day" />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <CalendarDays size={18} className="text-indigo-500" />
              {month.format('MMMM YYYY')}
            </h3>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setMonth((m) => m.subtract(1, 'month'))} aria-label="Previous month" className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setMonth(dayjs().startOf('month'))} className="rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10">
                Today
              </button>
              <button onClick={() => setMonth((m) => m.add(1, 'month'))} aria-label="Next month" className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">{d}</div>
            ))}
            {days.map((d) => {
              const key = d.format('YYYY-MM-DD')
              const data = byDate[key]
              const isToday = d.isSame(dayjs(), 'day')
              const inMonth = d.isSame(month, 'month')
              const isSelected = key === selected
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelected(key)}
                  className={`relative flex min-h-[64px] flex-col items-start gap-1 rounded-xl border p-1.5 text-left transition sm:min-h-[80px] sm:p-2 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/30 dark:bg-indigo-500/10'
                      : data
                        ? 'border-slate-200/70 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-500/40'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${inMonth ? '' : 'opacity-35'}`}
                  aria-label={key}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {d.format('D')}
                  </span>
                  {data && (
                    <div className="mt-auto w-full space-y-0.5">
                      {data.income > 0 && (
                        <span className="block truncate rounded bg-green-100 px-1 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                          +{formatMoney(data.income, { compact: true })}
                        </span>
                      )}
                      {data.expense > 0 && (
                        <span className="block truncate rounded bg-red-100 px-1 py-0.5 text-[9px] font-bold text-red-600 dark:bg-red-500/15 dark:text-red-300">
                          -{formatMoney(data.expense, { compact: true })}
                        </span>
                      )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-green-400" /> Income</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-red-400" /> Expense</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-indigo-500" /> Selected</span>
          </div>
        </div>

        <div className="glass-card flex flex-col p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {selectedDay.format('dddd, D MMMM YYYY')}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-green-50 p-3 dark:bg-green-500/10">
              <p className="text-[10px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">Income</p>
              <p className="mt-1 text-lg font-extrabold text-green-700 dark:text-green-300">{formatMoney(selectedData?.income || 0)}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 dark:bg-red-500/10">
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Expense</p>
              <p className="mt-1 text-lg font-extrabold text-red-600 dark:text-red-300">{formatMoney(selectedData?.expense || 0)}</p>
            </div>
          </div>

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
            {!selectedData || selectedData.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                No transactions on this day.
              </div>
            ) : (
              selectedData.items.map((item, i) => {
                const meta = item.type === 'income'
                  ? INCOME_CATEGORY_META[item.category] || { bg: 'bg-green-100 dark:bg-green-500/15', color: '#22C55E', icon: ArrowDownToLine }
                  : EXPENSE_CATEGORY_META[item.category] || { bg: 'bg-red-100 dark:bg-red-500/15', color: '#EF4444', icon: ArrowUpFromLine }
                const Icon = meta.icon || (item.type === 'income' ? ArrowDownToLine : ArrowUpFromLine)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.category}</p>
                    </div>
                    <span className={`text-sm font-extrabold ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)}
                    </span>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
