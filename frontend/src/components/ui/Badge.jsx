export default function Badge({ children, color = 'indigo', dot = true, className = '' }) {
  const map = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    slate: 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  }
  const dotColor = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
    slate: 'bg-slate-500',
    cyan: 'bg-cyan-500',
    pink: 'bg-pink-500',
  }
  return (
    <span className={`chip ${map[color]} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor[color]}`} />}
      {children}
    </span>
  )
}
