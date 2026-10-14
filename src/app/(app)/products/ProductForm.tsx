'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/products'
import { Trash2 } from 'lucide-react'

const categories = ['Wine', 'Spirit', 'Beer', 'KBL Keg', 'Liqueur', 'Other']
const unitTypes = ['bottle', 'cup', 'can', 'litre', 'tot', 'glass']

export default function ProductForm({ product }: { product?: any }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isEdit = !!product

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = isEdit
      ? await updateProduct(product.id, formData)
      : await createProduct(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/products')
    }
  }

  async function handleDelete() {
    if (!confirm('Remove this product?')) return
    setLoading(true)
    await deleteProduct(product.id)
    router.push('/products')
  }

  const field = (label: string, name: string, props: any = {}) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">{label}</label>
      <input
        name={name}
        defaultValue={product?.[name] ?? ''}
        className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm placeholder-[#3a3a3a] focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
        {...props}
      />
    </div>
  )

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">

      {field('Product Name *', 'name', { required: true, placeholder: 'e.g. Nederburg Classic Red' })}
      {field('Brand *', 'brand', { required: true, placeholder: 'e.g. Nederburg' })}

      <div className="flex flex-col gap-1.5">
        <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Category *</label>
        <select
          name="category"
          defaultValue={product?.category ?? ''}
          required
          className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
        >
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {field('Type', 'type', { placeholder: 'e.g. Red Wine, Vodka, Lager' })}
      {field('SKU *', 'sku', { required: true, placeholder: 'e.g. WN-001' })}

      <div className="grid grid-cols-2 gap-3">
        {field('Cost Price (KES)', 'cost_price', { type: 'number', min: 0, step: '0.01', placeholder: '0' })}
        {field('Selling Price (KES) *', 'selling_price', { type: 'number', min: 0, step: '0.01', required: true, placeholder: '0' })}
      </div>

      {field('Wholesale Price (KES)', 'wholesale_price', { type: 'number', min: 0, step: '0.01', placeholder: 'Optional' })}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Unit Type</label>
          <select
            name="unit_type"
            defaultValue={product?.unit_type ?? 'bottle'}
            className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
          >
            {unitTypes.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {field('Volume (ml)', 'volume_ml', { type: 'number', placeholder: 'e.g. 750' })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Alcohol % (ABV)', 'alcohol_content', { type: 'number', step: '0.1', placeholder: 'e.g. 13.5' })}
        {field('Reorder Qty', 'reorder_quantity', { type: 'number', min: 0, placeholder: '10' })}
      </div>

      {field('Description', 'description', { placeholder: 'Optional notes about this product' })}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#c9a84c] hover:bg-[#e2c06a] disabled:opacity-50 text-black font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-12 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

    </form>
  )
}