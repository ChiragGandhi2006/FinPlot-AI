import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { axisStyle, chartTooltipStyle, useChartTheme } from './theme'

export default function IncomeExpenseBarChart({ data, height = 300 }) {
  const theme = useChartTheme()
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={theme.grid} vertical={false} />
          <XAxis dataKey="month" {...axisStyle(theme)} />
          <YAxis {...axisStyle(theme)} width={44} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
          <Tooltip
            contentStyle={chartTooltipStyle(theme)}
            cursor={{ fill: theme.grid, opacity: 0.25 }}
            formatter={(value, name) => [
              `₹${Number(value).toLocaleString('en-IN')}`,
              name === 'income' ? 'Income' : 'Expense',
            ]}
          />
          <Bar
            dataKey="income"
            fill="#22C55E"
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="expense"
            fill="#EF4444"
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
