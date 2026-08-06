import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setSent(true)
    toast.success('Password reset link sent!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400">
        <ArrowLeft size={16} /> Back to login
      </Link>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-300">
            <CheckCircle2 size={38} strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Check your inbox</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            We've sent a password reset link to <b className="text-slate-800 dark:text-slate-200">{email}</b>. It expires in 30 minutes.
          </p>
          <p className="mt-4 text-xs text-slate-400">
            (Demo mode — the backend resets are handled by an admin panel.)
          </p>
          <Button variant="ghost" className="mt-6" onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Forgot password?</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No worries. Enter your email and we'll send you a reset link.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
            />
            <Button type="submit" size="lg" className="w-full">
              <Send size={17} /> Send Reset Link
            </Button>
          </form>
        </>
      )}
    </motion.div>
  )
}
