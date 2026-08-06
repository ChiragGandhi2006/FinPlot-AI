import { LS_KEYS } from '../constants'

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key) {
  localStorage.removeItem(key)
}

/* ---------- Settings (currency / language) ---------- */

const DEFAULT_SETTINGS = { currency: 'INR', language: 'en' }
const listeners = new Set()

let settings = { ...DEFAULT_SETTINGS, ...getItem(LS_KEYS.settings, {}) }

export function getSettings() {
  return settings
}

export function setSettings(next) {
  settings = { ...settings, ...next }
  setItem(LS_KEYS.settings, settings)
  listeners.forEach((fn) => fn(settings))
}

export function subscribeSettings(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/* ---------- Client-side stores (budgets, subscriptions, achievements, notifications) ---------- */

export function readStore(key, fallback) {
  return getItem(key, fallback)
}

export function writeStore(key, value) {
  setItem(key, value)
}

export function patchStoreItem(key, id, patch) {
  const list = getItem(key, [])
  const next = list.map((item) => (item.id === id ? { ...item, ...patch } : item))
  setItem(key, next)
  return next
}
