'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/actions/settings'

export default function PasswordForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSuccess(false)
    setError('')
    const result = await updatePassword(formData)
    if (result?.error) setError(result.error)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">New Password</label>
        <input
          name="password"
          type="password"
          placeholder="Min 6 characters"
          className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">Confirm Password</label>
        <input
          name="confirm"
          type="password"
          placeholder="Repeat password"
          className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-[#f0ead8] text-sm focus:outline-none focus:border-[#c9a84c]/50"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">Password updated.</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-[#c9a84c] hover:bg-[#e2c06a] disabled:opacity-50 text-black font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? 'Saving…' : 'Update Password'}
      </button>
    </form>
  )
}