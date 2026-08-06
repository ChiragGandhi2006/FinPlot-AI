import { motion } from 'framer-motion'

export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow">
          <Icon size={34} strokeWidth={1.8} />
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
