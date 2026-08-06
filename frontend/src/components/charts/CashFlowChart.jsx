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

export default function CashFlowChart({ data, height = 300 }) {
  const theme = useChartTheme()
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
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
              name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net',
            ]}
          />
          <Area type="monotone" dataKey="income" stroke="#22C55E" strokeWidth={2.5} fill="url(#incomeFlow)" animationDuration={1300} />
          <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} fill="url(#expenseFlow)" animationDuration={1300} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
