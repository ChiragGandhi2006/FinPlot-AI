import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Home, ArrowLeft } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-6 dark:bg-[#0F172A]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card relative max-w-lg p-10 text-center"
      >
        <div className="absolute inset-0 overflow-hidden rounded-card">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        </div>
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 text-white shadow-glow"
          >
            <Compass size={46} strokeWidth={1.8} />
          </motion.div>
          <p className="mt-6 text-7xl font-extrabold text-gradient">404</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">Lost in the clouds</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            The page you're looking for doesn't exist or has been moved. Let's get you back on course.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link to="/app/dashboard">
              <Button icon={Home}>Back to Dashboard</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" icon={ArrowLeft}>Sign In</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
