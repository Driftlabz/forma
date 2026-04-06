'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Space_Grotesk, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] })

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10)
    return () => clearTimeout(t)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })

    const data: unknown = await res.json()
    if (!res.ok) {
      const err = data as { error?: string }
      setError(err.error ?? 'Failed to create project.')
      setLoading(false)
      return
    }

    const result = data as { project: { id: string } }
    router.push(`/projects/${result.project.id}/intake`)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0px',
    color: '#ECEAE5',
    fontFamily: inter.style.fontFamily,
    fontSize: '15px',
    padding: '0 16px',
    outline: 'none',
    transition: 'border-color 200ms ease, background 200ms ease',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: inter.style.fontFamily }}>

      {/* Dot grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

      {/* Top glow */}
      <div style={{ position: 'fixed', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,111,255,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Back link */}
      <div style={{ position: 'fixed', top: '24px', left: '32px', zIndex: 2 }}>
        <Link href="/dashboard" style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: 'rgba(236,234,229,0.4)', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#ECEAE5' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(236,234,229,0.4)' }}
        >
          ← Dashboard
        </Link>
      </div>

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '480px',
        padding: '0 24px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(26,111,255,0.3)', background: 'rgba(26,111,255,0.08)', padding: '6px 14px', borderRadius: '999px' }}>
            <span style={{ fontFamily: inter.style.fontFamily, fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', color: '#1A6FFF', textTransform: 'uppercase' as const }}>
              FORMA by Driftlabs
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: spaceGrotesk.style.fontFamily,
          fontSize: '48px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          margin: '0 0 12px 0',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ECEAE5 0%, rgba(236,234,229,0.5) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          New Project
        </h1>

        {/* Subtext */}
        <p style={{ fontFamily: inter.style.fontFamily, fontSize: '16px', color: 'rgba(236,234,229,0.45)', textAlign: 'center', margin: '0 0 48px 0' }}>
          Give your project a name to get started.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontFamily: inter.style.fontFamily, fontSize: '11px', fontWeight: 500, letterSpacing: '0.10em', color: 'rgba(236,234,229,0.4)', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="e.g. Nexus AI, Portfolio, Agency Site"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(26,111,255,0.6)'; e.currentTarget.style.background = 'rgba(26,111,255,0.04)' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
            />
          </div>

          {error && (
            <p style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: '#DC2626', marginBottom: '12px', marginTop: '-8px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              width: '100%',
              height: '48px',
              background: '#1A6FFF',
              border: 'none',
              borderRadius: '0px',
              color: '#ffffff',
              fontFamily: inter.style.fontFamily,
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !name.trim() ? 0.5 : 1,
              transition: 'background 200ms ease, opacity 200ms ease',
            }}
            onMouseEnter={(e) => { if (!loading && name.trim()) e.currentTarget.style.background = '#1560E0' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1A6FFF' }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: '24px', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
        <span style={{ fontFamily: inter.style.fontFamily, fontSize: '12px', color: 'rgba(236,234,229,0.2)' }}>
          © 2026 Driftlabs. All rights reserved.
        </span>
      </div>

      <style>{`input::placeholder { color: rgba(236,234,229,0.2); }`}</style>
    </div>
  )
}
