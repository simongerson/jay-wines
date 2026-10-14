'use client'

import { useState } from 'react'
import { completeSale } from '@/lib/actions/pos'
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle } from 'lucide-react'
import { useLocation } from '@/lib/context/LocationContext'

type Product = {
  id: string
  name: string
  brand: string
  category: string
  selling_price: number
  unit_type: string
  inventory: { quantity_on_hand: number; location_id: string }[]
}

type CartItem = {
  product: Product
  quantity: number
}

const categories = ['All', 'Wine', 'Spirit', 'Beer', 'KBL Keg', 'Liqueur', 'Other']

const paymentMethods = [
  { value: 'cash',  label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'card',  label: 'Card' },
]

export default function POSClient({
  products,
  locations,
}: {
  products: Product[]
  locations: { id: string; name: string }[]
}) {
  const { location } = useLocation()
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState('All')
  const [payment, setPayment] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<{ saleId: string; total: number } | null>(null)

  const filtered = category === 'All' ? products : products.filter(p => p.category === category)

  function getStock(product: Product) {
    if (!location) return product.inventory?.[0]?.quantity_on_hand ?? 0
    return product.inventory?.find(i => i.location_id === location.id)?.quantity_on_hand ?? 0
  }

  function addToCart(product: Product) {
    const stock = getStock(product)
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= stock) return prev
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      if (stock === 0) return prev
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(productId: string, delta: number) {
    setCart(prev => prev
      .map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    )
  }

  function removeItem(productId: string) {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }

  const total = cart.reduce((sum, i) => sum + Number(i.product.selling_price) * i.quantity, 0)

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    setError('')
    const items = cart.map(i => ({
      product_id: i.product.id,
      quantity: i.quantity,
      unit_price: Number(i.product.selling_price),
    }))
    const result = await completeSale(items, payment)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setReceipt({ saleId: result.saleId!, total: result.total! })
      setCart([])
      setLoading(false)
    }
  }

  // Receipt screen
  if (receipt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h2 className="text-[#f0ead8] font-display font-bold text-2xl mb-1">Sale Complete</h2>
        <p className="text-[#6a5a40] text-sm mb-2">#{receipt.saleId.slice(0, 8).toUpperCase()}</p>
        <p className="text-[#c9a84c] font-bold text-3xl mb-6">
          KES {receipt.total.toLocaleString()}
        </p>
        <button
          onClick={() => setReceipt(null)}
          className="bg-[#c9a84c] hover:bg-[#e2c06a] text-black font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
        >
          New Sale
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center">
            <ShoppingCart size={18} className="text-[#c9a84c]" />
          </div>
          <h1 className="text-[#f0ead8] font-display font-bold text-xl">POS</h1>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat ? 'bg-[#c9a84c] text-black' : 'bg-[#161616] border border-[#2a2a2a] text-[#a09070]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {filtered.map(product => {
            const stock = getStock(product)
            const inCart = cart.find(i => i.product.id === product.id)
            const outOfStock = stock === 0

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={outOfStock}
                className={`bg-[#161616] border rounded-2xl p-3 text-left transition-all active:scale-95 ${
                  outOfStock ? 'border-[#1e1e1e] opacity-40' :
                  inCart ? 'border-[#c9a84c]/50 bg-[#c9a84c]/5' :
                  'border-[#2a2a2a] hover:border-[#3a3a3a]'
                }`}
              >
                <p className="text-[#f0ead8] text-xs font-semibold leading-tight mb-1 line-clamp-2">{product.name}</p>
                <p className="text-[#6a5a40] text-[10px] mb-2">{product.brand}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#c9a84c] text-sm font-bold">
                    KES {Number(product.selling_price).toLocaleString()}
                  </span>
                  {inCart && (
                    <span className="bg-[#c9a84c] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {inCart.quantity}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] mt-1 ${stock <= 5 ? 'text-[#e2a840]' : 'text-[#3a3a3a]'}`}>
                  {outOfStock ? 'Out of stock' : `${stock} left`}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="border-t border-[#2a2a2a] bg-[#0d0d0d] px-4 pt-3 pb-24 md:pb-4">
          <p className="text-[#a09070] text-xs font-semibold uppercase tracking-wider mb-2">Cart</p>

          <div className="flex flex-col gap-2 mb-3 max-h-40 overflow-y-auto">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-2">
                <p className="flex-1 text-[#f0ead8] text-xs truncate">{item.product.name}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.product.id, -1)}
                    className="w-6 h-6 bg-[#1e1e1e] rounded-lg flex items-center justify-center text-[#a09070]">
                    <Minus size={10} />
                  </button>
                  <span className="text-[#f0ead8] text-xs w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, 1)}
                    className="w-6 h-6 bg-[#1e1e1e] rounded-lg flex items-center justify-center text-[#a09070]">
                    <Plus size={10} />
                  </button>
                </div>
                <span className="text-[#c9a84c] text-xs font-semibold w-16 text-right">
                  KES {(Number(item.product.selling_price) * item.quantity).toLocaleString()}
                </span>
                <button onClick={() => removeItem(item.product.id)} className="text-[#3a3a3a] hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Payment method */}
          <div className="flex gap-2 mb-3">
            {paymentMethods.map(pm => (
              <button
                key={pm.value}
                onClick={() => setPayment(pm.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  payment === pm.value
                    ? 'bg-[#c9a84c]/20 border-[#c9a84c]/50 text-[#c9a84c]'
                    : 'bg-[#161616] border-[#2a2a2a] text-[#6a5a40]'
                }`}
              >
                {pm.label}
              </button>
            ))}
          </div>

          {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#c9a84c] hover:bg-[#e2c06a] disabled:opacity-50 text-black font-bold py-4 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Processing…' : `Charge KES ${total.toLocaleString()}`}
          </button>
        </div>
      )}
    </div>
  )
}