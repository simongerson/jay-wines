import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, Users, Lock, User } from 'lucide-react'
import ProfileForm from './ProfileForm'
import PasswordForm from './PasswordForm'
import CreateStaffForm from './CreateStaffForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isManager = profile?.role === 'manager'

  // Get all staff if manager
  const { data: staff } = isManager
    ? await supabase.from('user_profiles').select('id, full_name, role, email').order('full_name')
    : { data: null }

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center">
          <Settings size={18} className="text-[#c9a84c]" />
        </div>
        <h1 className="text-[#f0ead8] font-display font-bold text-xl">Settings</h1>
      </div>

      {/* Profile section */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={14} className="text-[#c9a84c]" />
          <h2 className="text-[#f0ead8] text-sm font-semibold">Your Profile</h2>
        </div>
        <div className="mb-4 p-3 bg-[#1e1e1e] rounded-xl">
          <p className="text-[#6a5a40] text-xs">Email</p>
          <p className="text-[#f0ead8] text-sm">{user.email}</p>
        </div>
        <div className="mb-4 p-3 bg-[#1e1e1e] rounded-xl">
          <p className="text-[#6a5a40] text-xs">Role</p>
          <p className="text-[#c9a84c] text-sm font-semibold capitalize">{profile?.role}</p>
        </div>
        <ProfileForm fullName={profile?.full_name ?? ''} />
      </div>

      {/* Password section */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={14} className="text-[#c9a84c]" />
          <h2 className="text-[#f0ead8] text-sm font-semibold">Change Password</h2>
        </div>
        <PasswordForm />
      </div>

      {/* Manager only: staff list + create */}
      {isManager && (
        <>
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center gap-2">
              <Users size={14} className="text-[#c9a84c]" />
              <h2 className="text-[#f0ead8] text-sm font-semibold">Staff Accounts</h2>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {staff?.map(member => (
                <div key={member.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[#f0ead8] text-sm">{member.full_name}</p>
                    <p className="text-[#6a5a40] text-xs">{member.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    member.role === 'manager'
                      ? 'bg-[#c9a84c]/10 text-[#c9a84c]'
                      : 'bg-[#2a2a2a] text-[#a09070]'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
              {(staff?.length ?? 0) === 0 && (
                <p className="text-center text-[#6a5a40] text-sm py-6">No staff yet.</p>
              )}
            </div>
          </div>

          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-[#c9a84c]" />
              <h2 className="text-[#f0ead8] text-sm font-semibold">Add Staff Account</h2>
            </div>
            <CreateStaffForm />
          </div>
        </>
      )}
    </div>
  )
}