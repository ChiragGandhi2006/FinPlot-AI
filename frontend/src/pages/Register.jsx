import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Eye, EyeOff, Phone, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { extractErrorMessage } from '../api/client'

export default function Register() {
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { first_name: '', last_name: '', username: '', email: '', phone: '', password: '', confirm: '' } })

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />

  const onSubmit = async (data) => {
    try {
      await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        phone: data.phone || null,
        password: data.password,
      })
      toast.success('Account created! Welcome aboard ✈️')
      navigate('/app/dashboard')
    } catch (err) {
      toast.error(extractErrorMessage(err))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Start your journey to smarter money management — free forever.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            icon={User}
            placeholder="Aarav"
            error={errors.first_name?.message}
            {...register('first_name', { required: 'First name is required' })}
          />
          <Input
            label="Last Name"
            placeholder="Sharma"
            error={errors.last_name?.message}
            {...register('last_name', { required: 'Last name is required' })}
          />
        </div>
        <Input
          label="Username"
          placeholder="aarav_sharma"
          error={errors.username?.message}
          {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'At least 3 characters' } })}
        />
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          icon={Phone}
          placeholder="+91 98765 43210"
          {...register('phone')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pl-10 pr-11"
                placeholder="Min. 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password?.message && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}
          </div>
          <Input
            label="Confirm"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat password"
            error={errors.confirm?.message}
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          <Sparkles size={17} /> Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}