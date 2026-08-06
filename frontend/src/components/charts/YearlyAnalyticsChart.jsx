import { motion } from 'framer-motion'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { axisStyle, chartTooltipStyle, useChartTheme } from './theme'

export default function YearlyAnalyticsChart({ data, height = 320 }) {
  const theme = useChartTheme()
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={theme.grid} vertical={false} />
          <XAxis dataKey="month" {...axisStyle(theme)} />
          <YAxis {...axisStyle(theme)} width={44} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
          <Tooltip
            contentStyle={chartTooltipStyle(theme)}
            cursor={{ fill: theme.grid, opacity: 0.2 }}
            formatter={(value, name) => [
              `₹${Number(value).toLocaleString('en-IN')}`,
              name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Savings',
            ]}
          />
          <Bar dataKey="income" fill="#22C55E" radius={[5, 5, 0, 0]} maxBarSize={14} animationDuration={1200} />
          <Bar dataKey="expense" fill="#EF4444" radius={[5, 5, 0, 0]} maxBarSize={14} animationDuration={1200} />
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#4F46E5"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            animationDuration={1200}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
