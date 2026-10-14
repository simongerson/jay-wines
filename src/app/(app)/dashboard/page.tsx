import { createClient } from '@/lib/supabase/server'
import { connection } from 'next/server'
import { LayoutDashboard, TrendingUp, Package, AlertTriangle } from 'lucide-react'

export default async function DashboardPage() {
  await connection()
  const supabase = await createClient()

  // Today's sales
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todaySales } = await supabase
    .from('sales')
    .select('total_amount')
    .gte('created_at', today.toISOString())

  const totalToday = todaySales?.reduce((sum, s) => sum + Number(s.total_amount), 0) ?? 0
  const txCount = todaySales?.length ?? 0

  // Product count
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Low stock alerts
  const { data: lowStock } = await supabase
    .from('inventory')
    .select('id, quantity_on_hand, reorder_point, products(name)')
    .filter('quantity_on_hand', 'lte', 'reorder_point')

  const stats = [
    {
      label: "Today's Sales",
      value: `KES ${totalToday.toLocaleString()}`,
      sub: `${txCount} transactions`,
      icon: TrendingUp,
      color: 'text-[#c9a84c]',
      border: 'border-[#c9a84c]/30',
    },
    {
      label: 'Active Products',
      value: productCount ?? 0,
      sub: 'in catalogue',
      icon: Package,
      color: 'text-[#4caf82]',
      border: 'border-[#4caf82]/20',
    },
    {
      label: 'Low Stock',
      value: lowStock?.length ?? 0,
      sub: 'need reorder',
      icon: AlertTriangle,
      color: 'text-[#e2a840]',
      border: 'border-[#e2a840]/20',
    },
  ]

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center">
          <LayoutDashboard size={18} className="text-[#c9a84c]" />
        </div>
        <div>
          <h1 className="text-[#f0ead8] font-display font-bold text-xl leading-tight">Dashboard</h1>
          <p className="text-[#6a5a40] text-xs">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {stats.map(({ label, value, sub, icon: Icon, color, border }) => (
          <div
            key={label}
            className={`bg-[#161616] border ${border} rounded-2xl p-4 flex items-center gap-4`}
          >
            <div className={`w-11 h-11 rounded-xl bg-[#1e1e1e] flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[#6a5a40] text-xs uppercase tracking-wider font-semibold">{label}</p>
              <p className={`font-display font-bold text-2xl ${color} leading-tight`}>{value}</p>
              <p className="text-[#6a5a40] text-xs">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock List */}
      {(lowStock?.length ?? 0) > 0 && (
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#e2a840]" />
            <span className="text-[#f0ead8] text-sm font-semibold">Low Stock Alerts</span>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {lowStock?.map((item: any) => (
              <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                <span className="text-[#f0ead8] text-sm">{item.products?.name}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  item.quantity_on_hand === 0
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-[#e2a840]/10 text-[#e2a840]'
                }`}>
                  {item.quantity_on_hand === 0 ? 'Out of stock' : `${item.quantity_on_hand} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(lowStock?.length ?? 0) === 0 && txCount === 0 && (
        <div className="text-center py-10 text-[#6a5a40] text-sm">
          No sales yet today. Add products and start selling!
        </div>
      )}
    </div>
  )
}