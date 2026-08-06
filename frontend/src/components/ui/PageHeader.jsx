import { motion } from 'framer-motion'

export default function PageHeader({ title, subtitle, actions, gradientText }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl ${gradientText ? 'text-gradient' : ''}`}>
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </motion.div>
  )
}
