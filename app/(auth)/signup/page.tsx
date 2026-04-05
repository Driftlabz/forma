'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col px-6 py-16">
        <div className="mb-12">
          <span className="text-[#1A6FFF] text-sm font-body tracking-widest uppercase">Forma</span>
          <span className="text-[#ECEAE5]/30 text-sm font-body"> by Driftlabs</span>
        </div>
        <div className="max-w-sm">
          <h1 className="font-heading text-3xl font-semibold text-[#ECEAE5] mb-2">
            Check your email
          </h1>
          <p className="font-body text-[#ECEAE5]/50 text-sm">
            We&apos;ve sent a confirmation link to <span className="text-[#ECEAE5]">{email}</span>.
            Click it to activate your account.
          </p>
          <p className="font-body text-sm text-[#ECEAE5]/40 mt-8">
            <Link href="/login" className="text-[#1A6FFF] hover:text-[#5592FF] transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col px-6 py-16">
      <div className="mb-12">
        <span className="text-[#1A6FFF] text-sm font-body tracking-widest uppercase">Forma</span>
        <span className="text-[#ECEAE5]/30 text-sm font-body"> by Driftlabs</span>
      </div>

      <div className="max-w-sm">
        <h1 className="font-heading text-3xl font-semibold text-[#ECEAE5] mb-2">
          Create account
        </h1>
        <p className="font-body text-[#ECEAE5]/50 text-sm mb-10">
          Start building with Forma.
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
              autoComplete="new-password"
              className="w-full bg-[#0F0F0F] border border-[#1E1E1E] text-[#ECEAE5] font-body text-sm px-4 py-3 focus:outline-none focus:border-[#1A6FFF] transition-colors placeholder:text-[#ECEAE5]/20"
              placeholder="Min. 6 characters"
            />
          </div>

          <div>
            <label className="block font-body text-xs text-[#ECEAE5]/50 mb-1.5 uppercase tracking-wider">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="font-body text-sm text-[#ECEAE5]/40 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-[#1A6FFF] hover:text-[#5592FF] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
