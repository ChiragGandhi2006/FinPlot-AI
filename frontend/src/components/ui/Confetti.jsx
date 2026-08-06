import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#4F46E5', '#7C3AED', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899']

export default function Confetti({ trigger, count = 80 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.4,
        rotation: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 120,
      })),
    [count, trigger]
  )

  if (!trigger) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, y: '-10vh', x: `${p.x}vw`, rotate: 0 }}
          animate={{ opacity: [1, 1, 0], y: '110vh', x: `${p.x + p.drift}vw`, rotate: p.rotation * 6 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
          className="absolute rounded-[2px]"
        />
      ))}
    </div>
  )
}
