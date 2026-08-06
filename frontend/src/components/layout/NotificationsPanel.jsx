import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, Trash2, CheckCheck, Wallet, Target, PiggyBank, TrendingUp } from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { timeAgo } from '../../utils/format'

const TYPE_META = {
  budget: { Icon: PiggyBank, cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
  goal: { Icon: Target, cls: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300' },
  summary: { Icon: TrendingUp, cls: 'bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300' },
  alert: { Icon: BellRing, cls: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' },
  default: { Icon: Wallet, cls: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
}

export default function NotificationsPanel({ open, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useData()
  const ref = useClickOutside(onClose)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative" ref={ref}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card absolute right-0 top-12 z-50 w-[min(92vw,360px)] overflow-hidden bg-white/95 p-0 dark:bg-slate-900/95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                {unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={markAllNotificationsRead}
                  aria-label="Mark all as read"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                >
                  <CheckCheck size={15} />
                </button>
                <button
                  onClick={clearNotifications}
                  aria-label="Clear notifications"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {notifications.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={28} />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">No new notifications.</p>
                </div>
              )}
              {notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.default
                const Icon = meta.Icon
                return (
                  <button
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      n.read ? 'opacity-55' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.cls}`}>
                      <Icon size={17} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold leading-snug text-slate-800 dark:text-slate-100">{n.title}</p>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">{n.message}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
