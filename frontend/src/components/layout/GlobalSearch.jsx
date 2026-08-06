import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowDownToLine, ArrowUpFromLine, Target, FileText, CornerDownLeft } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useDebounce } from '../../hooks/useDebounce'
import { formatMoney, formatDate } from '../../utils/format'
import { EXPENSE_CATEGORY_META, INCOME_CATEGORY_META } from '../../constants'

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate()
  const { incomes, expenses, goals, incomeCategories, expenseCategories } = useData()
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 150)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const results = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return []
    const icat = {}
    incomeCategories.forEach((c) => {
      icat[c.category_id] = c.category_name
    })
    const ecat = {}
    expenseCategories.forEach((c) => {
      ecat[c.category_id] = c.category_name
    })
    const match = (v) => String(v || '').toLowerCase().includes(q)

    const incomeResults = incomes
      .filter((i) => match(i.source) || match(icat[i.category_id]) || match(i.payment_method))
      .slice(0, 4)
      .map((i) => ({
        id: `i${i.income_id}`,
        type: 'income',
        title: i.source,
        subtitle: `${icat[i.category_id] || 'Income'} · ${formatDate(i.income_date)}`,
        amount: i.amount,
        to: '/app/income',
      }))

    const expenseResults = expenses
      .filter((e) => match(e.merchant) || match(ecat[e.category_id]) || match(e.payment_method))
      .slice(0, 4)
      .map((e) => ({
        id: `e${e.expense_id}`,
        type: 'expense',
        title: e.merchant,
        subtitle: `${ecat[e.category_id] || 'Expense'} · ${formatDate(e.expense_date)}`,
        amount: e.amount,
        to: '/app/expenses',
      }))

    const goalResults = goals
      .filter((g) => match(g.goal_name))
      .slice(0, 4)
      .map((g) => ({
        id: `g${g.goal_id}`,
        type: 'goal',
        title: g.goal_name,
        subtitle: `Goal · ${formatMoney(g.saved_amount)} of ${formatMoney(g.target_amount)}`,
        amount: g.target_amount,
        to: '/app/goals',
      }))

    const reportResults = [
      {
        id: 'report-pdf',
        type: 'report',
        title: 'Monthly PDF Report',
        subtitle: 'Download your monthly financial report',
        amount: null,
        to: '/app/reports',
      },
    ]

    return [...incomeResults, ...expenseResults, ...goalResults, ...reportResults]
  }, [debounced, incomes, expenses, goals, incomeCategories, expenseCategories])

  const icons = {
    income: { Icon: ArrowDownToLine, cls: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300' },
    expense: { Icon: ArrowUpFromLine, cls: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' },
    goal: { Icon: Target, cls: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300' },
    report: { Icon: FileText, cls: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="glass-card relative z-10 w-full max-w-xl overflow-hidden bg-white/95 p-2 dark:bg-slate-900/95"
            role="dialog"
            aria-label="Global search"
          >
            <div className="flex items-center gap-3 px-3 py-2">
              <Search size={20} className="text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search income, expenses, goals, reports…"
                className="w-full bg-transparent py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <kbd className="hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 sm:block dark:border-slate-700">
                ESC
              </kbd>
            </div>
            <div className="mt-1 max-h-[42vh] overflow-y-auto">
              {debounced && results.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No results found for "{debounced}"</p>
              )}
              {!debounced && (
                <p className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  Start typing to search across your finances
                </p>
              )}
              {results.map((r) => {
                const { Icon, cls } = icons[r.type]
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      onClose()
                      navigate(r.to)
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}>
                      <Icon size={17} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{r.title}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{r.subtitle}</p>
                    </div>
                    {r.amount !== null && (
                      <span className={`text-sm font-bold ${r.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                        {formatMoney(r.amount)}
                      </span>
                    )}
                    <CornerDownLeft size={14} className="text-slate-300 opacity-0 transition group-hover:opacity-100 dark:text-slate-600" />
                  </button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
