import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { axisStyle, chartTooltipStyle, useChartTheme } from './theme'

export default function WeeklySpendingChart({ data, height = 260 }) {
  const theme = useChartTheme()
  const max = Math.max(...data.map((d) => d.amount), 1)
  const avg = data.reduce((s, d) => s + d.amount, 0) / data.length

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={theme.grid} vertical={false} />
          <XAxis dataKey="day" {...axisStyle(theme)} />
          <YAxis {...axisStyle(theme)} width={40} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
          <Tooltip
            contentStyle={chartTooltipStyle(theme)}
            cursor={{ fill: theme.grid, opacity: 0.2 }}
            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spent']}
          />
          <ReferenceLine y={avg} stroke={theme.accent} strokeDasharray="6 4" strokeWidth={1.5} label={{ value: 'avg', fontSize: 10, fill: theme.accent, position: 'insideTopRight' }} />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={44} animationDuration={1100}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.amount === max ? '#4F46E5' : d.amount > avg ? '#8B5CF6' : '#6366F1'}
                fillOpacity={d.amount === 0 ? 0.25 : 0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
