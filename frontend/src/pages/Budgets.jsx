import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, PiggyBank, AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Input, Select } from '../components/ui/Input'
import { formatMoney } from '../utils/format'
import { BUDGET_CATEGORIES, EXPENSE_CATEGORY_META } from '../constants'
import ProgressBar from '../components/ui/ProgressBar'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { LS_KEYS } from '../constants'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

function budgetStatus(spent, limit) {
  if (!limit) return { color: 'slate', label: 'Unlimited', pct: 0 }
  const pct = (spent / limit) * 100
  if (pct > 100) return { color: 'red', label: 'Exceeded', pct }
  if (pct >= 80) return { color: 'amber', label: 'Almost there', pct }
  return { color: 'green', label: 'On track', pct }
}

export default function Budgets() {
  const { expenses, expenseCategories } = useData()
  const [budgets, setBudgets] = useLocalStorage(LS_KEYS.budgets, BUDGET_CATEGORIES)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ category: '', limit: '' })

  const catName = {}
  expenseCategories.forEach((c) => {
    catName[c.category_id] = c.category_name
  })
  const nowMonth = expenses.filter((e) => dayjs(e.expense_date).format('YYYY-MM') === dayjs().format('YYYY-MM'))

  const spentFor = (category) =>
    nowMonth
      .filter((e) => catName[e.category_id] === category || e.category_name === category)
      .reduce((s, e) => s + Number(e.amount), 0)

  const totalLimit = budgets.reduce((s, b) => s + Number(b.limit || 0), 0)
  const totalSpent = budgets.reduce((s, b) => s + spentFor(b.category), 0)
  const exceeded = budgets.filter((b) => spentFor(b.category) > Number(b.limit || 0)).length

  const openAdd = () => {
    setEditing(null)
    setForm({ category: BUDGET_CATEGORIES[0], limit: '5000' })
    setModal('add')
  }
  const openEdit = (b) => {
    setEditing(b)
    setForm({ category: b.category, limit: String(b.limit) })
    setModal('edit')
  }
  const save = (e) => {
    e.preventDefault()
    if (editing) {
      setBudgets(budgets.map((b) => (b.id === editing.id ? { ...b, category: form.category, limit: Number(form.limit) || 0 } : b)))
      toast.success('Budget updated')
    } else {
      setBudgets([...budgets, { id: form.category.toLowerCase().replace(/\s+/g, '-'), category: form.category, limit: Number(form.limit) || 0 }])
      toast.success('Budget created')
    }
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Budget Tracker"
        subtitle="Stay in control of every category"
        actions={<Button icon={Plus} onClick={openAdd}>Add Budget</Button>}
      />

      {budgets.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Monthly Limit', value: formatMoney(totalLimit), cls: 'from-indigo-500 to-violet-600' },
            { label: 'Spent', value: formatMoney(totalSpent), cls: 'from-rose-500 to-red-600' },
            { label: 'Exceeded', value: exceeded, cls: 'from-amber-500 to-orange-600' },
          ].map((s) => (
            <div key={s.label} className="glass-card flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.cls} text-white`}>
                <PiggyBank size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map((b, i) => {
          const meta = EXPENSE_CATEGORY_META[b.category] || { icon: PiggyBank, bg: 'bg-slate-100 dark:bg-slate-700', color: '#64748B' }
          const Icon = meta.icon
          const spent = spentFor(b.category)
          const status = budgetStatus(spent, b.limit)
          const remaining = (b.limit || 0) - spent
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                status.color === 'red' ? 'ring-2 ring-red-400/50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${meta.bg}`}>
                    <Icon size={20} style={{ color: meta.color }} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white">{b.category}</h3>
                    <p className="text-xs font-semibold text-slate-400">Budget: {formatMoney(b.limit)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(b)} aria-label="Edit budget" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleting(b)} aria-label="Delete budget" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {status.color === 'red' && (
                <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                  <AlertTriangle size={14} />
                  Exceeded by {formatMoney(Math.abs(remaining))}
                </div>
              )}

              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">{formatMoney(spent)}</span>
                  <span className="font-semibold text-slate-400">of {formatMoney(b.limit)}</span>
                </div>
                <ProgressBar
                  value={spent}
                  max={b.limit || 1}
                  height="h-2.5"
                  color={status.color === 'green' ? '#22C55E' : status.color === 'amber' ? '#F59E0B' : '#EF4444'}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
                <span className={status.color === 'green' ? 'text-green-600 dark:text-green-400' : status.color === 'amber' ? 'text-amber-600 dark:text-amber-300' : 'text-red-500'}>
                  {status.label} · {Math.round(status.pct)}%
                </span>
                {b.limit > 0 && (
                  <span className={remaining >= 0 ? 'text-slate-500 dark:text-slate-400' : 'text-red-500'}>
                    {remaining >= 0 ? `${formatMoney(remaining)} left` : 'Over budget'}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={editing ? 'Edit Budget' : 'Add Budget'}
        subtitle="Set a spending limit for a category"
        icon={PiggyBank}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" form="budget-form">Save Budget</Button>
          </>
        }
      >
        <form id="budget-form" onSubmit={save} className="space-y-4">
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {BUDGET_CATEGORIES.filter(
              (c) => !budgets.some((b) => b.category === c) || (editing && editing.category === c)
            ).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Input
            label="Monthly Limit"
            type="number"
            min="0"
            value={form.limit}
            onChange={(e) => setForm({ ...form, limit: e.target.value })}
            required
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete budget?"
        message={`This will remove the "${deleting?.category}" budget.`}
        onConfirm={() => {
          setBudgets(budgets.filter((b) => b.id !== deleting.id))
          setDeleting(null)
          toast.success('Budget removed')
        }}
      />
    </div>
  )
}
