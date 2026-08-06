import { useMemo, useState } from 'react'
import { Search, ArrowUpFromLine, Plus, Pencil, Trash2, FilterX, CalendarRange } from 'lucide-react'
import { useData } from '../context/DataContext'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import DataTable from '../components/ui/DataTable'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ExpenseFormModal from '../components/expense/ExpenseFormModal'
import Badge from '../components/ui/Badge'
import { formatMoney, formatDate } from '../utils/format'
import { EXPENSE_CATEGORY_META, PAYMENT_METHODS } from '../constants'
import { useDebounce } from '../hooks/useDebounce'
import dayjs from 'dayjs'

export default function Expenses() {
  const { expenses, expenseCategories, loading, deleteExpense } = useData()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [method, setMethod] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const debouncedQuery = useDebounce(query, 250)

  const catName = {}
  expenseCategories.forEach((c) => {
    catName[c.category_id] = c.category_name
  })

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        const q = debouncedQuery.trim().toLowerCase()
        const name = catName[e.category_id] || ''
        const textOk =
          !q ||
          e.merchant.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
        const catOk = category === 'all' || String(e.category_id) === category
        const methodOk = method === 'all' || e.payment_method === method
        const dateOk =
          (!fromDate || dayjs(e.expense_date).isAfter(dayjs(fromDate).subtract(1, 'day'))) &&
          (!toDate || dayjs(e.expense_date).isBefore(dayjs(toDate).add(1, 'day')))
        return textOk && catOk && methodOk && dateOk
      })
      .sort((a, b) => dayjs(b.expense_date).diff(dayjs(a.expense_date)))
  }, [expenses, debouncedQuery, category, method, fromDate, toDate, expenseCategories])

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0)
  const hasFilters = query || category !== 'all' || method !== 'all' || fromDate || toDate
  const resetFilters = () => {
    setQuery('')
    setCategory('all')
    setMethod('all')
    setFromDate('')
    setToDate('')
  }

  const columns = [
    {
      key: 'merchant',
      label: 'Merchant',
      sortable: true,
      render: (row) => {
        const meta = EXPENSE_CATEGORY_META[catName[row.category_id]] || { icon: ArrowUpFromLine, bg: 'bg-red-100 dark:bg-red-500/15' }
        const Icon = meta.icon
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
              <Icon size={18} strokeWidth={2.2} style={{ color: meta.color || '#EF4444' }} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 dark:text-slate-100">{row.merchant}</p>
              <p className="truncate text-xs text-slate-400">{row.description || '—'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'category_id',
      label: 'Category',
      sortable: true,
      render: (row) => {
        const colorMap = {
          Food: 'amber', Shopping: 'pink', Travel: 'indigo', Bills: 'cyan', Entertainment: 'red',
          Healthcare: 'red', Education: 'green', Insurance: 'slate', Rent: 'violet', Transportation: 'indigo',
        }
        return <Badge color={colorMap[catName[row.category_id]] || 'slate'}>{catName[row.category_id] || 'Other'}</Badge>
      },
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (row) => <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{row.payment_method}</span>,
    },
    {
      key: 'expense_date',
      label: 'Date',
      sortable: true,
      sortValue: (r) => dayjs(r.expense_date).valueOf(),
      render: (row) => <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatDate(row.expense_date)}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      sortable: true,
      sortValue: (r) => Number(r.amount),
      render: (row) => <span className="font-extrabold text-red-500">-{formatMoney(row.amount)}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => {
              setEditing(row)
              setModal('edit')
            }}
            aria-label="Edit expense"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDeleting(row)}
            aria-label="Delete expense"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Understand where your money goes"
        actions={<Button icon={Plus} onClick={() => { setEditing(null); setModal('add') }}>Add Expense</Button>}
      />

      <div className="glass-card overflow-hidden">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by merchant, category or note…"
                className="input pl-10"
                aria-label="Search expenses"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <CalendarRange size={15} className="text-slate-400" />
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="input !w-auto !py-2" aria-label="From date" />
                <span className="text-slate-400">to</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="input !w-auto !py-2" aria-label="To date" />
              </div>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} className="!w-40" aria-label="Filter by category">
                <option value="all">All categories</option>
                {expenseCategories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </Select>
              <Select value={method} onChange={(e) => setMethod(e.target.value)} className="!w-40" aria-label="Filter by payment method">
                <option value="all">All methods</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" icon={FilterX} onClick={resetFilters}>Reset</Button>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Filtered total</span>
              <span className="text-sm font-extrabold text-red-500">-{formatMoney(total)}</span>
            </div>
          </div>
        </div>
        <DataTable columns={columns} data={filtered.map((e) => ({ id: e.expense_id, ...e }))} loading={loading} />
      </div>

      <ExpenseFormModal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        expense={modal === 'edit' ? editing : null}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete expense?"
        message={`This will permanently remove "${deleting?.merchant}" worth ${formatMoney(deleting?.amount)}.`}
        onConfirm={async () => {
          await deleteExpense(deleting.expense_id)
          setDeleting(null)
        }}
      />
    </div>
  )
}
