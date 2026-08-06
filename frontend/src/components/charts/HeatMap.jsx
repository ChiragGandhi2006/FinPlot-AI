import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import { useTheme } from '../../context/ThemeContext'
import { formatMoney } from '../../utils/format'
import Tooltip from '../ui/Tooltip'

function heatColor(intensity, dark) {
  if (intensity === 0) return dark ? '#1e293b' : '#e2e8f0'
  const stops = [
    [238, 242, 255],
    [199, 210, 254],
    [129, 140, 248],
    [99, 102, 241],
    [79, 70, 229],
    [49, 46, 129],
  ]
  const idx = Math.min(Math.floor(intensity * (stops.length - 1)), stops.length - 1)
  const [r, g, b] = stops[idx]
  return `rgb(${r}, ${g}, ${b})`
}

export default function HeatMap({ weeks, className = '' }) {
  const { dark } = useTheme()
  const todayKey = dayjs().format('YYYY-MM-DD')

  return (
    <div className={`hide-scrollbar overflow-x-auto ${className}`}>
      <div className="inline-flex flex-col gap-2">
        <div className="flex gap-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="w-8 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              {d}
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          {weeks.map((week, w) => (
            <div key={w} className="flex flex-col gap-1.5">
              {week.map((day, d) => (
                <Tooltip
                  key={d}
                  side="top"
                  content={
                    <span>
                      <b>{day.amount ? formatMoney(day.amount) : 'No spending'}</b>{' '}
                      <span className="opacity-70">{dayjs(day.date).format('D MMM')}</span>
                    </span>
                  }
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (w * 7 + d) * 0.004 }}
                    whileHover={{ scale: 1.35 }}
                    className={`h-8 w-8 rounded-[7px] transition-colors ${day.date === todayKey ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: heatColor(day.intensity, dark) }}
                    aria-label={`${day.date}: ${day.amount}`}
                  />
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-slate-400">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <span key={i} className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: heatColor(i, dark) }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
