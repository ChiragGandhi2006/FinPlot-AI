import { motion } from 'framer-motion'
import { Trophy, Lock } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'

export default function Achievements() {
  const { achievements, unlockedAchievements, streak, savingsRate, incomeStreak, budgetMaster } = useData()

  const earnedCount = unlockedAchievements.length
  const totalPoints = achievements
    .filter((a) => unlockedAchievements.includes(a.id))
    .reduce((s, a) => s + a.points, 0)
  const progress = (earnedCount / achievements.length) * 100

  const livePreview = { streak, savingsRate, incomeStreak, budgetMaster }

  return (
    <div>
      <PageHeader title="Achievements" subtitle="Gamify your money journey — earn badges as you level up" />

      <div className="mb-6 flex flex-col gap-4 rounded-card bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-lift sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Trophy size={26} />
          </div>
          <div>
            <p className="text-2xl font-extrabold">{earnedCount} / {achievements.length} unlocked</p>
            <p className="text-sm text-white/70">{totalPoints} points earned</p>
          </div>
        </div>
        <div className="w-full sm:w-64">
          <div className="mb-1.5 flex justify-between text-xs font-bold text-white/80">
            <span>Level progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {achievements.map((a, i) => {
          const unlocked = unlockedAchievements.includes(a.id)
          const Icon = a.icon
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={unlocked ? { y: -4 } : undefined}
              className={`glass-card relative overflow-hidden p-5 transition ${
                unlocked ? 'border-2 border-amber-300/60 dark:border-amber-400/40' : 'opacity-70'
              }`}
            >
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] dark:bg-slate-900/50">
                  <div className="flex flex-col items-center gap-2">
                    <Lock size={22} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Locked</span>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ backgroundColor: unlocked ? a.color : '#94a3b8' }}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>
                {unlocked && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white">
                    <Trophy size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
              <h3 className="mt-3 font-extrabold text-slate-900 dark:text-white">{a.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{a.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge color={unlocked ? 'amber' : 'slate'} dot={false}>+{a.points} pts</Badge>
                {unlocked && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg" role="img" aria-label="achieved">
                    🏆
                  </motion.span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
