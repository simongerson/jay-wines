'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeSale(items: {
  product_id: string
  quantity: number
  unit_price: number
}[], paymentMethod: string, locationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!locationId) return { error: 'No location selected' }

  const total = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)

  // Create sale record
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      location_id: locationId,
      cashier_id: user.id,
      total_amount: total,
      payment_method: paymentMethod,
      status: 'completed',
    })
    .select()
    .single()

  if (saleError) return { error: saleError.message }

  // Insert sale items
  const saleItems = items.map(i => ({
    sale_id: sale.id,
    product_id: i.product_id,
    quantity: i.quantity,
    unit_price: i.unit_price,
    subtotal: i.unit_price * i.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItems)

  if (itemsError) return { error: itemsError.message }

  // Deduct stock for each item
  for (const item of items) {
    const { data: inv } = await supabase
      .from('inventory')
      .select('id, quantity_on_hand')
      .eq('product_id', item.product_id)
      .eq('location_id', locationId)
      .single()

    if (inv) {
      const newQty = inv.quantity_on_hand - item.quantity
      await supabase
        .from('inventory')
        .update({ quantity_on_hand: Math.max(0, newQty) })
        .eq('id', inv.id)

      await supabase.from('stock_movements').insert({
        inventory_id: inv.id,
        product_id: item.product_id,
        location_id: locationId,
        movement_type: 'sale',
        quantity_change: -item.quantity,
        quantity_before: inv.quantity_on_hand,
        quantity_after: Math.max(0, newQty),
        notes: `Sale #${sale.id.slice(0, 8)}`,
        performed_by: user.id,
      })
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/inventory')
  return { success: true, saleId: sale.id, total }
}