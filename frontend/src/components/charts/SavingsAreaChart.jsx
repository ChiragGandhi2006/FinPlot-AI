import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { axisStyle, chartTooltipStyle, useChartTheme } from './theme'

export default function SavingsAreaChart({ data, height = 280 }) {
  const theme = useChartTheme()
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke={theme.grid} vertical={false} />
          <XAxis dataKey="month" {...axisStyle(theme)} />
          <YAxis {...axisStyle(theme)} width={44} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
          <Tooltip
            contentStyle={chartTooltipStyle(theme)}
            cursor={{ stroke: theme.grid }}
            formatter={(value, name) => [
              `₹${Number(value).toLocaleString('en-IN')}`,
              name === 'savings' ? 'Savings' : name === 'balance' ? 'Balance' : name,
            ]}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#4F46E5"
            strokeWidth={3}
            fill="url(#savingsFill)"
            animationDuration={1400}
            animationEasing="ease-out"
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            fill="url(#balanceFill)"
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
