import { motion } from 'framer-motion'
import { Sparkles, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { INSIGHT_ICONS } from '../../constants'
import Skeleton from 'react-loading-skeleton'

export default function InsightCard({ insight, index, loading }) {
  const navigate = useNavigate()
  const meta = INSIGHT_ICONS[insight?.type] || INSIGHT_ICONS.tip
  const Icon = meta.icon

  const border = {
    positive: 'hover:border-green-400/50',
    warning: 'hover:border-amber-400/50',
    danger: 'hover:border-red-400/50',
    goal: 'hover:border-indigo-400/50',
    tip: 'hover:border-violet-400/50',
  }[insight?.type] || ''

  if (loading) return <Skeleton height={120} containerClassName="flex-1 min-w-[260px]" />

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      whileHover={{ y: -4 }}
      onClick={() => navigate('/app/insights')}
      className={`glass-card group flex min-w-[280px] flex-col gap-3 border-2 border-transparent p-5 text-left transition-all duration-300 hover:shadow-lift ${border}`}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
        >
          <Icon size={19} strokeWidth={2.2} />
        </div>
        <ChevronRight size={16} className="text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-slate-600" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{insight.title}</h4>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{insight.message}</p>
      </div>
    </motion.button>
  )
}

export function InsightsHeader() {
  return (
    <div className="flex items-center gap-2">
      <Sparkles size={18} className="text-indigo-500" />
      <h2 className="text-base font-bold text-slate-900 dark:text-white">Smart Insights</h2>
    </div>
  )
}
