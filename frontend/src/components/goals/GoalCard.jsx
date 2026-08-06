import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { Trophy, Target, Pencil, Trash2, CalendarClock, Rocket, Sparkles, PiggyBank } from 'lucide-react'
import { goalForecast, goalDaysLeft } from '../../utils/analytics'
import { formatMoney, formatDate } from '../../utils/format'
import ProgressBar from '../ui/ProgressBar'
import Confetti from '../ui/Confetti'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input } from '../ui/Input'
import toast from 'react-hot-toast'

const QUOTES = [
  'A goal without a plan is just a wish.',
  'Dreams don\'t work unless you do.',
  'Small steps every day lead to big results.',
  'Discipline is choosing what you want most over what you want now.',
  'Saving money is a form of freedom.',
  'The secret to getting ahead is getting started.',
]

const GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
]

function progressOf(goal) {
  return goal.target_amount > 0 ? Math.min((goal.saved_amount / goal.target_amount) * 100, 100) : 0
}

export default function GoalCard({ goal, index, monthlySavings, onEdit, onDelete, onUpdate }) {
  const progress = progressOf(goal)
  const completed = progress >= 100
  const forecast = goalForecast(goal, monthlySavings || 0)
  const daysLeft = goalDaysLeft(goal)
  const quote = QUOTES[goal.goal_id % QUOTES.length]
  const gradient = GRADIENTS[goal.goal_id % GRADIENTS.length]
  const [addModal, setAddModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [confetti, setConfetti] = useState(false)
  const prevProgress = useRef(progress)

  useEffect(() => {
    if (progress >= 100 && prevProgress.current < 100) {
      setConfetti(true)
      toast.success(`🎉 Goal achieved: ${goal.goal_name}!`)
      setTimeout(() => setConfetti(false), 3500)
    }
    prevProgress.current = progress
  }, [progress, goal.goal_name])

  const addSavings = async (e) => {
    e.preventDefault()
    const val = Number(amount)
    if (!val || val <= 0) return
    await onUpdate(goal.goal_id, { saved_amount: Number(goal.saved_amount) + val })
    setAddModal(false)
    setAmount('')
  }

  return (
    <>
      <Confetti trigger={confetti} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.45 }}
        whileHover={{ y: -4 }}
        className="glass-card card-hover relative flex flex-col overflow-hidden p-6"
      >
        <div className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
              <Target size={22} strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-extrabold text-slate-900 dark:text-white">{goal.goal_name}</h3>
              {completed ? (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <Trophy size={11} /> Achieved
                </span>
              ) : (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                  <CalendarClock size={12} />
                  {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(goal)} aria-label="Edit goal" className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10">
              <Pencil size={15} />
            </button>
            <button onClick={() => onDelete(goal)} aria-label="Delete goal" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <div className="h-24 w-24 shrink-0">
            <CircularProgressbar
              value={progress}
              text={`${Math.round(progress)}%`}
              styles={buildStyles({
                rotation: 0.25,
                textSize: '16px',
                pathColor: completed ? '#22C55E' : '#4F46E5',
                textColor: completed ? '#22C55E' : '#4F46E5',
                trailColor: 'rgba(100,116,139,0.15)',
                pathTransitionDuration: 1.2,
              })}
            />
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Target</p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{formatMoney(goal.target_amount, { compact: true })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Saved</p>
              <p className="text-sm font-extrabold text-green-600 dark:text-green-400">{formatMoney(goal.saved_amount, { compact: true })}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Remaining</p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{formatMoney(Math.max(goal.target_amount - goal.saved_amount, 0), { compact: true })}</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={goal.saved_amount} max={goal.target_amount} gradient={!completed} color={completed ? '#22C55E' : undefined} height="h-2.5" />
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {forecast.months !== null && !completed ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Rocket size={13} />
              Est. completion in {forecast.months} month{forecast.months > 1 ? 's' : ''}
            </p>
          ) : completed ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
              <Trophy size={13} /> Fully funded — congratulations!
            </p>
          ) : (
            <p className="text-xs italic text-slate-400">"{quote}"</p>
          )}
          <p className="text-[10px] font-semibold text-slate-400">by {formatDate(goal.target_date)}</p>
        </div>

        {!completed && (
          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" variant="secondary" icon={PiggyBank} onClick={() => setAddModal(true)} className="flex-1">
              Add Savings
            </Button>
            <p className="text-[11px] font-semibold text-slate-400">
              Target: {formatDate(goal.target_date)}
            </p>
          </div>
        )}
      </motion.div>

      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title={`Add savings to ${goal.goal_name}`}
        subtitle="Every contribution gets you closer"
        icon={Sparkles}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" form="add-savings">Add Savings</Button>
          </>
        }
      >
        <form id="add-savings" onSubmit={addSavings} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            required
          />
          <div className="rounded-xl bg-indigo-50 p-3 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            Saved so far: {formatMoney(goal.saved_amount)} of {formatMoney(goal.target_amount)}
          </div>
        </form>
      </Modal>
    </>
  )
}
