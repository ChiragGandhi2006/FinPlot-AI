export default function Avatar({ user, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-2xl',
  }
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U'
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-900 ${sizes[size]} ${className}`}
      aria-label={`${user?.first_name || 'User'} avatar`}
    >
      {initials}
    </div>
  )
}
