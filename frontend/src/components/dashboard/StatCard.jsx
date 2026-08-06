import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import AnimatedNumber from '../ui/AnimatedNumber'
import { formatMoney } from '../../utils/format'

export default function StatCard({ title, value, icon: Icon, gradient, change, loading = false, onClick, spark }) {
  const positive = (change ?? 0) >= 0
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card card-hover relative w-full overflow-hidden p-5 text-left sm:p-6"
      aria-label={title}
    >
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.07] blur-2xl ${gradient}`} />
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
          {loading ? (
            <Skeleton height={30} width={120} className="mt-2" />
          ) : (
            <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              <AnimatedNumber value={value} formattingFn={(v) => formatMoney(v)} duration={1.4} />
            </p>
          )}
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`flex items-center gap-0.5 text-xs font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>
                {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-[11px] font-medium text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          <Icon size={21} strokeWidth={2.1} />
        </div>
      </div>
    </motion.button>
  )
}
