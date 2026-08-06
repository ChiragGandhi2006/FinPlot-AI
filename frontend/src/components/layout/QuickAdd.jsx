import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, ArrowDownToLine, ArrowUpFromLine, Target, FileText, X } from 'lucide-react'
import IncomeFormModal from '../income/IncomeFormModal'
import ExpenseFormModal from '../expense/ExpenseFormModal'
import GoalFormModal from '../goals/GoalFormModal'
import { useNavigate } from 'react-router-dom'
import { reportApi } from '../../api/report'
import toast from 'react-hot-toast'
import { useData } from '../../context/DataContext'

export default function QuickAdd() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const { refresh } = useData()

  const actions = [
    { id: 'income', label: 'Add Income', icon: ArrowDownToLine, cls: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' },
    { id: 'expense', label: 'Add Expense', icon: ArrowUpFromLine, cls: 'bg-gradient-to-br from-rose-500 to-red-600 text-white' },
    { id: 'goal', label: 'Create Goal', icon: Target, cls: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white' },
    { id: 'report', label: 'Download Report', icon: FileText, cls: 'bg-gradient-to-br from-slate-600 to-slate-800 text-white' },
  ]

  const handleAction = async (id) => {
    setOpen(false)
    if (id === 'income') setModal('income')
    else if (id === 'expense') setModal('expense')
    else if (id === 'goal') setModal('goal')
    else if (id === 'report') {
      toast.promise(reportApi.downloadPdf().then(() => refresh()), {
        loading: 'Generating your PDF report…',
        success: 'Report downloaded!',
        error: 'Could not generate report',
      })
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[80]">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mb-3 flex flex-col items-end gap-2"
            >
              {actions.map((a) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={() => handleAction(a.id)}
                  className="group flex items-center gap-2.5 rounded-full bg-white/90 py-2 pl-2 pr-4 shadow-lift backdrop-blur-xl transition hover:scale-105 dark:bg-slate-800/90"
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${a.cls}`}>
                    <a.icon size={15} strokeWidth={2.4} />
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{a.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Quick add"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white shadow-glow"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'x' : 'plus'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {open ? <X size={24} /> : <Plus size={26} strokeWidth={2.4} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <IncomeFormModal open={modal === 'income'} onClose={() => setModal(null)} />
      <ExpenseFormModal open={modal === 'expense'} onClose={() => setModal(null)} />
      <GoalFormModal open={modal === 'goal'} onClose={() => setModal(null)} />
    </>
  )
}
