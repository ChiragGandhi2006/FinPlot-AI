import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  FileText,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Plane,
  ShieldCheck,
  Briefcase,
  Laptop,
  Landmark,
  TrendingUp,
  Wallet,
  Percent,
  Gift,
  Coins,
  PlusCircle,
  PiggyBank,
  Sparkles,
  AlertTriangle,
  Rocket,
  Trophy,
  Target,
  Repeat,
  Scale,
  Feather,
  Crown,
} from 'lucide-react'

const configuredApiUrl = import.meta.env.VITE_API_URL

// Keep local development functional when the deployment placeholder is present.
export const API_BASE_URL =
  configuredApiUrl && !configuredApiUrl.includes('your-production-domain.com')
    ? configuredApiUrl
    : '/api'

export const LS_KEYS = {
  token: 'finpilot_token',
  user: 'finpilot_user',
  remember: 'finpilot_remember',
  theme: 'finpilot_theme',
  settings: 'finpilot_settings',
  budgets: 'finpilot_budgets',
  subscriptions: 'finpilot_subscriptions',
  achievements: 'finpilot_achievements',
  notifications: 'finpilot_notifications',
}

export const EXPENSE_CATEGORY_META = {
  Food: { icon: Utensils, color: '#F59E0B', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-500/15' },
  Transportation: { icon: Car, color: '#3B82F6', gradient: 'from-blue-500 to-sky-500', bg: 'bg-blue-100 dark:bg-blue-500/15' },
  Shopping: { icon: ShoppingBag, color: '#EC4899', gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-100 dark:bg-pink-500/15' },
  Rent: { icon: Home, color: '#8B5CF6', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-100 dark:bg-violet-500/15' },
  Bills: { icon: FileText, color: '#06B6D4', gradient: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-100 dark:bg-cyan-500/15' },
  Entertainment: { icon: Clapperboard, color: '#F43F5E', gradient: 'from-rose-500 to-red-500', bg: 'bg-rose-100 dark:bg-rose-500/15' },
  Healthcare: { icon: HeartPulse, color: '#EF4444', gradient: 'from-red-500 to-orange-500', bg: 'bg-red-100 dark:bg-red-500/15' },
  Education: { icon: GraduationCap, color: '#10B981', gradient: 'from-emerald-500 to-green-500', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  Travel: { icon: Plane, color: '#6366F1', gradient: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-100 dark:bg-indigo-500/15' },
  Insurance: { icon: ShieldCheck, color: '#64748B', gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-100 dark:bg-slate-500/15' },
  Other: { icon: Coins, color: '#94A3B8', gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-200 dark:bg-slate-500/15' },
}

export const INCOME_CATEGORY_META = {
  Salary: { icon: Briefcase, color: '#4F46E5', gradient: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-100 dark:bg-indigo-500/15' },
  Business: { icon: Landmark, color: '#0EA5E9', gradient: 'from-sky-500 to-blue-500', bg: 'bg-sky-100 dark:bg-sky-500/15' },
  Freelancing: { icon: Laptop, color: '#8B5CF6', gradient: 'from-violet-500 to-purple-500', bg: 'bg-violet-100 dark:bg-violet-500/15' },
  Investment: { icon: TrendingUp, color: '#22C55E', gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-100 dark:bg-green-500/15' },
  'Rental Income': { icon: Home, color: '#F59E0B', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-100 dark:bg-amber-500/15' },
  Interest: { icon: Percent, color: '#14B8A6', gradient: 'from-teal-500 to-cyan-500', bg: 'bg-teal-100 dark:bg-teal-500/15' },
  Bonus: { icon: Gift, color: '#EC4899', gradient: 'from-pink-500 to-fuchsia-500', bg: 'bg-pink-100 dark:bg-pink-500/15' },
  Gift: { icon: Gift, color: '#F43F5E', gradient: 'from-rose-500 to-pink-500', bg: 'bg-rose-100 dark:bg-rose-500/15' },
  Other: { icon: Coins, color: '#94A3B8', gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-200 dark:bg-slate-500/15' },
}

export const CATEGORY_COLOR_PALETTE = [
  '#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899',
  '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#A855F7',
]

export const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Net Banking', 'Wallet']

export const BUDGET_CATEGORIES = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Education', 'Healthcare', 'Utilities']

export const DEFAULTS_BUDGETS = BUDGET_CATEGORIES.map((name) => ({ id: name.toLowerCase(), category: name, limit: 5000 }))

export const SUBSCRIPTION_ICONS = {
  Netflix: { icon: Clapperboard, color: '#E50914' },
  Spotify: { icon: Coins, color: '#1DB954' },
  'Amazon Prime': { icon: Gift, color: '#00A8E1' },
  YouTube: { icon: Clapperboard, color: '#FF0000' },
  Gym: { icon: HeartPulse, color: '#F59E0B' },
  Other: { icon: Repeat, color: '#64748B' },
}

export const HEALTH_TIERS = [
  { min: 80, label: 'Excellent', color: '#22C55E', message: 'Outstanding financial discipline. Keep flying!' },
  { min: 60, label: 'Good', color: '#F59E0B', message: 'Solid progress. A few tweaks can make it excellent.' },
  { min: 40, label: 'Fair', color: '#F97316', message: 'Building momentum. Tighten discretionary spending.' },
  { min: 0, label: 'Needs Improvement', color: '#EF4444', message: 'Time to course-correct. Start with a budget plan.' },
]

export const ACHIEVEMENTS = [
  {
    id: 'first_income',
    title: 'First Income',
    description: 'Record your very first income entry',
    icon: Wallet,
    color: '#4F46E5',
    points: 100,
  },
  {
    id: 'first_goal',
    title: 'Goal Setter',
    description: 'Create your first savings goal',
    icon: Target,
    color: '#F59E0B',
    points: 100,
  },
  {
    id: 'saved_10000',
    title: 'Five Figures',
    description: 'Save ₹10,000 in total',
    icon: PiggyBank,
    color: '#22C55E',
    points: 250,
  },
  {
    id: 'streak_30',
    title: '30 Day Streak',
    description: 'Stay active on the platform for 30 days',
    icon: Feather,
    color: '#8B5CF6',
    points: 300,
  },
  {
    id: 'budget_master',
    title: 'Budget Master',
    description: 'Stay under budget in every category for a month',
    icon: Scale,
    color: '#06B6D4',
    points: 300,
  },
  {
    id: 'goal_achiever',
    title: 'Goal Achiever',
    description: 'Fully achieve any savings goal',
    icon: Trophy,
    color: '#F59E0B',
    points: 500,
  },
  {
    id: 'income_streak',
    title: 'Income Streak',
    description: 'Add income for 7 consecutive days',
    icon: TrendingUp,
    color: '#22C55E',
    points: 200,
  },
  {
    id: 'super_saver',
    title: 'Super Saver',
    description: 'Reach a 40%+ savings rate in a month',
    icon: Crown,
    color: '#4F46E5',
    points: 400,
  },
]

export const INSIGHT_ICONS = {
  positive: { icon: Sparkles, color: '#22C55E' },
  warning: { icon: AlertTriangle, color: '#F59E0B' },
  danger: { icon: AlertTriangle, color: '#EF4444' },
  goal: { icon: Rocket, color: '#4F46E5' },
  tip: { icon: PiggyBank, color: '#8B5CF6' },
}

export const QUICK_QUESTIONS = [
  'Can I buy an iPhone?',
  'Where am I spending too much?',
  'How can I save more?',
  'Am I on track with my goals?',
  'Give me a weekly budget plan',
]

export const CHART_COLORS = {
  income: '#22C55E',
  expense: '#EF4444',
  savings: '#4F46E5',
  balance: '#8B5CF6',
  grid: '#e2e8f0',
  gridDark: '#1e293b',
}
