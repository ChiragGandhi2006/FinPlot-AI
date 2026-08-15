import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  Target,
  PiggyBank,
  ChartPie,
  Sparkles,
  FileText,
  CalendarDays,
  RefreshCw,
  Trophy,
  Settings,
  LogOut,
  X,
  Plane,
  FileUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Tooltip from '../ui/Tooltip'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Transactions',
    items: [
      { to: '/app/income', label: 'Income', icon: ArrowDownToLine },
      { to: '/app/expenses', label: 'Expenses', icon: ArrowUpFromLine },
    ],
  },
  {
    label: 'Planning',
    items: [
      { to: '/app/goals', label: 'Goals', icon: Target },
      { to: '/app/budgets', label: 'Budgets', icon: PiggyBank },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/app/analytics', label: 'Analytics', icon: ChartPie },
      { to: '/app/insights', label: 'AI Insights', icon: Sparkles },
      { to: '/app/statements', label: 'Statements', icon: FileUp },
      { to: '/app/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'Growth',
    items: [
      { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
      { to: '/app/subscriptions', label: 'Subscriptions', icon: RefreshCw },
      { to: '/app/achievements', label: 'Achievements', icon: Trophy },
    ],
  },
  {
    label: 'Account',
    items: [{ to: '/app/settings', label: 'Settings', icon: Settings }],
  },
]

export default function Sidebar({ collapsed, mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? 'justify-center' : ''}`}>
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 text-white shadow-glow">
          <Plane size={20} className="-rotate-45" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-tight text-white">FinPilot <span className="text-gradient">AI</span></p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Premium Finance</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{group.label}</p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <Tooltip content={item.label} side="right">
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            collapsed ? 'justify-center' : ''
                          } ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={19} strokeWidth={2.2} className="shrink-0 transition-transform group-hover:scale-110" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                            {isActive && !collapsed && (
                              <motion.span
                                layoutId="nav-pill"
                                className="absolute right-2 h-2 w-2 rounded-full bg-white/90"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    </Tooltip>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-sm font-bold text-white">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{user?.first_name} {user?.last_name}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={19} strokeWidth={2.2} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen shrink-0 bg-[#111827] transition-all duration-300 ease-out-expo ${
          collapsed ? 'w-[76px]' : 'w-[264px]'
        }`}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="absolute left-0 top-0 h-full w-[280px] bg-[#111827] shadow-2xl"
            >
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="absolute right-3 top-4 z-10 rounded-full p-2 text-slate-400 hover:bg-white/10"
              >
                <X size={18} />
              </button>
              <div className="h-full overflow-hidden pt-12">{content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
