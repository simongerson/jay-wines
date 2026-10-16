'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adjustStock(formData: FormData) {
  const supabase = await createClient()

  const product_id = formData.get('product_id') as string
  const location_id = formData.get('location_id') as string
  const movement_type = formData.get('movement_type') as string
  const quantity = parseInt(formData.get('quantity') as string)
  const notes = formData.get('notes') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current stock
  const { data: inv } = await supabase
    .from('inventory')
    .select('id, quantity_on_hand')
    .eq('product_id', product_id)
    .eq('location_id', location_id)
    .single()

  if (!inv) return { error: 'Inventory record not found' }

  const delta = movement_type === 'stock_out' || movement_type === 'waste' || movement_type === 'adjustment_down'
    ? -quantity
    : quantity

  const new_quantity = inv.quantity_on_hand + delta

  if (new_quantity < 0) return { error: 'Insufficient stock' }

  // Update inventory
  const { error: updateError } = await supabase
    .from('inventory')
    .update({ quantity_on_hand: new_quantity })
    .eq('id', inv.id)

  if (updateError) return { error: updateError.message }

  // Record movement
  const { error: movError } = await supabase
    .from('stock_movements')
    .insert({
      inventory_id: inv.id,
      product_id,
      location_id,
      movement_type,
      quantity_change: delta,
      quantity_before: inv.quantity_on_hand,
      quantity_after: new_quantity,
      notes,
      performed_by: user.id,
    })

  if (movError) return { error: movError.message }

  revalidatePath('/inventory')
  revalidatePath('/dashboard')
  return { success: true }
}