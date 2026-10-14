import { createClient } from '@/lib/supabase/server'
import { BarChart2, TrendingUp, ShoppingBag, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const range = params.range ?? '7'
  const days = parseInt(range)

  const since = new Date()
  since.setDate(since.getDate() - days)
  since.setHours(0, 0, 0, 0)

  // Sales in range
  const { data: sales } = await supabase
    .from('sales')
    .select('id, total_amount, payment_method, created_at')
    .eq('status', 'completed')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  // Sale items for top sellers
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('quantity, subtotal, unit_price, products(id, name, category)')
    .gte('created_at', since.toISOString())

  // Total revenue
  const totalRevenue = sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) ?? 0
  const txCount = sales?.length ?? 0
  const avgOrder = txCount > 0 ? totalRevenue / txCount : 0

  // Payment method breakdown
  const paymentBreakdown = sales?.reduce((acc: Record<string, number>, s) => {
    const method = s.payment_method ?? 'cash'
    acc[method] = (acc[method] ?? 0) + Number(s.total_amount)
    return acc
  }, {}) ?? {}

  // Top sellers by revenue
  const productMap: Record<string, { name: string; category: string; qty: number; revenue: number }> = {}
  saleItems?.forEach((item: any) => {
    const id = item.products?.id
    if (!id) return
    if (!productMap[id]) {
      productMap[id] = { name: item.products.name, category: item.products.category, qty: 0, revenue: 0 }
    }
    productMap[id].qty += item.quantity
    productMap[id].revenue += Number(item.subtotal)
  })
  const topSellers = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Daily sales for sparkline
  const dailyMap: Record<string, number> = {}
  sales?.forEach(s => {
    const day = new Date(s.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
    dailyMap[day] = (dailyMap[day] ?? 0) + Number(s.total_amount)
  })
  const dailyData = Object.entries(dailyMap).reverse()

  const ranges = [
    { label: 'Today', value: '1' },
    { label: '7 days', value: '7' },
    { label: '30 days', value: '30' },
    { label: '90 days', value: '90' },
  ]

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center">
          <BarChart2 size={18} className="text-[#c9a84c]" />
        </div>
        <h1 className="text-[#f0ead8] font-display font-bold text-xl">Reports</h1>
      </div>

      {/* Range selector */}
      <div className="flex gap-2 mb-5">
        {ranges.map(r => (
          <a
            key={r.value}
            href={`/reports?range=${r.value}`}
            className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold border transition-colors ${
              range === r.value
                ? 'bg-[#c9a84c] text-black border-[#c9a84c]'
                : 'bg-[#161616] border-[#2a2a2a] text-[#a09070]'
            }`}
          >
            {r.label}
          </a>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-[#161616] border border-[#c9a84c]/20 rounded-2xl p-3 text-center">
          <p className="text-[#c9a84c] font-bold text-lg leading-tight">
            {totalRevenue >= 1000 ? `${(totalRevenue/1000).toFixed(1)}K` : totalRevenue.toLocaleString()}
          </p>
          <p className="text-[#6a5a40] text-[10px] mt-0.5">KES Revenue</p>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-3 text-center">
          <p className="text-[#f0ead8] font-bold text-lg leading-tight">{txCount}</p>
          <p className="text-[#6a5a40] text-[10px] mt-0.5">Transactions</p>
        </div>
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-3 text-center">
          <p className="text-[#f0ead8] font-bold text-lg leading-tight">
            {avgOrder >= 1000 ? `${(avgOrder/1000).toFixed(1)}K` : Math.round(avgOrder).toLocaleString()}
          </p>
          <p className="text-[#6a5a40] text-[10px] mt-0.5">Avg Order</p>
        </div>
      </div>

      {/* Payment breakdown */}
      {Object.keys(paymentBreakdown).length > 0 && (
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-4 mb-5">
          <p className="text-[#a09070] text-xs font-semibold uppercase tracking-wider mb-3">Payment Methods</p>
          <div className="flex flex-col gap-2">
            {Object.entries(paymentBreakdown).map(([method, amount]) => {
              const pct = Math.round((amount / totalRevenue) * 100)
              return (
                <div key={method}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#f0ead8] text-xs capitalize">{method}</span>
                    <span className="text-[#c9a84c] text-xs font-semibold">
                      KES {Number(amount).toLocaleString()} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c9a84c] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top sellers */}
      {topSellers.length > 0 && (
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center gap-2">
            <TrendingUp size={14} className="text-[#c9a84c]" />
            <span className="text-[#f0ead8] text-sm font-semibold">Top Sellers</span>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {topSellers.map((p, i) => (
              <div key={p.name} className="px-4 py-3 flex items-center gap-3">
                <span className="text-[#3a3a3a] text-xs font-bold w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f0ead8] text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[#6a5a40] text-[10px]">{p.category} · {p.qty} units sold</p>
                </div>
                <span className="text-[#c9a84c] text-xs font-semibold shrink-0">
                  KES {p.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily breakdown */}
      {dailyData.length > 0 && (
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center gap-2">
            <Calendar size={14} className="text-[#c9a84c]" />
            <span className="text-[#f0ead8] text-sm font-semibold">Daily Breakdown</span>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {dailyData.map(([day, amount]) => (
              <div key={day} className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-[#a09070] text-xs">{day}</span>
                <span className="text-[#f0ead8] text-xs font-semibold">
                  KES {Number(amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sales list */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center gap-2">
          <ShoppingBag size={14} className="text-[#c9a84c]" />
          <span className="text-[#f0ead8] text-sm font-semibold">Recent Sales</span>
        </div>
        {(sales?.length ?? 0) === 0 ? (
          <p className="text-center text-[#6a5a40] text-sm py-8">No sales in this period.</p>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {sales?.slice(0, 30).map(s => (
              <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[#f0ead8] text-xs font-medium">
                    #{s.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[#6a5a40] text-[10px]">
                    {new Date(s.created_at).toLocaleString('en-KE', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })} · {s.payment_method}
                  </p>
                </div>
                <span className="text-[#c9a84c] text-sm font-semibold">
                  KES {Number(s.total_amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}