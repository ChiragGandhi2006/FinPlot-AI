import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#111827] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-hero-dark" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute right-24 top-1/3 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 text-white shadow-glow">
            <Plane size={22} className="-rotate-45" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-xl font-extrabold text-white">FinPilot <span className="text-gradient">AI</span></p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Premium Finance</p>
          </div>
        </div>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg text-4xl font-extrabold leading-tight text-white xl:text-5xl"
          >
            Your money, <span className="text-gradient">on autopilot.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-md text-slate-400"
          >
            Track income & expenses, crush savings goals, and unlock AI-powered insights — all in one beautifully crafted dashboard.
          </motion.p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { value: 'AI', label: 'Smart insights' },
              { value: '₹', label: 'Smart tracking' },
              { value: '360°', label: 'Money vision' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
              >
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-400">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">© 2026 FinPilot AI · Fly your finances forward.</p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center bg-mesh px-4 py-12 dark:bg-[#0F172A] sm:px-8">
        <div className="absolute left-6 top-6 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-600 text-white shadow-glow">
            <Plane size={20} className="-rotate-45" strokeWidth={2.2} />
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">FinPilot <span className="text-gradient">AI</span></p>
        </div>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
