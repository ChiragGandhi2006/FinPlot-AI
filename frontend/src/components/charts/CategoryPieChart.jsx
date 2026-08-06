import { motion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORY_COLOR_PALETTE, EXPENSE_CATEGORY_META } from '../../constants'
import { chartTooltipStyle, useChartTheme } from './theme'

export default function CategoryPieChart({ data, height = 300 }) {
  const theme = useChartTheme()
  const colorFor = (name) => EXPENSE_CATEGORY_META[name]?.color || CATEGORY_COLOR_PALETTE[Math.abs(name.length) % CATEGORY_COLOR_PALETTE.length]

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={chartTooltipStyle(theme)}
            formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
          />
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            innerRadius="62%"
            outerRadius="86%"
            paddingAngle={3}
            cornerRadius={6}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={colorFor(entry.category)} stroke="transparent" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
