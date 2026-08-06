import client from './client'

export const incomeApi = {
  getAll: () => client.get('/income/').then((r) => r.data),
  get: (id) => client.get(`/income/${id}`).then((r) => r.data),
  create: (payload) => client.post('/income/', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/income/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/income/${id}`).then((r) => r.data),
}
