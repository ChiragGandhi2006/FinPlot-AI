import { useState } from 'react'
import { Plus, Target, TrendingUp, Award } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import GoalCard from '../components/goals/GoalCard'
import GoalFormModal from '../components/goals/GoalFormModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { formatMoney } from '../utils/format'
import { avgMonthlySavings } from '../utils/analytics'
import AnimatedNumber from '../components/ui/AnimatedNumber'

export default function Goals() {
  const { goals, incomes, expenses, loading, addGoal, updateGoal, deleteGoal } = useData()
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const monthlySavings = avgMonthlySavings(incomes, expenses)
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0)
  const totalSaved = goals.reduce((s, g) => s + Number(g.saved_amount), 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0
  const completed = goals.filter((g) => g.saved_amount >= g.target_amount).length

  return (
    <div>
      <PageHeader
        title="Savings Goals"
        subtitle="Turn dreams into deadlines"
        actions={<Button icon={Plus} onClick={() => { setEditing(null); setModal('add') }}>Create Goal</Button>}
      />

      {goals.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Active Goals', value: goals.length, icon: Target, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300' },
            { label: 'Overall Progress', value: `${overallProgress.toFixed(0)}%`, icon: TrendingUp, color: 'text-green-600 bg-green-100 dark:bg-green-500/15 dark:text-green-300' },
            { label: 'Total Saved', value: formatMoney(totalSaved, { compact: true }), icon: Award, color: 'text-amber-600 bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300' },
            { label: 'Achieved', value: completed, icon: Award, color: 'text-violet-600 bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300' },
          ].map((s) => (
            <div key={s.label} className="glass-card flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon size={19} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold leading-tight text-slate-900 dark:text-white">
                  {typeof s.value === 'number' && s.label === 'Total Saved' ? <AnimatedNumber value={totalSaved} formattingFn={(v) => formatMoney(v, { compact: true })} /> : s.value}
                </p>
                <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-80 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Create a savings goal like a MacBook, a trip to Europe, or an emergency fund — and watch FinPilot help you track it."
            action={<Button icon={Plus} onClick={() => setModal('add')}>Create your first goal</Button>}
          />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.goal_id}
              goal={goal}
              index={i}
              monthlySavings={monthlySavings}
              onEdit={(g) => {
                setEditing(g)
                setModal('edit')
              }}
              onDelete={(g) => setDeleting(g)}
              onUpdate={updateGoal}
            />
          ))}
        </div>
      )}

      <GoalFormModal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        goal={modal === 'edit' ? editing : null}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete goal?"
        message={`This will permanently remove "${deleting?.goal_name}".`}
        onConfirm={async () => {
          await deleteGoal(deleting.goal_id)
          setDeleting(null)
        }}
      />
    </div>
  )
}
