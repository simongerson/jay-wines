import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import Sidebar from '@/components/layout/Sidebar'

export const instant = false
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
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav role={profile?.role ?? 'cashier'} />
      </div>
    </div>
  )
}