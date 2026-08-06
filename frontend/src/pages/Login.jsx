import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { extractErrorMessage } from '../api/client'
import { LS_KEYS } from '../constants'
import { getItem } from '../utils/storage'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(getItem(LS_KEYS.remember) || false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } })

  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />

  const onSubmit = async (data) => {
    try {
      await login({ email: data.email, password: data.password, remember })
      toast.success('Welcome back! ✈️')
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your financial cockpit and take control.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pl-10 pr-11"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password?.message && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Remember me for 30 days</span>
        </label>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting || loading}>
          <Sparkles size={17} /> Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        Trusted & secure
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: ShieldCheck, label: 'JWT Secured' },
          { icon: TrendingUp, label: 'Smart Insights' },
          { icon: Sparkles, label: 'AI Powered' },
        ].map((f) => (
          <div key={f.label} className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200/70 bg-white/50 p-3 text-center dark:border-slate-700/70 dark:bg-slate-800/40">
            <f.icon size={18} className="text-indigo-500" />
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{f.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        New to FinPilot?{' '}
        <Link to="/register" className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
          Create an account
        </Link>
      </p>
    </motion.div>
  )
}
