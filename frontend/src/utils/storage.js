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

/* ---------- Encrypted backup (localStorage) ---------- */

const BACKUP_PASSWORD = 'finpilot-backup-change-this-strong-password'

export function encryptBackup(data) {
  const raw = JSON.stringify(data)
  // Simple base64 encode obfuscation (not production-grade encryption)
  // In production, use Web Crypto API with proper key derivation
  return btoa(raw)
}

export function decryptBackup(encrypted) {
  try {
    const raw = atob(encrypted)
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/* ---------- Export/Import backup ---------- */

export function exportBackup(data) {
  const encrypted = encryptBackup(data)
  const blob = new Blob([encrypted], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finpilot-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importBackup(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = decryptBackup(e.target.result)
    if (data) return data
    throw new Error('Invalid backup file')
  }
  reader.readAsText(file)
}

/* ---------- Settings (currency / language) ---------- */
const DEFAULT_SETTINGS = { currency: 'INR', language: 'en' }
const listeners = new Set

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

/* ---------- Sync queue (offline-first) ---------- */

let syncQueue = []
let isSyncing = false
const syncListeners = new Set()

export function subscribeSync(fn) {
  syncListeners.add(fn)
  return () => syncListeners.delete(fn)
}

export function enqueueSync(key, value) {
  syncQueue.push({ key, value })
  runSync()
}

export async function runSync() {
  if (isSyncing || !navigator.onLine) return
  isSyncing = true

  try {
    // In a full implementation, would fetch to backend /sync/upload
    // For now, store encrypted blobs in localStorage with sync_ prefix
    for (const item of syncQueue) {
      const encrypted = encryptBackup(item.value)
      localStorage.setItem(`_sync_${item.key}`, encrypted)
    }
    syncQueue = []
    syncListeners.forEach(fn => fn(syncQueue))
  } catch (err) {
    console.error('Sync error', err)
  } finally {
    isSyncing = false
  }
}