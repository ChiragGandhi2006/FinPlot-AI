import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Delete', loading = false }) {
  return (
    <AnimatePresence>
      {open && (
        <Modal
          open={open}
          onClose={onClose}
          title={title}
          subtitle="Please confirm this action"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmText}</Button>
            </>
          }
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300">
              <AlertTriangle size={22} />
            </div>
            <p className="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  )
}
