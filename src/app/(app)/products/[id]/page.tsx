import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProductForm from '../ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="w-9 h-9 bg-[#161616] border border-[#2a2a2a] rounded-xl flex items-center justify-center text-[#a09070]">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-[#f0ead8] font-display font-bold text-xl">Edit Product</h1>
          <p className="text-[#6a5a40] text-xs">{product.name}</p>
        </div>
      </div>
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5">
        <ProductForm product={product} />
      </div>
    </div>
  )
}