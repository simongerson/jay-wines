import { createClient } from '@/lib/supabase/server'
import POSClient from './POSClient'

export const dynamic = 'force-dynamic'

export default async function POSPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      id, name, brand, category, selling_price, unit_type,
      inventory (quantity_on_hand, location_id)
    `)
    .eq('is_active', true)
    .order('category')
    .order('name')

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('is_active', true)

  return <POSClient products={products ?? []} locations={locations ?? []} />
}