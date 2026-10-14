'use client'

import { useState } from 'react'
import { adjustStock } from '@/lib/actions/inventory'
import { Plus } from 'lucide-react'

const movementTypes = [
  { value: 'stock_in',        label: 'Stock In',       dir: 'in' },
  { value: 'stock_out',       label: 'Stock Out',      dir: 'out' },
  { value: 'adjustment_up',   label: 'Adjust Up',      dir: 'in' },
  { value: 'adjustment_down', label: 'Adjust Down',    dir: 'out' },
  { value: 'waste',           label: 'Waste / Damage', dir: 'out' },
]

export default function StockAdjustModal({
  productId,
  productName,
  currentQty,
  locationId,
}: {
  productId: string
  productName: string
  currentQty: number
  locationId: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [type, setType] = useState('stock_in')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    formData.set('product_id', productId)
    formData.set('location_id', locationId)
    formData.set('movement_type', type)
    const result = await adjustStock(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-7 h-7 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 rounded-lg flex items-center justify-center text-[#c9a84c] transition-colors"
      >
        <Plus size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl w-full max-w-sm p-5">
            <h2 className="text-[#f0ead8] font-semibold text-base mb-1">Adjust Stock</h2>
            <p className="text-[#6a5a40] text-xs mb-4">{productName} · Current: {currentQty}</p>

            <form action={handleSubmit} className="flex flex-col gap-3">
              {/* Movement type */}
              <div className="grid grid-cols-2 gap-2">
                {movementTypes.map(mt => (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => setType(mt.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                      type === mt.value
                        ? mt.dir === 'in'
                          ? 'bg-green-500/20 border-green-500/40 text-green-400'
                          : 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-[#1e1e1e] border-[#2a2a2a] text-[#6a5a40]'
                    }`}
                  >
                    {mt.label}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Notes (optional)</label>
                <input
                  name="notes"
                  placeholder="e.g. Delivery from supplier"
                  className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] text-[#a09070] py-3 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#c9a84c] hover:bg-[#e2c06a] disabled:opacity-50 text-black py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  {loading ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}