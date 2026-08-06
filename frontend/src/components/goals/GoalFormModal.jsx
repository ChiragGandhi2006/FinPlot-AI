import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Target } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Input } from '../ui/Input'
import { useData } from '../../context/DataContext'
import { toISODate } from '../../utils/format'
import dayjs from 'dayjs'

export default function GoalFormModal({ open, onClose, goal }) {
  const { addGoal, updateGoal } = useData()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      goal_name: '',
      target_amount: '',
      saved_amount: '',
      target_date: toISODate(dayjs().add(6, 'month')),
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        goal
          ? {
              goal_name: goal.goal_name,
              target_amount: String(goal.target_amount),
              saved_amount: String(goal.saved_amount || 0),
              target_date: goal.target_date,
            }
          : {
              goal_name: '',
              target_amount: '',
              saved_amount: '0',
              target_date: toISODate(dayjs().add(6, 'month')),
            }
      )
    }
  }, [open, goal, reset])

  const onSubmit = async (data) => {
    const payload = {
      goal_name: data.goal_name,
      target_amount: Number(data.target_amount),
      target_date: data.target_date,
    }
    try {
      if (goal) {
        await updateGoal(goal.goal_id, { ...payload, saved_amount: Number(data.saved_amount || 0) })
      } else {
        await addGoal(payload)
      }
      onClose()
    } catch {
      /* toast handled by context */
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal ? 'Edit Goal' : 'Create Goal'}
      subtitle="Set a savings target and let FinPilot track it"
      icon={Target}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="goal-form" loading={isSubmitting}>
            {goal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Goal Name"
          placeholder="e.g. MacBook Pro, Europe Trip, Emergency Fund"
          error={errors.goal_name?.message}
          {...register('goal_name', { required: 'Goal name is required' })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Target Amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="150000"
            error={errors.target_amount?.message}
            {...register('target_amount', {
              required: 'Target amount is required',
              min: { value: 0.01, message: 'Must be greater than 0' },
            })}
          />
          <Input
            label={goal ? 'Saved Amount' : 'Starting Amount (optional)'}
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            {...register('saved_amount')}
          />
        </div>
        <Input
          label="Target Date"
          type="date"
          error={errors.target_date?.message}
          {...register('target_date', { required: 'Target date is required' })}
        />
      </form>
    </Modal>
  )
}
