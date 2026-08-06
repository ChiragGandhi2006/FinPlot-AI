import client from './client'

export const goalApi = {
  getAll: () => client.get('/goals/').then((r) => r.data),
  get: (id) => client.get(`/goals/${id}`).then((r) => r.data),
  create: (payload) => client.post('/goals/', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/goals/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/goals/${id}`).then((r) => r.data),
  progress: (id) => client.get(`/goals/progress/${id}`).then((r) => r.data),
}
