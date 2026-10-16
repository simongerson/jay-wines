'use client'

import { useState } from 'react'
import { createStaffAccount } from '@/lib/actions/settings'

export default function CreateStaffForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSuccess(false)
    setError('')
    const result = await createStaffAccount(formData)
    if (result?.error) setError(result.error)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Full Name</label>
        <input
          name="full_name"
          required
          placeholder="Staff member's name"
          className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="staff@jaywines.co.ke"
          className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Password</label>
        <input
          name="password"
          type="password"
          required
          placeholder="Min 6 characters"
          className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Role</label>
        <select
          name="role"
          className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
        >
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}
      {success && <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">Account created successfully.</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-[#c9a84c] hover:bg-[#e2c06a] disabled:opacity-50 text-black font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? 'Creating…' : 'Create Account'}
      </button>
    </form>
  )
}