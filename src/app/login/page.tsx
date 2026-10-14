'use client'

import { useState } from 'react'
import { login } from '@/lib/auth/actions'
import { Wine } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-[#c9a84c] rounded-2xl flex items-center justify-center mb-4">
          <Wine className="text-black" size={28} />
        </div>
        <h1 className="text-[#c9a84c] text-2xl font-bold tracking-wide">Jay Wines</h1>
        <p className="text-[#6a5a40] text-sm mt-1 tracking-widest uppercase">Mini Bar · Manager</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#161616] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-white text-lg font-semibold mb-1">Sign in</h2>
        <p className="text-[#6a5a40] text-sm mb-6">Enter your credentials to continue</p>

        <form action={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#3a3a3a] focus:outline-none focus:border-[#c9a84c] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#a09070] text-xs font-semibold uppercase tracking-wider">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#3a3a3a] focus:outline-none focus:border-[#c9a84c] transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c9a84c] hover:bg-[#e2c06a] disabled:opacity-50 text-black font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

        </form>
      </div>

      <p className="text-[#3a3a3a] text-xs mt-6">
        Jay Wines Inventory Management · v1.0
      </p>
    </div>
  )
}