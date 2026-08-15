import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { shopSalesApi } from '../../api/shopSales'
import { extractErrorMessage } from '../../api/client'
import { formatMoney, formatNumber } from '../../utils/format'
import { Card, CardHeader } from '../ui/Card'
import Button from '../ui/Button'

const SHOP_CATALOG = {
  Brooms: ['Grass Broom', 'Coconut Broom', 'Floor Broom'],
  Buckets: ['Plastic Bucket', 'Bucket with Mug', 'Bath Tub'],
  Bottles: ['Water Bottle', 'Insulated Bottle', 'Sports Bottle'],
  Fans: ['Ceiling Fan', 'Table Fan', 'Pedestal Fan', 'Exhaust Fan'],
  Irons: ['Dry Iron', 'Steam Iron'],
  Gas: ['2 Burner Gas Stove', '3 Burner Gas Stove', 'Gas Regulator', 'Gas Pipe'],
  Induction: ['Induction Cooktop', 'Induction Pan'],
  Electronics: ['LED Bulb', 'Extension Board', 'Electric Kettle', 'Mixer Grinder', 'Emergency Light', 'Torch', 'Plug Top', 'Switch'],
  Plasticware: ['Storage Container', 'Dustbin', 'Plastic Stool', 'Plastic Chair', 'Basket', 'Hanger', 'Lunch Box', 'Plastic Mug'],
}

const BOTTLE_BRANDS = ['Cello', 'Orange', 'Kalibar']
const initialForm = () => ({ category: 'Brooms', product: 'Grass Broom', brand: '', quantity: '1', unitPrice: '', paymentMethod: 'Cash' })

export default function DailyShopSummary() {
  const [sales, setSales] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadToday = useCallback(async () => {
    setLoading(true)
    try {
      setSales(await shopSalesApi.today())
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Could not load today\'s sales.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadToday()
    const delay = dayjs().endOf('day').diff(dayjs()) + 1000
    const timer = window.setTimeout(loadToday, Math.max(delay, 1000))
    return () => window.clearTimeout(timer)
  }, [loadToday])

  const totals = useMemo(() => ({
    quantity: sales.reduce((sum, sale) => sum + sale.quantity, 0),
    revenue: sales.reduce((sum, sale) => sum + sale.quantity * sale.unit_price, 0),
  }), [sales])

  const changeCategory = (category) => {
    setForm({ category, product: SHOP_CATALOG[category][0], brand: '', quantity: '1', unitPrice: '', paymentMethod: 'Cash' })
  }

  const addSale = async (event) => {
    event.preventDefault()
    const quantity = Number(form.quantity)
    const unitPrice = Number(form.unitPrice)
    if (!Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      toast.error('Enter a valid quantity and unit price.')
      return
    }
    if (form.category === 'Bottles' && !form.brand) {
      toast.error('Choose the bottle company.')
      return
    }
    setSaving(true)
    try {
      const sale = await shopSalesApi.create({
        product_category: form.category,
        product_name: form.product,
        brand: form.category === 'Bottles' ? form.brand : null,
        quantity,
        unit_price: unitPrice,
        payment_method: form.paymentMethod,
      })
      setSales((current) => [sale, ...current])
      setForm((current) => ({ ...current, quantity: '1', unitPrice: '' }))
      toast.success('Sale added for today.')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Could not save this sale.'))
    } finally {
      setSaving(false)
    }
  }

  const removeSale = async (sale) => {
    try {
      await shopSalesApi.remove(sale.shop_sale_id)
      setSales((current) => current.filter((item) => item.shop_sale_id !== sale.shop_sale_id))
      toast.success('Sale entry removed.')
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Could not remove this sale.'))
    }
  }

  return (
    <Card className="p-6">
      <CardHeader title="Today’s Shop Sales" subtitle={dayjs().format('dddd, D MMMM')} icon={ShoppingBag} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Items sold today</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{formatNumber(totals.quantity)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-4 text-white shadow-lg shadow-emerald-500/25">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-50">Today’s revenue</p>
          <p className="mt-1 text-2xl font-extrabold">{formatMoney(totals.revenue)}</p>
        </div>
      </div>

      <form onSubmit={addSale} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Category</span><select value={form.category} onChange={(event) => changeCategory(event.target.value)} className="input" disabled={saving}>{Object.keys(SHOP_CATALOG).map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Item</span><select value={form.product} onChange={(event) => setForm((current) => ({ ...current, product: event.target.value }))} className="input" disabled={saving}>{SHOP_CATALOG[form.category].map((product) => <option key={product}>{product}</option>)}</select></label>
        {form.category === 'Bottles' && <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Bottle company</span><select value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} className="input" disabled={saving}><option value="">Select company</option>{BOTTLE_BRANDS.map((brand) => <option key={brand}>{brand}</option>)}</select></label>}
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Quantity</span><input type="number" min="1" step="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} className="input" disabled={saving} /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Price per item</span><input type="number" min="0" step="0.01" placeholder="Price" value={form.unitPrice} onChange={(event) => setForm((current) => ({ ...current, unitPrice: event.target.value }))} className="input" disabled={saving} /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Payment received</span><select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))} className="input" disabled={saving}><option>Cash</option><option>UPI</option></select></label>
        <div className="flex items-end"><Button type="submit" icon={Plus} loading={saving} disabled={loading} className="w-full">Add sale</Button></div>
      </form>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
        {loading ? <p className="p-4 text-sm text-slate-400">Loading today’s sales…</p> : sales.length === 0 ? <p className="p-4 text-sm text-slate-400">No sales added today yet.</p> : (
          <table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400 dark:bg-slate-800/50"><tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Total</th><th className="px-4 py-3" /></tr></thead><tbody>{sales.map((sale) => <tr key={sale.shop_sale_id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">{sale.brand ? `${sale.brand} ${sale.product_name}` : sale.product_name}</td><td className="px-4 py-3 text-slate-500">{sale.product_category}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${sale.payment_method === 'UPI' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>{sale.payment_method}</span></td><td className="px-4 py-3 text-slate-500">{sale.quantity}</td><td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{formatMoney(sale.quantity * sale.unit_price)}</td><td className="px-4 py-3 text-right"><button type="button" onClick={() => removeSale(sale)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" aria-label={`Remove ${sale.product_name}`}><Trash2 size={16} /></button></td></tr>)}</tbody></table>
        )}
      </div>
    </Card>
  )
}
