'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col px-6 py-16">
      <div className="mb-12">
        <span className="text-[#1A6FFF] text-sm font-body tracking-widest uppercase">Forma</span>
        <span className="text-[#ECEAE5]/30 text-sm font-body"> by Driftlabs</span>
      </div>

      <div className="max-w-sm">
        <h1 className="font-heading text-3xl font-semibold text-[#ECEAE5] mb-2">
          Sign in
        </h1>
        <p className="font-body text-[#ECEAE5]/50 text-sm mb-10">
          Welcome back to Forma.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body text-xs text-[#ECEAE5]/50 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-[#0F0F0F] border border-[#1E1E1E] text-[#ECEAE5] font-body text-sm px-4 py-3 focus:outline-none focus:border-[#1A6FFF] transition-colors placeholder:text-[#ECEAE5]/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block font-body text-xs text-[#ECEAE5]/50 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-[#0F0F0F] border border-[#1E1E1E] text-[#ECEAE5] font-body text-sm px-4 py-3 focus:outline-none focus:border-[#1A6FFF] transition-colors placeholder:text-[#ECEAE5]/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-body text-sm text-[#DC2626] py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A6FFF] text-white font-body text-sm font-medium px-4 py-3 mt-2 hover:bg-[#1557CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="font-body text-sm text-[#ECEAE5]/40 mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#1A6FFF] hover:text-[#5592FF] transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
