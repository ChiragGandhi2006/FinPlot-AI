import client from './client'

export const expenseApi = {
  getAll: () => client.get('/expense/').then((r) => r.data),
  get: (id) => client.get(`/expense/${id}`).then((r) => r.data),
  create: (payload) => client.post('/expense/', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/expense/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/expense/${id}`).then((r) => r.data),
}
