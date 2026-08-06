import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { LS_KEYS } from '../constants'
import { getItem, removeItem, setItem } from '../utils/storage'
import { setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getItem(LS_KEYS.user))
  const [token, setToken] = useState(() => getItem(LS_KEYS.token))
  const [loading, setLoading] = useState(() => Boolean(getItem(LS_KEYS.token)))
  const [initializing, setInitializing] = useState(true)

  const logout = useCallback(() => {
    removeItem(LS_KEYS.token)
    removeItem(LS_KEYS.user)
    setToken(null)
    setUser(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    let active = true
    async function bootstrap() {
      const storedToken = getItem(LS_KEYS.token)
      if (!storedToken) {
        setInitializing(false)
        return
      }
      try {
        const me = await authApi.me()
        if (active) {
          setUser(me)
          setItem(LS_KEYS.user, me)
        }
      } catch {
        if (active) logout()
      } finally {
        if (active) {
          setLoading(false)
          setInitializing(false)
        }
      }
    }
    bootstrap()
    return () => {
      active = false
    }
  }, [logout])

  const login = useCallback(async ({ email, password, remember }) => {
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      setItem(LS_KEYS.token, res.access_token)
      if (remember) setItem(LS_KEYS.remember, true)
      else removeItem(LS_KEYS.remember)
      setToken(res.access_token)
      const me = await authApi.me()
      setUser(me)
      setItem(LS_KEYS.user, me)
      return me
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      await authApi.register(payload)
      const res = await authApi.login({ email: payload.email, password: payload.password })
      setItem(LS_KEYS.token, res.access_token)
      setToken(res.access_token)
      const me = await authApi.me()
      setUser(me)
      setItem(LS_KEYS.user, me)
      return me
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback((next) => {
    setUser(next)
    setItem(LS_KEYS.user, next)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initializing,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, loading, initializing, login, register, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { toast }
