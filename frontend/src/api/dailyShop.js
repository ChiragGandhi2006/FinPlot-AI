import client from './client'

export const dailyShopApi = {
  today: () => client.get('/shop-daily/today').then((r) => r.data),
  saveToday: (payload) => client.put('/shop-daily/today', payload).then((r) => r.data),
}
