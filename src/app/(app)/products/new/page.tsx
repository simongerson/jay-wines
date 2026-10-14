import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProductForm from '../ProductForm'

export default function NewProductPage() {
  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/products" className="w-9 h-9 bg-[#161616] border border-[#2a2a2a] rounded-xl flex items-center justify-center text-[#a09070]">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-[#f0ead8] font-display font-bold text-xl">Add Product</h1>
      </div>
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5">
        <ProductForm />
      </div>
    </div>
  )
}