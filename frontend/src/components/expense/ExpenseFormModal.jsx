import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowUpFromLine } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'
import { useData } from '../../context/DataContext'
import { PAYMENT_METHODS } from '../../constants'
import { toISODate } from '../../utils/format'
import dayjs from 'dayjs'

export default function ExpenseFormModal({ open, onClose, expense }) {
  const { expenseCategories, addExpense, updateExpense } = useData()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      merchant: '',
      amount: '',
      category_id: '',
      payment_method: 'UPI',
      expense_date: toISODate(dayjs()),
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        expense
          ? {
              merchant: expense.merchant,
              amount: String(expense.amount),
              category_id: String(expense.category_id),
              payment_method: expense.payment_method,
              expense_date: expense.expense_date,
              description: expense.description || '',
            }
          : {
              merchant: '',
              amount: '',
              category_id: expenseCategories[0] ? String(expenseCategories[0].category_id) : '',
              payment_method: 'UPI',
              expense_date: toISODate(dayjs()),
              description: '',
            }
      )
    }
  }, [open, expense, expenseCategories, reset])

  const onSubmit = async (data) => {
    const payload = {
      merchant: data.merchant,
      amount: Number(data.amount),
      category_id: Number(data.category_id),
      payment_method: data.payment_method,
      expense_date: data.expense_date,
      description: data.description || null,
    }
    try {
      if (expense) await updateExpense(expense.expense_id, payload)
      else await addExpense(payload)
      onClose()
    } catch {
      /* toast handled by context */
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'Add Expense'}
      subtitle={expense ? 'Update this expense record' : 'Record a new expense'}
      icon={ArrowUpFromLine}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="expense-form" loading={isSubmitting}>
            {expense ? 'Save Changes' : 'Add Expense'}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Merchant"
          placeholder="e.g. Swiggy, Zomato, Amazon"
          error={errors.merchant?.message}
          {...register('merchant', { required: 'Merchant is required' })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="500"
            error={errors.amount?.message}
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Must be greater than 0' },
            })}
          />
          <Select
            label="Category"
            error={errors.category_id?.message}
            {...register('category_id', { required: 'Category is required' })}
          >
            {expenseCategories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Payment Method" {...register('payment_method')}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <Input label="Date" type="date" {...register('expense_date', { required: 'Date is required' })} />
        </div>
        <Textarea label="Description (optional)" placeholder="Add a note…" {...register('description')} />
      </form>
    </Modal>
  )
}
