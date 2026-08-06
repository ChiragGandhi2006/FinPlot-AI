import client from './client'

export const categoryApi = {
  income: () => client.get('/income-categories/').then((r) => r.data),
  expense: () => client.get('/expense-categories/').then((r) => r.data),
}
