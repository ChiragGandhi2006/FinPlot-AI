import { motion } from 'framer-motion'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EXPENSE_CATEGORY_META, INCOME_CATEGORY_META } from '../../constants'
import { formatMoney, formatDate, timeAgo } from '../../utils/format'
import EmptyState from '../ui/EmptyState'
import Skeleton from 'react-loading-skeleton'

export default function RecentTransactions({ transactions, loading, incomeCategories, expenseCategories }) {
  const navigate = useNavigate()

  const catName = {}
  incomeCategories.forEach((c) => {
    catName[`i-${c.category_id}`] = c.category_name
  })
  expenseCategories.forEach((c) => {
    catName[`e-${c.category_id}`] = c.category_name
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton circle height={40} width={40} />
            <div className="flex-1">
              <Skeleton height={14} width={140} />
              <Skeleton height={11} width={90} />
            </div>
            <Skeleton height={16} width={70} />
          </div>
        ))}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <EmptyState
        icon={ArrowDownToLine}
        title="No transactions yet"
        description="Your recent income and expenses will show up here as you record them."
      />
    )
  }

  return (
    <div className="space-y-1">
      {transactions.map((t, i) => {
        const meta =
          t.type === 'income'
            ? INCOME_CATEGORY_META[catName[`i-${t.category_id}`]] || { color: '#22C55E', bg: 'bg-green-100 dark:bg-green-500/15' }
            : EXPENSE_CATEGORY_META[catName[`e-${t.category_id}`]] || { color: '#EF4444', bg: 'bg-red-100 dark:bg-red-500/15' }
        const Icon = t.type === 'income' ? ArrowDownToLine : ArrowUpFromLine
        return (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(t.type === 'income' ? '/app/income' : '/app/expenses')}
            className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
              <Icon size={18} strokeWidth={2.2} style={{ color: meta.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{t.title}</p>
              <p className="truncate text-xs text-slate-400">
                {t.category} · {formatDate(t.date)}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-extrabold ${t.type === 'income' ? 'text-green-600' : 'text-slate-800 dark:text-slate-100'}`}>
                {t.type === 'income' ? '+' : '-'}
                {formatMoney(t.amount)}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">{timeAgo(t.created_at)}</p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
