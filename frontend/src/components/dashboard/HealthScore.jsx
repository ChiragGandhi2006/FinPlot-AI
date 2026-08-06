import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { motion } from 'framer-motion'
import { Activity, Sparkles } from 'lucide-react'
import { healthTier } from '../../utils/analytics'

export default function HealthScore({ score }) {
  const tier = healthTier(score || 0)
  const gradientId = 'healthGradient'

  return (
    <div className="glass-card relative overflow-hidden p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-transparent to-emerald-50/60 dark:from-indigo-500/10 dark:to-emerald-500/10" />
      <div className="relative flex items-center gap-6">
        <div className="relative h-32 w-32 shrink-0">
          <CircularProgressbar
            value={score || 0}
            text={`${score || 0}`}
            styles={buildStyles({
              rotation: 0.25,
              textSize: '30px',
              pathColor: `url(#${gradientId})`,
              textColor: tier.color,
              trailColor: 'rgba(100,116,139,0.15)',
              pathTransitionDuration: 1.4,
            })}
          />
          <svg width="0" height="0">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor={tier.color} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity size={16} className="mt-16 text-slate-400" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Financial Health</h3>
          </div>
          <motion.p
            key={tier.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-2xl font-extrabold"
            style={{ color: tier.color }}
          >
            {tier.label}
          </motion.p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tier.message}</p>
        </div>
      </div>
    </div>
  )
}
