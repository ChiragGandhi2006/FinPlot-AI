import dayjs from 'dayjs'
import { getSettings } from './storage'

export const CURRENCIES = {
  INR: { symbol: '₹', code: 'en-IN', label: 'Indian Rupee' },
  USD: { symbol: '$', code: 'en-US', label: 'US Dollar' },
  EUR: { symbol: '€', code: 'de-DE', label: 'Euro' },
  GBP: { symbol: '£', code: 'en-GB', label: 'British Pound' },
  AED: { symbol: 'د.إ', code: 'ar-AE', label: 'Dirham' },
  SGD: { symbol: 'S$', code: 'en-SG', label: 'Singapore Dollar' },
}

export function formatMoney(value, { compact = false, decimals = 0 } = {}) {
  const { currency } = getSettings()
  const meta = CURRENCIES[currency] || CURRENCIES.INR
  const num = Number(value || 0)
  const formatted = new Intl.NumberFormat(meta.code, {
    style: 'currency',
    currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard',
    maximumSignificantDigits: compact ? 3 : undefined,
  }).format(num)
  return formatted
}

export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
  }).format(Number(value || 0))
}

export function formatPercent(value, decimals = 1) {
  return `${Number(value || 0).toFixed(decimals)}%`
}

export function formatDate(date, format = 'DD MMM YYYY') {
  if (!date) return '—'
  return dayjs(date).format(format)
}

export function formatDateTime(date) {
  if (!date) return '—'
  return dayjs(date).format('DD MMM YYYY, hh:mm A')
}

export function timeAgo(date) {
  if (!date) return '—'
  const diff = dayjs().diff(dayjs(date), 'minute')
  if (diff < 1) return 'Just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`
  return dayjs(date).format('DD MMM')
}

export function initials(firstName = '', lastName = '') {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U'
}

export function greeting() {
  const hour = dayjs().hour()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function todayLabel() {
  return dayjs().format('dddd, D MMMM YYYY')
}

export function daysBetween(from, to) {
  return dayjs(to).startOf('day').diff(dayjs(from).startOf('day'), 'day')
}

export function toISODate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function toCSV(rows) {
  if (!rows?.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
}
