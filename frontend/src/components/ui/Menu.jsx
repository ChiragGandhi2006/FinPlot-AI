import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useClickOutside } from '../../hooks/useClickOutside'

export default function Menu({ trigger, items, align = 'right', width = 'w-56' }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`glass-card absolute z-50 mt-2 overflow-hidden bg-white/95 p-1.5 dark:bg-slate-900/95 ${align === 'right' ? 'right-0' : 'left-0'} ${width}`}
          >
            {items.map((item, i) => {
              const Icon = item.icon
              const color = item.color || (item.danger ? 'text-red-500' : 'text-slate-700 dark:text-slate-200')
              const hoverColor = item.danger
                ? 'hover:bg-red-50 dark:hover:bg-red-500/10'
                : 'hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
              return (
                <button
                  key={i}
                  onClick={() => {
                    setOpen(false)
                    item.onClick?.()
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${color} ${hoverColor}`}
                >
                  {Icon && <Icon size={17} strokeWidth={2} />}
                  {item.label}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
