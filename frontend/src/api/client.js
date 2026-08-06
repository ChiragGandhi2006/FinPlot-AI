import axios from 'axios'
import { API_BASE_URL, LS_KEYS } from '../constants'
import { getItem, removeItem } from '../utils/storage'

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use(
  (config) => {
    const token = getItem(LS_KEYS.token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let onUnauthorized = null
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      removeItem(LS_KEYS.token)
      removeItem(LS_KEYS.user)
      if (onUnauthorized) onUnauthorized()
    }
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.'
    const err = new Error(message)
    err.status = status
    err.response = error.response
    return Promise.reject(err)
  }
)

export function extractErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.message || fallback
}

export default client
