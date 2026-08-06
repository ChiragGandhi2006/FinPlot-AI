import client from './client'

const BASE = '/api/v1'

export const aiApi = {
  chat: async (message, history = []) => {
    const res = await client.post(`${BASE}/chat`, { message, history })
    return res.data?.data || res.data
  },
  forecast: async (months = 3) => {
    const res = await client.post(`${BASE}/forecast`, { months })
    return res.data?.data || res.data
  },
  analyzeStatement: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await client.post(`${BASE}/statement`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data?.data || res.data
  },
  scanReceipt: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await client.post(`${BASE}/receive`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data?.data || res.data
  },
}