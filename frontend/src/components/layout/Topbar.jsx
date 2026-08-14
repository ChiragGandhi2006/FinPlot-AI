import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  PanelLeft,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useData } from '../../context/DataContext'
import { greeting, todayLabel } from '../../utils/format'
import Avatar from '../ui/Avatar'
import Tooltip from '../ui/Tooltip'
import NotificationsPanel from './NotificationsPanel'
import GlobalSearch from './GlobalSearch'
import { useClickOutside } from '../../hooks/useClickOutside'

export default function Topbar({ onToggleSidebar, onOpenMobile }) {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { notifications } = useData()
  const navigate = useNavigate()

  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useClickOutside(() => setProfileOpen(false))

  const unread = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/60">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={onOpenMobile}
          aria-label="Open menu"
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <Tooltip content={dark ? 'Light mode' : 'Dark mode'} side="bottom">
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="hidden rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:block"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {dark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </Tooltip>
        <Tooltip content="Toggle sidebar" side="bottom">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="hidden rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:block"
          >
            <PanelLeft size={20} />
          </button>
        </Tooltip>

        <button
          onClick={() => setSearchOpen(true)}
          className="group mx-auto flex w-full max-w-md items-center gap-2.5 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-400 shadow-soft transition hover:border-indigo-300 hover:shadow-glow dark:border-slate-700 dark:bg-slate-800/60"
        >
          <Search size={16} className="text-slate-400 transition group-hover:text-indigo-500" />
          <span className="truncate">Search your finances…</span>
          <kbd className="ml-auto hidden rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 sm:block dark:border-slate-600">
            /
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden text-right lg:block">
            <p className="text-sm font-bold leading-tight text-slate-800 dark:text-white">
              {greeting()}, {user?.first_name || 'there'}
            </p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{todayLabel()}</p>
          </div>

          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Notifications"
              className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full p-1 transition hover:ring-2 hover:ring-indigo-400/50"
              aria-label="Profile menu"
            >
              <Avatar user={user} size="sm" />
              <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card absolute right-0 top-12 z-50 w-60 overflow-hidden bg-white/95 p-1.5 dark:bg-slate-900/95"
                >
                  <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-800">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      navigate('/app/settings')
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-indigo-500/10"
                  >
                    <User size={17} /> Profile & Settings
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      const data = exportBackup(getItem(LS_KEYS.budgets, DEFAULTS_BUDGETS))
                      if (data) {
                        alert('Budget backup exported! You can import it later from the backup file.')
                      }
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-indigo-500/10"
                  >
                    <Sparkles size={17} /> Backup Budgets
                  </button>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-indigo-500/10 sm:hidden"
                  >
                    {dark ? <Sun size={17} /> : <Moon size={17} />}{" "}Toggle Theme
                  </button>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-indigo-500/10 sm:hidden"
                  >
                    Toggle Theme
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false)
                      navigate('/app/insights')
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-indigo-500/10"
                  >
                    <Sparkles size={17} /> AI Insights
                  </button>
                  <button
                    onClick={toggle}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 dark:text-slate-200 dark:hover:bg-indigo-500/10 sm:hidden"
                  >
                    {dark ? <Sun size={17} /> : <Moon size={17} />} Toggle Theme
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <LogOut size={17} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
