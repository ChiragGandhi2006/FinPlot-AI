import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LS_KEYS } from '../constants'
import { getItem, setItem } from '../utils/storage'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = getItem(LS_KEYS.theme)
    if (saved !== null) return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    setItem(LS_KEYS.theme, dark)
  }, [dark])

  const toggle = useCallback(() => setDark((d) => !d), [])
  const setTheme = useCallback((value) => setDark(Boolean(value)), [])

  const value = useMemo(() => ({ dark, toggle, setTheme }), [dark, toggle, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
