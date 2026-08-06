import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDownToLine, ArrowUpFromLine, Target, FileText, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import IncomeFormModal from '../income/IncomeFormModal'
import ExpenseFormModal from '../expense/ExpenseFormModal'
import GoalFormModal from '../goals/GoalFormModal'
import { reportApi } from '../../api/report'

const ACTIONS = [
  { id: 'income', label: 'Add Income', icon: ArrowDownToLine, gradient: 'from-emerald-500 to-green-600', shadow: 'shadow-[0_8px_24px_-6px_rgba(34,197,94,0.4)]' },
  { id: 'expense', label: 'Add Expense', icon: ArrowUpFromLine, gradient: 'from-rose-500 to-red-600', shadow: 'shadow-[0_8px_24px_-6px_rgba(239,68,68,0.4)]' },
  { id: 'goal', label: 'Create Goal', icon: Target, gradient: 'from-indigo-500 to-violet-600', shadow: 'shadow-[0_8px_24px_-6px_rgba(79,70,229,0.45)]' },
  { id: 'report', label: 'Download Report', icon: FileText, gradient: 'from-slate-600 to-slate-800', shadow: 'shadow-[0_8px_24px_-6px_rgba(15,23,42,0.4)]' },
]

export default function QuickActions() {
  const [modal, setModal] = useState(null)

  const handle = async (id) => {
    if (id === 'income' || id === 'expense' || id === 'goal') setModal(id)
    else if (id === 'report') {
      toast.promise(reportApi.downloadPdf(), {
        loading: 'Generating your PDF report…',
        success: 'Report downloaded!',
        error: 'Could not generate report',
      })
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ACTIONS.map((a, i) => (
          <motion.button
            key={a.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handle(a.id)}
            className={`flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-br ${a.gradient} p-4 text-left text-white ${a.shadow} transition-shadow hover:shadow-lg`}
          >
            <a.icon size={20} strokeWidth={2.2} />
            <span className="text-sm font-bold leading-tight">{a.label}</span>
          </motion.button>
        ))}
      </div>
      <IncomeFormModal open={modal === 'income'} onClose={() => setModal(null)} />
      <ExpenseFormModal open={modal === 'expense'} onClose={() => setModal(null)} />
      <GoalFormModal open={modal === 'goal'} onClose={() => setModal(null)} />
    </>
  )
}
