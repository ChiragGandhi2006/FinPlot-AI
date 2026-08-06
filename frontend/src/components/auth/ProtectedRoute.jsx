import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mesh dark:bg-[#0F172A]">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 text-white shadow-glow"
        >
          <Plane size={26} className="-rotate-45" strokeWidth={2.2} />
        </motion.div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Preparing your cockpit…</p>
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
