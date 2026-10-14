import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Plus, Search } from 'lucide-react'

const categoryColors: Record<string, string> = {
  Wine:    'bg-purple-500/10 text-purple-400',
  Spirit:  'bg-amber-500/10 text-amber-400',
  Beer:    'bg-yellow-500/10 text-yellow-400',
  'KBL Keg': 'bg-green-500/10 text-green-400',
  Liqueur: 'bg-pink-500/10 text-pink-400',
  Other:   'bg-zinc-500/10 text-zinc-400',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const q = params.q ?? ''
  const category = params.category ?? ''

  let query = supabase
    .from('products')
    .select('*, inventory(quantity_on_hand, reorder_point)')
    .eq('is_active', true)
    .order('name')

  if (q) query = query.ilike('name', `%${q}%`)
  if (category) query = query.eq('category', category)

  const { data: products } = await query

  const categories = ['Wine', 'Spirit', 'Beer', 'KBL Keg', 'Liqueur', 'Other']

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center">
            <Package size={18} className="text-[#c9a84c]" />
          </div>
          <h1 className="text-[#f0ead8] font-display font-bold text-xl">Products</h1>
        </div>
        <Link
          href="/products/new"
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#e2c06a] text-black text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} />
          Add
        </Link>
      </div>

      {/* Search */}
      <form className="relative mb-3">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a5a40]" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#f0ead8] placeholder-[#3a3a3a] focus:outline-none focus:border-[#c9a84c]/50"
        />
      </form>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        <Link
          href="/products"
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !category ? 'bg-[#c9a84c] text-black' : 'bg-[#161616] border border-[#2a2a2a] text-[#a09070]'
          }`}
        >
          All
        </Link>
        {categories.map(cat => (
          <Link
            key={cat}
            href={`/products?category=${cat}`}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              category === cat ? 'bg-[#c9a84c] text-black' : 'bg-[#161616] border border-[#2a2a2a] text-[#a09070]'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Product list */}
      <div className="flex flex-col gap-2">
        {products?.length === 0 && (
          <div className="text-center py-16 text-[#6a5a40]">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No products yet.</p>
            <Link href="/products/new" className="text-[#c9a84c] text-sm mt-1 inline-block">
              Add your first product →
            </Link>
          </div>
        )}

        {products?.map((product: any) => {
          const inv = product.inventory?.[0]
          const qty = inv?.quantity_on_hand ?? 0
          const reorder = inv?.reorder_point ?? 10
          const stockStatus = qty === 0 ? 'out' : qty <= reorder ? 'low' : 'ok'

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${categoryColors[product.category] ?? categoryColors.Other}`}>
                    {product.category}
                  </span>
                </div>
                <p className="text-[#f0ead8] font-medium text-sm truncate">{product.name}</p>
                <p className="text-[#6a5a40] text-xs">{product.brand} · SKU: {product.sku}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[#c9a84c] font-semibold text-sm">
                  KES {Number(product.selling_price).toLocaleString()}
                </p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                  stockStatus === 'out' ? 'bg-red-500/10 text-red-400' :
                  stockStatus === 'low' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-green-500/10 text-green-400'
                }`}>
                  {stockStatus === 'out' ? 'Out of stock' :
                   stockStatus === 'low' ? `${qty} left` :
                   `${qty} in stock`}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}