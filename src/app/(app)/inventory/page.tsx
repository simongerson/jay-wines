import { createClient } from '@/lib/supabase/server'
import { Boxes, TrendingDown, TrendingUp } from 'lucide-react'
import StockAdjustModal from './StockAdjustModal'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const supabase = await createClient()

  const { data: inventory } = await supabase
    .from('inventory')
    .select(`
      id,
      quantity_on_hand,
      reorder_point,
      products (id, name, brand, category, unit_type)
    `)
    .order('quantity_on_hand', { ascending: true })

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')

  const { data: movements } = await supabase
    .from('stock_movements')
    .select(`
      id,
      movement_type,
      quantity_change,
      quantity_after,
      notes,
      created_at,
      products (name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  const outOfStock = inventory?.filter(i => i.quantity_on_hand === 0).length ?? 0
  const lowStock = inventory?.filter(i => i.quantity_on_hand > 0 && i.quantity_on_hand <= i.reorder_point).length ?? 0

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center">
          <Boxes size={18} className="text-[#c9a84c]" />
        </div>
        <h1 className="text-[#f0ead8] font-display font-bold text-xl">Inventory</h1>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 mb-5">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center flex-1">
          <p className="text-red-400 font-bold text-lg">{outOfStock}</p>
          <p className="text-red-400/70 text-xs">Out of stock</p>
        </div>
        <div className="bg-[#e2a840]/10 border border-[#e2a840]/20 rounded-xl px-3 py-2 text-center flex-1">
          <p className="text-[#e2a840] font-bold text-lg">{lowStock}</p>
          <p className="text-[#e2a840]/70 text-xs">Low stock</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 text-center flex-1">
          <p className="text-green-400 font-bold text-lg">{(inventory?.length ?? 0) - outOfStock - lowStock}</p>
          <p className="text-green-400/70 text-xs">Healthy</p>
        </div>
      </div>

      {/* Stock list */}
      <h2 className="text-[#a09070] text-xs font-semibold uppercase tracking-wider mb-3">Stock Levels</h2>
      <div className="flex flex-col gap-2 mb-8">
        {inventory?.map((item: any) => {
          const product = item.products
          const qty = item.quantity_on_hand
          const reorder = item.reorder_point
          const status = qty === 0 ? 'out' : qty <= reorder ? 'low' : 'ok'

          return (
            <div key={item.id} className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[#f0ead8] text-sm font-medium truncate">{product?.name}</p>
                <p className="text-[#6a5a40] text-xs">{product?.brand} · {product?.category}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                  status === 'out' ? 'bg-red-500/10 text-red-400' :
                  status === 'low' ? 'bg-[#e2a840]/10 text-[#e2a840]' :
                  'bg-green-500/10 text-green-400'
                }`}>
                  {qty} {product?.unit_type}s
                </span>

                <StockAdjustModal
                  productId={product?.id}
                  productName={product?.name}
                  currentQty={qty}
                  locationId={locations?.[0]?.id}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent movements */}
      <h2 className="text-[#a09070] text-xs font-semibold uppercase tracking-wider mb-3">Recent Movements</h2>
      <div className="flex flex-col gap-2">
        {movements?.map((m: any) => {
          const isIn = m.quantity_change > 0
          return (
            <div key={m.id} className="bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isIn ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {isIn
                  ? <TrendingUp size={13} className="text-green-400" />
                  : <TrendingDown size={13} className="text-red-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#f0ead8] text-xs font-medium truncate">{m.products?.name}</p>
                <p className="text-[#6a5a40] text-[10px]">
                  {m.movement_type.replace('_', ' ')} · {new Date(m.created_at).toLocaleDateString('en-KE')}
                </p>
              </div>
              <span className={`text-xs font-bold shrink-0 ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                {isIn ? '+' : ''}{m.quantity_change} → {m.quantity_after}
              </span>
            </div>
          )
        })}
        {(movements?.length ?? 0) === 0 && (
          <p className="text-center text-[#6a5a40] text-sm py-8">No movements yet.</p>
        )}
      </div>
    </div>
  )
}