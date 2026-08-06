import { useTheme } from '../../context/ThemeContext'

export function useChartTheme() {
  const { dark } = useTheme()
  return {
    grid: dark ? '#1e293b' : '#e2e8f0',
    axis: dark ? '#94a3b8' : '#64748b',
    tooltipBg: dark ? '#1e293b' : '#ffffff',
    tooltipBorder: dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
    tooltipText: dark ? '#e2e8f0' : '#0f172a',
    income: '#22C55E',
    expense: '#EF4444',
    savings: '#4F46E5',
    balance: '#8B5CF6',
    accent: '#F59E0B',
  }
}

export function chartTooltipStyle(theme, extra = {}) {
  return {
    backgroundColor: theme.tooltipBg,
    border: `1px solid ${theme.tooltipBorder}`,
    borderRadius: '16px',
    boxShadow: '0 12px 40px -8px rgba(15,23,42,0.2)',
    fontSize: '12px',
    fontWeight: 600,
    color: theme.tooltipText,
    ...extra,
  }
}

export function axisStyle(theme) {
  return {
    tick: { fontSize: 11, fill: theme.axis, fontWeight: 500 },
    axisLine: { stroke: theme.grid },
    tickLine: false,
  }
}
