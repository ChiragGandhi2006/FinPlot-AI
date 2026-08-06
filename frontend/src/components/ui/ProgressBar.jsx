export default function ProgressBar({ value, max = 100, color, className = '', height = 'h-2', gradient }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const style = gradient
    ? { background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #06B6D4)' }
    : color
      ? { background: color }
      : undefined
  return (
    <div className={`w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/50 ${height} ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all duration-700 ease-out-expo" style={{ width: `${pct}%`, ...style }} />
    </div>
  )
}
