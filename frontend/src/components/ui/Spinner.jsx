import { motion } from 'framer-motion'

export default function Spinner({ size = 24, color = 'text-indigo-500' }) {
  return (
    <motion.div
      className={`inline-block ${color}`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      role="status"
      aria-label="Loading"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}
