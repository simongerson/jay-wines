'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const data = {
    name: formData.get('name') as string,
    brand: formData.get('brand') as string,
    category: formData.get('category') as string,
    type: formData.get('type') as string,
    sku: formData.get('sku') as string,
    description: formData.get('description') as string,
    cost_price: parseFloat(formData.get('cost_price') as string) || 0,
    selling_price: parseFloat(formData.get('selling_price') as string),
    wholesale_price: parseFloat(formData.get('wholesale_price') as string) || null,
    unit_type: formData.get('unit_type') as string,
    volume_ml: parseInt(formData.get('volume_ml') as string) || null,
    alcohol_content: parseFloat(formData.get('alcohol_content') as string) || null,
    reorder_quantity: parseInt(formData.get('reorder_quantity') as string) || 10,
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single()

  if (error) return { error: error.message }

  // Create inventory record for default location
  const { data: location } = await supabase
    .from('locations')
    .select('id')
    .limit(1)
    .single()

  if (location) {
    await supabase.from('inventory').insert({
      product_id: product.id,
      location_id: location.id,
      quantity_on_hand: 0,
      reorder_point: parseInt(formData.get('reorder_quantity') as string) || 10,
    })
  }

  revalidatePath('/products')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  const data = {
    name: formData.get('name') as string,
    brand: formData.get('brand') as string,
    category: formData.get('category') as string,
    type: formData.get('type') as string,
    sku: formData.get('sku') as string,
    description: formData.get('description') as string,
    cost_price: parseFloat(formData.get('cost_price') as string) || 0,
    selling_price: parseFloat(formData.get('selling_price') as string),
    wholesale_price: parseFloat(formData.get('wholesale_price') as string) || null,
    unit_type: formData.get('unit_type') as string,
    volume_ml: parseInt(formData.get('volume_ml') as string) || null,
    alcohol_content: parseFloat(formData.get('alcohol_content') as string) || null,
    reorder_quantity: parseInt(formData.get('reorder_quantity') as string) || 10,
  }

  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/products')
  return { success: true }
}