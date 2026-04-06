'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Space_Grotesk, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/client'
import type { ProjectStatus } from '@/lib/types'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['600', '700'] })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] })

interface SpecSummary {
  mode: string
  pages: number
  eliteMarkers: number
  qaResult: { overall: string } | null
}

interface ProjectData {
  id: string
  name: string
  status: ProjectStatus
  created_at: string
}

const PIPELINE_STEPS = [
  { key: 'intake', label: 'Intake processed' },
  { key: 'recon', label: 'Researching your references...' },
  { key: 'design', label: 'Running design audit...' },
  { key: 'qa', label: 'Building page specifications...' },
  { key: 'preview', label: 'Generating preview...' },
]

const STATUS_STEP_MAP: Record<string, number> = {
  intake: -1,
  designing: 1,
  preview: 5,
  revision: 5,
  building: 5,
  complete: 5,
  failed: -1,
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke="rgba(26,111,255,0.25)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="#1A6FFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" fill="rgba(22,163,74,0.15)" stroke="#16A34A" strokeWidth="1.5" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PendingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke="rgba(236,234,229,0.15)" strokeWidth="1.5" />
    </svg>
  )
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [status, setStatus] = useState<ProjectStatus>('intake')
  const [spec, setSpec] = useState<SpecSummary | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  // Load initial project + spec data
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) {
        router.push('/dashboard')
        return
      }
      const data = await res.json() as {
        project: ProjectData
        spec: { mode: string; design_spec: { pages?: unknown[]; eliteMarkers?: unknown[] }; qa_result: { overall: string } | null } | null
        buildLogs: { error: string | null; status: string }[]
      }

      setProject(data.project)
      setStatus(data.project.status)

      if (data.spec) {
        setSpec({
          mode: data.spec.mode,
          pages: Array.isArray(data.spec.design_spec?.pages) ? data.spec.design_spec.pages.length : 0,
          eliteMarkers: Array.isArray((data.spec.design_spec as Record<string, unknown>)?.eliteMarkers)
            ? ((data.spec.design_spec as Record<string, unknown>).eliteMarkers as unknown[]).length
            : 0,
          qaResult: data.spec.qa_result,
        })
      }

      const failedLog = data.buildLogs.find((l) => l.status === 'failed' && l.error)
      if (failedLog?.error) setErrorMsg(failedLog.error)

      setLoading(false)
    }
    void load()
  }, [projectId, router])

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => {
          const newStatus = (payload.new as { status: ProjectStatus }).status
          setStatus(newStatus)

          // If just hit preview, reload spec
          if (newStatus === 'preview' || newStatus === 'complete') {
            void fetch(`/api/projects/${projectId}/spec`)
              .then((r) => r.json())
              .then((d: { spec: { mode: string; design_spec: Record<string, unknown>; qa_result: { overall: string } | null } | null }) => {
                if (d.spec) {
                  setSpec({
                    mode: d.spec.mode,
                    pages: Array.isArray(d.spec.design_spec?.pages) ? (d.spec.design_spec.pages as unknown[]).length : 0,
                    eliteMarkers: Array.isArray(d.spec.design_spec?.eliteMarkers) ? (d.spec.design_spec.eliteMarkers as unknown[]).length : 0,
                    qaResult: d.spec.qa_result,
                  })
                }
              })
          }
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [projectId])

  async function handleReset() {
    setResetting(true)
    const supabase = createClient()
    await supabase.from('projects').update({ status: 'intake' }).eq('id', projectId)
    setStatus('intake')
    setErrorMsg(null)
    setResetting(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SpinnerIcon />
      </div>
    )
  }

  const currentStep = STATUS_STEP_MAP[status] ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#050505', fontFamily: inter.style.fontFamily }}>
      {/* Dot grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <span style={{ fontFamily: inter.style.fontFamily, fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', color: '#1A6FFF', textTransform: 'uppercase' as const }}>FORMA</span>
          <span style={{ fontFamily: inter.style.fontFamily, fontSize: '11px', color: 'rgba(236,234,229,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}> / {project?.name ?? 'Project'}</span>
        </div>
        <Link href="/dashboard" style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: 'rgba(236,234,229,0.4)', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#ECEAE5' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(236,234,229,0.4)' }}
        >
          ← Dashboard
        </Link>
      </header>

      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '64px 24px', position: 'relative', zIndex: 1 }}>

        {/* STATE: intake */}
        {status === 'intake' && (
          <div>
            <h1 style={{ fontFamily: spaceGrotesk.style.fontFamily, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              {project?.name}
            </h1>
            <p style={{ fontFamily: inter.style.fontFamily, fontSize: '16px', color: 'rgba(236,234,229,0.45)', margin: '0 0 40px 0' }}>
              Your project is ready. Complete the intake form to start your design.
            </p>
            <Link
              href={`/projects/${projectId}/intake`}
              style={{ display: 'inline-block', background: '#1A6FFF', color: '#fff', fontFamily: inter.style.fontFamily, fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, textDecoration: 'none', padding: '14px 32px', borderRadius: '0px', transition: 'background 200ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1560E0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1A6FFF' }}
            >
              Start Intake Form
            </Link>
          </div>
        )}

        {/* STATE: designing */}
        {status === 'designing' && (
          <div>
            <h1 style={{ fontFamily: spaceGrotesk.style.fontFamily, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
              Building your design
            </h1>
            <p style={{ fontFamily: inter.style.fontFamily, fontSize: '15px', color: 'rgba(236,234,229,0.45)', margin: '0 0 48px 0' }}>
              The AI pipeline is running. This takes 2–4 minutes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '20px' }}>
              {PIPELINE_STEPS.map((step, i) => {
                const isComplete = i < currentStep
                const isCurrent = i === currentStep
                const isPending = i > currentStep

                return (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: isPending ? 0.4 : 1, transition: 'opacity 400ms ease' }}>
                    {isComplete ? <CheckIcon /> : isCurrent ? <SpinnerIcon /> : <PendingIcon />}
                    <span style={{
                      fontFamily: inter.style.fontFamily,
                      fontSize: '16px',
                      color: isComplete ? '#16A34A' : isCurrent ? '#ECEAE5' : 'rgba(236,234,229,0.45)',
                      transition: 'color 400ms ease',
                    }}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <p style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: 'rgba(236,234,229,0.25)', marginTop: '40px' }}>
              Page will update automatically when your design is ready.
            </p>
          </div>
        )}

        {/* STATE: preview */}
        {(status === 'preview' || status === 'revision') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <CheckIcon />
              <span style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: '#16A34A', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Design complete</span>
            </div>
            <h1 style={{ fontFamily: spaceGrotesk.style.fontFamily, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              Your design is ready
            </h1>
            <p style={{ fontFamily: inter.style.fontFamily, fontSize: '16px', color: 'rgba(236,234,229,0.45)', margin: '0 0 40px 0' }}>
              Review your design spec and preview before we build.
            </p>

            {spec && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                  <SpecStat label="Mode" value={spec.mode} inter={inter} />
                  <SpecStat label="Pages" value={String(spec.pages)} inter={inter} />
                  <SpecStat label="Elite Markers" value={String(spec.eliteMarkers)} inter={inter} />
                </div>
                {spec.qaResult && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontFamily: inter.style.fontFamily, fontSize: '12px', color: spec.qaResult.overall === 'pass' ? '#16A34A' : '#CA8A04', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                      QA: {spec.qaResult.overall}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Link
              href={`/projects/${projectId}/preview`}
              style={{ display: 'inline-block', background: '#1A6FFF', color: '#fff', fontFamily: inter.style.fontFamily, fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, textDecoration: 'none', padding: '14px 32px', borderRadius: '0px', transition: 'background 200ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1560E0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1A6FFF' }}
            >
              View Preview
            </Link>
          </div>
        )}

        {/* STATE: building / complete */}
        {(status === 'building' || status === 'complete') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {status === 'complete' ? <CheckIcon /> : <SpinnerIcon />}
              <span style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: status === 'complete' ? '#16A34A' : '#1A6FFF', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                {status === 'complete' ? 'Build complete' : 'Building in Framer...'}
              </span>
            </div>
            <h1 style={{ fontFamily: spaceGrotesk.style.fontFamily, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              {status === 'complete' ? 'Your site is live' : 'Building your site'}
            </h1>
          </div>
        )}

        {/* STATE: failed */}
        {status === 'failed' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6" fill="rgba(220,38,38,0.15)" stroke="#DC2626" strokeWidth="1.5" />
                <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: '#DC2626', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Pipeline failed</span>
            </div>
            <h1 style={{ fontFamily: spaceGrotesk.style.fontFamily, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              Something went wrong
            </h1>
            {errorMsg && (
              <p style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: 'rgba(236,234,229,0.35)', margin: '0 0 32px 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', wordBreak: 'break-word' as const }}>
                {errorMsg}
              </p>
            )}
            {!errorMsg && (
              <p style={{ fontFamily: inter.style.fontFamily, fontSize: '16px', color: 'rgba(236,234,229,0.45)', margin: '0 0 32px 0' }}>
                The design pipeline encountered an error. Try again — it usually works on the second attempt.
              </p>
            )}
            <button
              onClick={() => void handleReset()}
              disabled={resetting}
              style={{ background: '#1A6FFF', border: 'none', borderRadius: '0px', color: '#fff', fontFamily: inter.style.fontFamily, fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, padding: '14px 32px', cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.5 : 1, transition: 'background 200ms ease' }}
              onMouseEnter={(e) => { if (!resetting) e.currentTarget.style.background = '#1560E0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1A6FFF' }}
            >
              {resetting ? 'Resetting...' : 'Try Again'}
            </button>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function SpecStat({ label, value, inter }: { label: string; value: string; inter: { style: { fontFamily: string } } }) {
  return (
    <div>
      <div style={{ fontFamily: inter.style.fontFamily, fontSize: '11px', color: 'rgba(236,234,229,0.35)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontFamily: inter.style.fontFamily, fontSize: '20px', fontWeight: 500, color: '#ECEAE5' }}>{value}</div>
    </div>
  )
}
