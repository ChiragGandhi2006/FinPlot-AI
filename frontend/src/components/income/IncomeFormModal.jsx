import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowDownToLine } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input, Select, Textarea } from '../ui/Input'
import { useData } from '../../context/DataContext'
import { PAYMENT_METHODS } from '../../constants'
import { toISODate } from '../../utils/format'
import dayjs from 'dayjs'

export default function IncomeFormModal({ open, onClose, income }) {
  const { incomeCategories, addIncome, updateIncome } = useData()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      source: '',
      amount: '',
      category_id: '',
      payment_method: 'UPI',
      income_date: toISODate(dayjs()),
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        income
          ? {
              source: income.source,
              amount: String(income.amount),
              category_id: String(income.category_id),
              payment_method: income.payment_method,
              income_date: income.income_date,
              description: income.description || '',
            }
          : {
              source: '',
              amount: '',
              category_id: incomeCategories[0] ? String(incomeCategories[0].category_id) : '',
              payment_method: 'UPI',
              income_date: toISODate(dayjs()),
              description: '',
            }
      )
    }
  }, [open, income, incomeCategories, reset])

  const onSubmit = async (data) => {
    const payload = {
      source: data.source,
      amount: Number(data.amount),
      category_id: Number(data.category_id),
      payment_method: data.payment_method,
      income_date: data.income_date,
      description: data.description || null,
    }
    try {
      if (income) await updateIncome(income.income_id, payload)
      else await addIncome(payload)
      onClose()
    } catch {
      /* toast handled by context */
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={income ? 'Edit Income' : 'Add Income'}
      subtitle={income ? 'Update this income record' : 'Record a new income source'}
      icon={ArrowDownToLine}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="income-form" loading={isSubmitting}>
            {income ? 'Save Changes' : 'Add Income'}
          </Button>
        </>
      }
    >
      <form id="income-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Source"
          placeholder="e.g. Monthly Salary, Freelance project"
          error={errors.source?.message}
          {...register('source', { required: 'Source is required' })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="50000"
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
            {incomeCategories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Payment Method"
            {...register('payment_method')}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <Input label="Date" type="date" {...register('income_date', { required: 'Date is required' })} />
        </div>
        <Textarea label="Description (optional)" placeholder="Add a note…" {...register('description')} />
      </form>
    </Modal>
  )
}
