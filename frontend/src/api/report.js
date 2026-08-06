import client from './client'
import { downloadBlob } from '../utils/format'

export const reportApi = {
  downloadPdf: async () => {
    const res = await client.get('/reports/monthly/pdf', { responseType: 'blob' })
    downloadBlob(res.data, 'FinPilot_Report.pdf')
    return res.data
  },
}
