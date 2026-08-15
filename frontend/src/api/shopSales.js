import client from './client'

export const shopSalesApi = {
  today: () => client.get('/shop-sales/today').then((r) => r.data),
  create: (payload) => client.post('/shop-sales/', payload).then((r) => r.data),
  remove: (id) => client.delete(`/shop-sales/${id}`).then((r) => r.data),
}
