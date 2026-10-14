import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import LocationSwitcher from '@/components/layout/LocationSwitcher'
import { LocationProvider } from '@/lib/context/LocationContext'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role, location_id')
    .eq('id', user.id)
    .single()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  const defaultLocation = locations?.find(l => l.id === profile?.location_id)
    ?? locations?.[0]
    ?? null

  return (
    <LocationProvider locations={locations ?? []} defaultLocation={defaultLocation}>
      <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">
        <Sidebar profile={profile} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Location bar */}
          {(locations?.length ?? 0) > 0 && (
            <div className="border-b border-[#1e1e1e] flex items-center justify-between px-2 py-1 shrink-0">
              <LocationSwitcher locations={locations ?? []} />
            </div>
          )}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav role={profile?.role ?? 'cashier'} />
        </div>
      </div>
    </LocationProvider>
  )
}