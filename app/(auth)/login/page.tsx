'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Space_Grotesk, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] })

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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505' }}>

      {/* LEFT COLUMN */}
      <div style={{
        width: '45%',
        minHeight: '100vh',
        background: '#050505',
        padding: '64px 0 64px 80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
      }}
        className="auth-left"
      >
        {/* Eyebrow */}
        <div style={{ marginBottom: '64px' }}>
          <span style={{
            fontFamily: inter.style.fontFamily,
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: '#1A6FFF',
            textTransform: 'uppercase',
          }}>
            FORMA
          </span>
          <span style={{
            fontFamily: inter.style.fontFamily,
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            color: 'rgba(236,234,229,0.35)',
            textTransform: 'uppercase',
          }}>
            {' '}by Driftlabs
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: spaceGrotesk.style.fontFamily,
          fontSize: '48px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#ECEAE5',
          margin: 0,
          lineHeight: 1.05,
        }}>
          Sign in
        </h1>

        {/* Subtext */}
        <p style={{
          fontFamily: inter.style.fontFamily,
          fontSize: '16px',
          fontWeight: 400,
          color: 'rgba(236,234,229,0.45)',
          marginTop: '12px',
          marginBottom: '48px',
        }}>
          Welcome back.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px' }}>

          {/* Email */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: inter.style.fontFamily,
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.10em',
              color: 'rgba(236,234,229,0.45)',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                width: '100%',
                height: '48px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0px',
                color: '#ECEAE5',
                fontFamily: inter.style.fontFamily,
                fontSize: '16px',
                padding: '0 16px',
                outline: 'none',
                transition: 'border-color 0.15s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(26,111,255,0.5)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontFamily: inter.style.fontFamily,
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.10em',
              color: 'rgba(236,234,229,0.45)',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                height: '48px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0px',
                color: '#ECEAE5',
                fontFamily: inter.style.fontFamily,
                fontSize: '16px',
                padding: '0 16px',
                outline: 'none',
                transition: 'border-color 0.15s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(26,111,255,0.5)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{
              fontFamily: inter.style.fontFamily,
              fontSize: '13px',
              color: '#DC2626',
              marginBottom: '8px',
              marginTop: '-8px',
            }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              background: loading ? 'rgba(26,111,255,0.5)' : '#1A6FFF',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0px',
              fontFamily: inter.style.fontFamily,
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
              marginTop: '8px',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1560e0' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1A6FFF' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Bottom link */}
        <p style={{
          fontFamily: inter.style.fontFamily,
          fontSize: '14px',
          color: 'rgba(236,234,229,0.45)',
          marginTop: '32px',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ color: '#1A6FFF', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>

      {/* DIVIDER */}
      <div style={{
        width: '1px',
        background: 'rgba(255,255,255,0.07)',
        flexShrink: 0,
      }} className="auth-divider" />

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        background: '#050505',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }} className="auth-right">

        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,111,255,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        {/* Wordmark watermark */}
        <span style={{
          fontFamily: spaceGrotesk.style.fontFamily,
          fontSize: '120px',
          fontWeight: 700,
          color: 'rgba(236,234,229,0.08)',
          letterSpacing: '-0.03em',
          userSelect: 'none',
          lineHeight: 1,
          position: 'relative',
          zIndex: 1,
        }}>
          FORMA
        </span>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .auth-left {
            width: 100% !important;
            padding: 32px 24px !important;
          }
          .auth-divider {
            display: none !important;
          }
          .auth-right {
            display: none !important;
          }
          .auth-left h1 {
            font-size: 32px !important;
          }
        }
        input::placeholder {
          color: rgba(236,234,229,0.2);
        }
      `}</style>
    </div>
  )
}
