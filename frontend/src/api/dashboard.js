import client from './client'

export const dashboardApi = {
  summary: () => client.get('/dashboard/summary').then((r) => r.data),
  monthlySummary: () => client.get('/dashboard/monthly-summary').then((r) => r.data),
  categoryExpense: () => client.get('/dashboard/category-expense').then((r) => r.data),
}
