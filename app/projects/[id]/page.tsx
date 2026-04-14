'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ProjectStatus } from '@/lib/types'

const headingFont = 'var(--font-space-grotesk), sans-serif'
const bodyFont = 'var(--font-inter), sans-serif'
const monoFont = '"JetBrains Mono", "Fira Code", "Courier New", monospace'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ColorStyles {
  background: string
  textPrimary: string
  accent: string
  surface: string
  muted: string
}

interface SpecSummary {
  mode: string
  pages: number
  eliteMarkers: string[]
  qaResult: { overall: string; failures?: string[] } | null
  colorStyles: ColorStyles | null
  fonts: { display?: string; body?: string } | null
}

interface ProjectData {
  id: string
  name: string
  status: ProjectStatus
  created_at: string
}

// ─── Pipeline stage simulation ────────────────────────────────────────────────

const PIPELINE_STAGES = ['intake', 'reference', 'design', 'qa', 'preview'] as const
type PipelineStage = typeof PIPELINE_STAGES[number]

const STAGE_LABELS: Record<PipelineStage, string> = {
  intake: 'Understanding your brand...',
  reference: 'Studying your references...',
  design: 'Choosing your design direction...',
  qa: 'Checking design quality...',
  preview: 'Rendering your preview...',
}

const STAGE_MESSAGES: Record<PipelineStage, string[]> = {
  intake: ['Processing brand brief...', 'Identifying target audience...', 'Analyzing brand voice...', 'Extracting niche signals...'],
  reference: ['Fetching reference URLs...', 'Extracting design signals...', 'Identifying color language...', 'Reading layout patterns...'],
  design: ['Selecting design archetype...', 'Locking color palette...', 'Choosing typography pair...', 'Planning section structure...', 'Applying elite markers...', 'Composing hero section...', 'Designing feature flow...'],
  qa: ['Checking spacing grid...', 'Validating typography scale...', 'Auditing slop patterns...', 'Verifying elite markers...', 'Reviewing color contrast...'],
  preview: ['Generating HTML structure...', 'Applying CSS animations...', 'Injecting GSAP sequences...', 'Optimizing for viewport...'],
}

// How long each stage lasts before auto-advancing (ms)
const STAGE_DURATIONS: Record<PipelineStage, number> = {
  intake: 18000,
  reference: 18000,
  design: 90000,
  qa: 38000,
  preview: 30000,
}

// ─── Status step map (for non-designing states) ───────────────────────────────

const STATUS_STEP_MAP: Record<string, number> = {
  intake: -1,
  designing: 1,
  preview: 5,
  revision: 5,
  approved: 5,
  building: 5,
  complete: 5,
  failed: -1,
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SpinnerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" stroke="rgba(26,111,255,0.25)" strokeWidth="2" />
      <path d="M8 2a6 6 0 0 1 6 6" stroke="#1A6FFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ color = '#16A34A' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" fill={`${color}22`} stroke={color} strokeWidth="1.5" />
      <path d="M5 8l2.5 2.5L11 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Progress screen (full-screen, shown while status = 'designing') ──────────

function ProgressScreen({ projectName, onBack }: { projectName: string; onBack: () => void }) {
  const [stageIdx, setStageIdx] = useState(0)
  const [feed, setFeed] = useState<Array<{ id: number; text: string }>>([])
  const feedIdRef = useRef(0)
  const msgIdxRef = useRef(0)

  const stage = PIPELINE_STAGES[Math.min(stageIdx, PIPELINE_STAGES.length - 1)]

  // Cycle through thinking messages
  useEffect(() => {
    msgIdxRef.current = 0
    const msgs = STAGE_MESSAGES[PIPELINE_STAGES[Math.min(stageIdx, PIPELINE_STAGES.length - 1)]]

    const addMessage = () => {
      const text = msgs[msgIdxRef.current % msgs.length]
      msgIdxRef.current++
      const id = ++feedIdRef.current
      setFeed(prev => [...prev.slice(-3), { id, text }])
    }

    addMessage()
    const interval = setInterval(addMessage, 3500)
    return () => clearInterval(interval)
  }, [stageIdx])

  // Advance to next stage after duration
  useEffect(() => {
    if (stageIdx >= PIPELINE_STAGES.length - 1) return
    const duration = STAGE_DURATIONS[PIPELINE_STAGES[stageIdx]]
    const timer = setTimeout(() => setStageIdx(i => i + 1), duration)
    return () => clearTimeout(timer)
  }, [stageIdx])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Animated gradient bar — very top */}
      <div style={{ position: 'relative', height: '2px', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, #1A6FFF 35%, #DC2626 60%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'gradientBar 2s linear infinite',
        }} />
      </div>

      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,80,0,0.03)', top: '-100px', left: '-150px', animation: 'blob1 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,80,0,0.025)', bottom: '-80px', right: '-100px', animation: 'blob2 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,50,0,0.02)', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', animation: 'blob3 26s ease-in-out infinite' }} />
      </div>

      {/* Back link */}
      <button
        onClick={onBack}
        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: bodyFont, fontSize: '13px', color: 'rgba(236,234,229,0.3)', zIndex: 10, padding: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(236,234,229,0.6)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(236,234,229,0.3)' }}
      >
        ← Dashboard
      </button>

      {/* Center content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
        padding: '40px 24px',
        gap: '32px',
      }}>
        {/* Project name */}
        <p style={{ fontFamily: bodyFont, fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', color: 'rgba(236,234,229,0.25)', textTransform: 'uppercase', margin: 0 }}>
          {projectName}
        </p>

        {/* Status label */}
        <h1
          key={stage}
          style={{
            fontFamily: headingFont, fontSize: '32px', fontWeight: 500,
            color: '#ECEAE5', letterSpacing: '-0.02em',
            margin: 0, textAlign: 'center',
            animation: 'fadeInUp 0.4s ease forwards',
          }}
        >
          {STAGE_LABELS[stage]}
        </h1>

        {/* Thinking feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '420px', minHeight: '88px', justifyContent: 'flex-end' }}>
          {feed.map((item) => (
            <p
              key={item.id}
              style={{
                fontFamily: monoFont, fontSize: '13px', color: 'transparent',
                margin: 0, animation: 'feedFadeIn 0.3s ease forwards',
                background: 'none',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{item.text}</span>
            </p>
          ))}
        </div>

        {/* Time estimate + progress bar */}
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontFamily: bodyFont, fontSize: '12px', color: 'rgba(236,234,229,0.2)', margin: 0, letterSpacing: '0.06em' }}>
            Estimated 2–4 minutes
          </p>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              background: 'rgba(26,111,255,0.5)',
              animation: 'sineProgress 14s cubic-bezier(0.45, 0, 0.55, 1) infinite alternate',
            }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradientBar {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes sineProgress {
          0%   { width: 8%; }
          15%  { width: 22%; }
          30%  { width: 38%; }
          45%  { width: 52%; }
          60%  { width: 63%; }
          75%  { width: 71%; }
          90%  { width: 78%; }
          100% { width: 82%; }
        }
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(40px, -30px) scale(1.08); }
          66%      { transform: translate(-25px, 40px) scale(0.94); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%      { transform: translate(-50px, 30px) scale(1.06); }
          70%      { transform: translate(30px, -40px) scale(0.92); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%      { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes feedFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// ─── Design Dashboard (shown when status = 'preview' | 'revision') ────────────

function DesignDashboard({ spec, projectId }: { spec: SpecSummary; projectId: string }) {
  const swatchColors: Array<{ label: string; value: string }> = []
  if (spec.colorStyles) {
    const cs = spec.colorStyles
    if (cs.background) swatchColors.push({ label: 'BG', value: cs.background })
    if (cs.textPrimary) swatchColors.push({ label: 'Text', value: cs.textPrimary })
    if (cs.accent) swatchColors.push({ label: 'Accent', value: cs.accent })
    if (cs.surface) swatchColors.push({ label: 'Surface', value: cs.surface })
    if (cs.muted) swatchColors.push({ label: 'Muted', value: cs.muted })
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0px',
    padding: '24px',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    color: 'rgba(236,234,229,0.3)',
    marginBottom: '12px',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <CheckIcon />
        <span style={{ fontFamily: bodyFont, fontSize: '13px', color: '#16A34A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Design complete</span>
      </div>
      <h1 style={{ fontFamily: headingFont, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 32px 0' }}>
        Your design is ready
      </h1>

      {/* Two-column dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Left: Design System */}
        <div style={cardStyle}>
          <p style={labelStyle}>Design System</p>

          {/* Archetype badge */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              fontFamily: monoFont, fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.08em', color: '#1A6FFF',
              background: 'rgba(26,111,255,0.1)', border: '1px solid rgba(26,111,255,0.25)',
              padding: '4px 10px',
            }}>
              {spec.mode}
            </span>
          </div>

          {/* Color palette */}
          {swatchColors.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ ...labelStyle, marginBottom: '8px' }}>Palette</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {swatchColors.map((s) => (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: s.value,
                      border: '1px solid rgba(255,255,255,0.12)',
                    }} title={s.value} />
                    <span style={{ fontFamily: monoFont, fontSize: '9px', color: 'rgba(236,234,229,0.25)', letterSpacing: '0.04em' }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Font pairing */}
          {spec.fonts && (spec.fonts.display || spec.fonts.body) && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ ...labelStyle, marginBottom: '8px' }}>Typography</p>
              {spec.fonts.display && (
                <p style={{ fontFamily: bodyFont, fontSize: '13px', color: '#ECEAE5', margin: '0 0 4px 0' }}>
                  {spec.fonts.display} <span style={{ color: 'rgba(236,234,229,0.3)', fontSize: '11px' }}>display</span>
                </p>
              )}
              {spec.fonts.body && (
                <p style={{ fontFamily: bodyFont, fontSize: '13px', color: '#ECEAE5', margin: 0 }}>
                  {spec.fonts.body} <span style={{ color: 'rgba(236,234,229,0.3)', fontSize: '11px' }}>body</span>
                </p>
              )}
            </div>
          )}

          {/* Spacing */}
          <div>
            <p style={{ ...labelStyle, marginBottom: '4px' }}>Spacing</p>
            <p style={{ fontFamily: monoFont, fontSize: '12px', color: 'rgba(236,234,229,0.45)', margin: 0 }}>8px grid</p>
          </div>
        </div>

        {/* Right: Quality Report */}
        <div style={cardStyle}>
          <p style={labelStyle}>Quality Report</p>

          {/* Pages */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ ...labelStyle, marginBottom: '4px' }}>Pages Designed</p>
            <p style={{ fontFamily: headingFont, fontSize: '24px', fontWeight: 600, color: '#ECEAE5', margin: 0 }}>{spec.pages}</p>
          </div>

          {/* QA Status */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ ...labelStyle, marginBottom: '8px' }}>QA Status</p>
            {spec.qaResult ? (
              <div>
                <span style={{
                  fontFamily: monoFont, fontSize: '11px', fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: spec.qaResult.overall === 'pass' ? '#16A34A' : '#CA8A04',
                  background: spec.qaResult.overall === 'pass' ? 'rgba(22,163,74,0.1)' : 'rgba(202,138,4,0.1)',
                  border: `1px solid ${spec.qaResult.overall === 'pass' ? 'rgba(22,163,74,0.3)' : 'rgba(202,138,4,0.3)'}`,
                  padding: '3px 8px',
                }}>
                  {spec.qaResult.overall.toUpperCase()}
                </span>
                {spec.qaResult.overall !== 'pass' && spec.qaResult.failures && spec.qaResult.failures.length > 0 && (
                  <ul style={{ margin: '10px 0 0 0', padding: '0 0 0 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {spec.qaResult.failures.slice(0, 3).map((f, i) => (
                      <li key={i} style={{ fontFamily: bodyFont, fontSize: '11px', color: '#CA8A04', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0, marginTop: '1px' }}>·</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <span style={{ fontFamily: bodyFont, fontSize: '13px', color: 'rgba(236,234,229,0.3)' }}>—</span>
            )}
          </div>

          {/* Elite markers */}
          {spec.eliteMarkers.length > 0 && (
            <div>
              <p style={{ ...labelStyle, marginBottom: '8px' }}>Elite Markers</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {spec.eliteMarkers.slice(0, 4).map((marker, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#16A34A', flexShrink: 0, marginTop: '1px', fontSize: '12px' }}>✓</span>
                    <span style={{ fontFamily: bodyFont, fontSize: '12px', color: 'rgba(236,234,229,0.5)', lineHeight: '1.4' }}>{marker}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* VIEW PREVIEW button */}
      <Link
        href={`/projects/${projectId}/preview`}
        style={{ display: 'inline-block', background: '#1A6FFF', color: '#fff', fontFamily: bodyFont, fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 32px', borderRadius: '0px', transition: 'background 200ms ease' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1560E0' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1A6FFF' }}
      >
        View Preview
      </Link>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

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

  function extractSpec(raw: {
    mode: string
    design_spec: Record<string, unknown>
    qa_result: { overall: string; failures?: string[] } | null
  }): SpecSummary {
    return {
      mode: raw.mode,
      pages: Array.isArray(raw.design_spec?.pages) ? (raw.design_spec.pages as unknown[]).length : 0,
      eliteMarkers: Array.isArray(raw.design_spec?.eliteMarkers)
        ? (raw.design_spec.eliteMarkers as string[])
        : [],
      qaResult: raw.qa_result ?? null,
      colorStyles: (raw.design_spec?.colorStyles as ColorStyles) ?? null,
      fonts: (raw.design_spec?.fonts as { display?: string; body?: string }) ?? null,
    }
  }

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) { router.push('/dashboard'); return }

      const data = await res.json() as {
        project: ProjectData
        spec: { mode: string; design_spec: Record<string, unknown>; qa_result: { overall: string; failures?: string[] } | null } | null
        buildLogs: { error: string | null; status: string }[]
      }

      setProject(data.project)
      setStatus(data.project.status)
      if (data.spec) setSpec(extractSpec(data.spec))

      const failedLog = data.buildLogs.find((l) => l.status === 'failed' && l.error)
      if (failedLog?.error) setErrorMsg(failedLog.error)
      setLoading(false)
    }
    void load()
  }, [projectId, router])

  // Realtime subscription
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
          if (newStatus === 'preview' || newStatus === 'approved' || newStatus === 'complete') {
            void fetch(`/api/projects/${projectId}/spec`)
              .then((r) => r.json())
              .then((d: { spec: { mode: string; design_spec: Record<string, unknown>; qa_result: { overall: string; failures?: string[] } | null } | null }) => {
                if (d.spec) setSpec(extractSpec(d.spec))
              })
          }
        }
      )
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [projectId])

  async function handleReset() {
    setResetting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/retry`, { method: 'POST' })
      if (res.ok) { setStatus('designing'); setErrorMsg(null) }
      else {
        const data = await res.json() as { error?: string }
        setErrorMsg(data.error ?? 'Failed to restart pipeline.')
      }
    } catch { setErrorMsg('Failed to restart pipeline.') }
    setResetting(false)
  }

  // ── Loading spinner ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SpinnerIcon />
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Full-screen progress (designing) ──────────────────────────────────────
  if (status === 'designing') {
    return (
      <ProgressScreen
        projectName={project?.name ?? 'Your project'}
        onBack={() => router.push('/dashboard')}
      />
    )
  }

  // ── Standard layout for all other states ─────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#050505', fontFamily: bodyFont }}>
      {/* Dot grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <span style={{ fontFamily: bodyFont, fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', color: '#1A6FFF', textTransform: 'uppercase' }}>FORMA</span>
          <span style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}> / {project?.name ?? 'Project'}</span>
        </div>
        <Link href="/dashboard" style={{ fontFamily: bodyFont, fontSize: '13px', color: 'rgba(236,234,229,0.4)', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#ECEAE5' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(236,234,229,0.4)' }}
        >
          ← Dashboard
        </Link>
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px', position: 'relative', zIndex: 1 }}>

        {/* intake */}
        {status === 'intake' && (
          <div>
            <h1 style={{ fontFamily: headingFont, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              {project?.name}
            </h1>
            <p style={{ fontFamily: bodyFont, fontSize: '16px', color: 'rgba(236,234,229,0.45)', margin: '0 0 40px 0' }}>
              Your project is ready. Complete the intake form to start your design.
            </p>
            <Link
              href={`/projects/${projectId}/intake`}
              style={{ display: 'inline-block', background: '#1A6FFF', color: '#fff', fontFamily: bodyFont, fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 32px', transition: 'background 200ms ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1560E0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1A6FFF' }}
            >
              Start Intake Form
            </Link>
          </div>
        )}

        {/* preview / revision — Design Dashboard */}
        {(status === 'preview' || status === 'revision') && spec && (
          <DesignDashboard spec={spec} projectId={projectId} />
        )}
        {(status === 'preview' || status === 'revision') && !spec && (
          <div>
            <h1 style={{ fontFamily: headingFont, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 40px 0' }}>
              Your design is ready
            </h1>
            <Link href={`/projects/${projectId}/preview`} style={{ display: 'inline-block', background: '#1A6FFF', color: '#fff', fontFamily: bodyFont, fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 32px' }}>
              View Preview
            </Link>
          </div>
        )}

        {/* approved */}
        {status === 'approved' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <CheckIcon color="#1A6FFF" />
              <span style={{ fontFamily: bodyFont, fontSize: '13px', color: '#1A6FFF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Approved</span>
            </div>
            <h1 style={{ fontFamily: headingFont, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              Design approved
            </h1>
            <p style={{ fontFamily: bodyFont, fontSize: '16px', color: 'rgba(236,234,229,0.45)', margin: 0 }}>
              Your design is locked in. The build stage is coming soon.
            </p>
          </div>
        )}

        {/* building / complete */}
        {(status === 'building' || status === 'complete') && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {status === 'complete' ? <CheckIcon /> : <SpinnerIcon />}
              <span style={{ fontFamily: bodyFont, fontSize: '13px', color: status === 'complete' ? '#16A34A' : '#1A6FFF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {status === 'complete' ? 'Build complete' : 'Building in Framer...'}
              </span>
            </div>
            <h1 style={{ fontFamily: headingFont, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: 0 }}>
              {status === 'complete' ? 'Your site is live' : 'Building your site'}
            </h1>
          </div>
        )}

        {/* failed */}
        {status === 'failed' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6" fill="rgba(220,38,38,0.15)" stroke="#DC2626" strokeWidth="1.5" />
                <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: bodyFont, fontSize: '13px', color: '#DC2626', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pipeline failed</span>
            </div>
            <h1 style={{ fontFamily: headingFont, fontSize: '36px', fontWeight: 700, color: '#ECEAE5', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              Something went wrong
            </h1>
            {errorMsg ? (
              <p style={{ fontFamily: bodyFont, fontSize: '13px', color: 'rgba(236,234,229,0.35)', margin: '0 0 32px 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px', wordBreak: 'break-word' }}>
                {errorMsg}
              </p>
            ) : (
              <p style={{ fontFamily: bodyFont, fontSize: '16px', color: 'rgba(236,234,229,0.45)', margin: '0 0 32px 0' }}>
                The design pipeline encountered an error. Try again — it usually works on the second attempt.
              </p>
            )}
            <button
              onClick={() => void handleReset()}
              disabled={resetting}
              style={{ background: '#1A6FFF', border: 'none', color: '#fff', fontFamily: bodyFont, fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 32px', cursor: resetting ? 'not-allowed' : 'pointer', opacity: resetting ? 0.5 : 1, transition: 'background 200ms ease' }}
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
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// unused but kept to avoid breaking STATUS_STEP_MAP usage elsewhere
const _stepMapRef = STATUS_STEP_MAP
void _stepMapRef
