import { useState } from 'react'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import {
  User,
  Moon,
  Sun,
  CreditCard,
  Languages,
  Download,
  Trash2,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import { useSettings } from '../hooks/useSettings'
import { setSettings, getItem } from '../utils/storage'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { CURRENCIES } from '../utils/format'
import { toCSV, downloadBlob, formatDate } from '../utils/format'
import { LS_KEYS } from '../constants'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { user, logout, updateUser } = useAuth()
  const { dark, toggle } = useTheme()
  const settings = useSettings()
  const navigate = useNavigate()
  const { incomes, expenses, goals } = useData()
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [deleteOpen, setDeleteOpen] = useState(false)

  const exportData = () => {
    try {
      const data = {
        exportedAt: dayjs().toISOString(),
        user: { email: user?.email, name: `${user?.first_name} ${user?.last_name}` },
        incomes,
        expenses,
        goals,
      }
      const csv = toCSV(
        [...incomes.map((i) => ({ Type: 'Income', ...i })), ...expenses.map((e) => ({ Type: 'Expense', ...e }))]
      )
      downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `FinPilot_Export_${dayjs().format('YYYY-MM-DD')}.csv`)
      toast.success('Data exported successfully!')
    } catch {
      toast.error('Export failed')
    }
  }

  const changePassword = (e) => {
    e.preventDefault()
    if (passwordForm.next.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    toast.success('Password updated (demo — wire to your backend for production)')
    setPasswordForm({ current: '', next: '', confirm: '' })
  }

  const deleteAccount = () => {
    getItem(LS_KEYS.token)
    localStorage.clear()
    logout()
    navigate('/login')
    toast.success('Account deleted')
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Tune FinPilot to fit your world" />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Profile */}
        <div className="glass-card flex flex-col items-center p-6 lg:col-span-1">
          <Avatar user={user} size="xl" />
          <h3 className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">
            {user?.first_name} {user?.last_name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Badge color="indigo">Member since {formatDate(user?.created_at, 'MMM YYYY')}</Badge>
            <Badge color={user?.email_verified ? 'green' : 'amber'}>{user?.email_verified ? 'Verified' : 'Unverified'}</Badge>
          </div>
          <div className="mt-5 w-full space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Email</span>
              <span className="truncate font-bold text-slate-700 dark:text-slate-200">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Phone</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{user?.phone || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Role</span>
              <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {/* Preferences */}
          <div className="glass-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Sparkles size={18} className="text-indigo-500" /> Preferences
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {dark ? <Moon size={19} /> : <Sun size={19} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">Dark Mode</p>
                    <p className="text-xs text-slate-400">{dark ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                <button
                  onClick={toggle}
                  role="switch"
                  aria-checked={dark}
                  className={`relative h-7 w-12 rounded-full transition ${dark ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${dark ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <CreditCard size={19} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">Currency</p>
                    <p className="text-xs text-slate-400">{CURRENCIES[settings.currency]?.label}</p>
                  </div>
                </div>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ currency: e.target.value })}
                  className="input !w-auto !py-1.5 text-sm"
                  aria-label="Select currency"
                >
                  {Object.entries(CURRENCIES).map(([code, c]) => (
                    <option key={code} value={code}>{code} — {c.symbol}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                    <Languages size={19} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">Language</p>
                    <p className="text-xs text-slate-400">Interface language</p>
                  </div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ language: e.target.value })}
                  className="input !w-auto !py-1.5 text-sm"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="glass-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <KeyRound size={18} className="text-amber-500" /> Change Password
            </h3>
            <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-3">
              <Input label="Current Password" type="password" placeholder="••••••••" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} required />
              <Input label="New Password" type="password" placeholder="••••••••" value={passwordForm.next} onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })} required />
              <Input label="Confirm New" type="password" placeholder="••••••••" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
              <div className="sm:col-span-3">
                <Button type="submit" icon={ShieldCheck}>Update Password</Button>
              </div>
            </form>
          </div>

          {/* Data */}
          <div className="glass-card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Download size={18} className="text-green-600" /> Your Data
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" icon={Download} onClick={exportData}>Export All Data</Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Downloads a CSV of all your income, expenses and goals. You own your data, always.
            </p>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border-2 border-red-200/70 bg-red-50/50 p-6 dark:border-red-500/30 dark:bg-red-500/5">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-red-600 dark:text-red-400">
              <Trash2 size={18} /> Danger Zone
            </h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>Delete Account</Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        message="All your income, expenses, goals and settings will be permanently erased. Are you absolutely sure?"
        confirmText="Yes, delete everything"
        onConfirm={deleteAccount}
      />
    </div>
  )
}
