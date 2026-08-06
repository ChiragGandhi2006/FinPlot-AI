import { useState } from 'react'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import { Plus, Pencil, Trash2, RefreshCw, Bell, BellOff } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Input, Select } from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { formatMoney, formatDate } from '../utils/format'
import { SUBSCRIPTION_ICONS } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { LS_KEYS } from '../constants'
import toast from 'react-hot-toast'

const PLANS = ['Netflix', 'Spotify', 'Amazon Prime', 'YouTube', 'Gym', 'Other']

export default function Subscriptions() {
  const { expenses } = useData()
  const [subs, setSubs] = useLocalStorage(LS_KEYS.subscriptions, [])
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [form, setForm] = useState({ name: '', cost: '', billingCycle: 'Monthly', renewalDate: dayjs().add(30, 'day').format('YYYY-MM-DD'), remind: true })

  const monthlyTotal = subs.reduce(
    (s, x) => s + Number(x.cost || 0) * (x.billingCycle === 'Yearly' ? 1 / 12 : x.billingCycle === 'Weekly' ? 4.33 : 1),
    0
  )
  const upcoming = subs.filter((s) => {
    const d = dayjs(s.renewalDate)
    return d.isAfter(dayjs()) && d.isBefore(dayjs().add(7, 'day'))
  }).length

  const openAdd = () => {
    setEditing(null)
    setForm({ name: 'Netflix', cost: '199', billingCycle: 'Monthly', renewalDate: dayjs().add(30, 'day').format('YYYY-MM-DD'), remind: true })
    setModal('add')
  }
  const openEdit = (s) => {
    setEditing(s)
    setForm({ name: s.name, cost: String(s.cost), billingCycle: s.billingCycle, renewalDate: s.renewalDate, remind: s.remind })
    setModal('edit')
  }
  const save = (e) => {
    e.preventDefault()
    if (editing) {
      setSubs(subs.map((s) => (s.id === editing.id ? { ...s, ...form, cost: Number(form.cost) } : s)))
      toast.success('Subscription updated')
    } else {
      setSubs([...subs, { id: `sub-${Date.now()}`, ...form, cost: Number(form.cost) }])
      toast.success('Subscription added')
    }
    setModal(null)
  }

  const daysToRenewal = (s) => dayjs(s.renewalDate).startOf('day').diff(dayjs().startOf('day'), 'day')

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle="Never miss a renewal — or an unused charge"
        actions={<Button icon={Plus} onClick={openAdd}>Add Subscription</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <RefreshCw size={20} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{subs.length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Active</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{formatMoney(monthlyTotal)}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Per month</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{upcoming}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Renewing soon</p>
          </div>
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="glass-card">
          <EmptyState
            icon={RefreshCw}
            title="No subscriptions tracked"
            description="Add Netflix, Spotify, gym memberships and more — FinPilot will remind you before each renewal."
            action={<Button icon={Plus} onClick={openAdd}>Add your first subscription</Button>}
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subs.map((s, i) => {
            const meta = SUBSCRIPTION_ICONS[s.name] || SUBSCRIPTION_ICONS.Other
            const Icon = meta.icon
            const days = daysToRenewal(s)
            const isOverdue = days < 0
            const isSoon = days >= 0 && days <= 7
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                className="glass-card card-hover relative overflow-hidden p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: meta.color }}>
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white">{s.name}</h3>
                      <p className="text-xs font-semibold text-slate-400">{s.billingCycle}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} aria-label="Edit subscription" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleting(s)} aria-label="Delete subscription" className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatMoney(s.cost)}</p>
                  {isOverdue ? (
                    <Badge color="red">Overdue</Badge>
                  ) : isSoon ? (
                    <Badge color="amber">
                      <Bell size={11} /> {days === 0 ? 'Renews today' : `${days}d left`}
                    </Badge>
                  ) : (
                    <Badge color="green" dot={false}>Renews {formatDate(s.renewalDate, 'D MMM')}</Badge>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                  <span>{formatDate(s.renewalDate, 'DD MMM YYYY')}</span>
                  <span className={`flex items-center gap-1 ${s.remind ? 'text-indigo-500' : 'text-slate-400'}`}>
                    {s.remind ? <Bell size={12} /> : <BellOff size={12} />}
                    {s.remind ? 'Reminders on' : 'Reminders off'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={editing ? 'Edit Subscription' : 'Add Subscription'}
        subtitle="Track a recurring charge"
        icon={RefreshCw}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" form="sub-form">Save</Button>
          </>
        }
      >
        <form id="sub-form" onSubmit={save} className="space-y-4">
          <Select label="Service" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}>
            {PLANS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Monthly/Per Charge Cost" type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
            <Select label="Billing Cycle" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}>
              <option>Monthly</option>
              <option>Yearly</option>
              <option>Weekly</option>
            </Select>
          </div>
          <Input label="Next Renewal Date" type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} required />
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={form.remind} onChange={(e) => setForm({ ...form, remind: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Send me a reminder before renewal</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Remove subscription?"
        message={`This will remove "${deleting?.name}" from your tracking.`}
        onConfirm={() => {
          setSubs(subs.filter((s) => s.id !== deleting.id))
          setDeleting(null)
          toast.success('Subscription removed')
        }}
      />
    </div>
  )
}
