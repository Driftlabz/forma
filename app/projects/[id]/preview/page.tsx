'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const headingFont = 'var(--font-space-grotesk), sans-serif'
const bodyFont = 'var(--font-inter), sans-serif'
const monoFont = '"JetBrains Mono", "Fira Code", "Courier New", monospace'

const INJECTED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
  :root {
    --font-space-grotesk: 'Space Grotesk', sans-serif;
    --font-inter: 'Inter', sans-serif;
  }
  html, body {
    background: #050505 !important;
    color: #ECEAE5;
    font-family: 'Inter', sans-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Space Grotesk', sans-serif;
  }
`.trim()

function preparePreviewHtml(html: string): string {
  const stripped = html.replace(/<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/gi, '')
  const injected = stripped.replace(/<head([^>]*)>/i, `<head$1><style>${INJECTED_STYLES}</style>`)
  if (injected === stripped) return `<head><style>${INJECTED_STYLES}</style></head>${html}`
  return injected
}

interface ProjectData { id: string; name: string; status: string }

interface ColorStyles {
  background: string
  textPrimary: string
  accent: string
  surface: string
  muted: string
}

interface SpecData {
  preview_html: string | null
  qa_result: { overall: string } | null
  mode: string
  design_spec: {
    colorStyles?: ColorStyles
    fonts?: { display?: string; body?: string }
    eliteMarkers?: string[]
  } | null
}

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="10" cy="10" r="8" stroke="rgba(26,111,255,0.25)" strokeWidth="2" />
      <path d="M10 2a8 8 0 0 1 8 8" stroke="#1A6FFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PanelIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" rx="0" stroke="currentColor" strokeWidth="1.25" />
      <line x1="10" y1="1" x2="10" y2="15" stroke="currentColor" strokeWidth="1.25" strokeOpacity={open ? 1 : 0.5} />
    </svg>
  )
}

// ─── Design system sidebar ────────────────────────────────────────────────────

function DesignSidebar({ spec }: { spec: SpecData }) {
  const cs = spec.design_spec?.colorStyles
  const fonts = spec.design_spec?.fonts
  const markers = spec.design_spec?.eliteMarkers ?? []

  const swatches: Array<{ label: string; value: string }> = cs
    ? [
        { label: 'BG', value: cs.background },
        { label: 'Text', value: cs.textPrimary },
        { label: 'Accent', value: cs.accent },
        { label: 'Surface', value: cs.surface },
        { label: 'Muted', value: cs.muted },
      ].filter(s => s.value)
    : []

  const labelStyle: React.CSSProperties = {
    fontFamily: bodyFont, fontSize: '10px', fontWeight: 500,
    letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'rgba(236,234,229,0.3)', marginBottom: '8px',
  }

  return (
    <div style={{
      position: 'fixed', top: '56px', right: 0,
      width: '280px', height: 'calc(100vh - 56px)',
      background: '#0d0d0d',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      overflowY: 'auto', zIndex: 90,
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '24px',
    }}>
      {/* Archetype */}
      <div>
        <p style={labelStyle}>Archetype</p>
        <span style={{
          fontFamily: monoFont, fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.06em', color: '#1A6FFF',
          background: 'rgba(26,111,255,0.1)',
          border: '1px solid rgba(26,111,255,0.25)',
          padding: '4px 10px',
          display: 'inline-block',
        }}>
          {spec.mode}
        </span>
      </div>

      {/* Color palette */}
      {swatches.length > 0 && (
        <div>
          <p style={labelStyle}>Color Palette</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {swatches.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: s.value, flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.1)',
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                  <span style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                  <span style={{ fontFamily: monoFont, fontSize: '10px', color: 'rgba(236,234,229,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Font pairing */}
      {fonts && (fonts.display || fonts.body) && (
        <div>
          <p style={labelStyle}>Typography</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {fonts.display && (
              <div>
                <span style={{ fontFamily: bodyFont, fontSize: '12px', color: '#ECEAE5' }}>{fonts.display}</span>
                <span style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.3)', marginLeft: '6px' }}>display</span>
              </div>
            )}
            {fonts.body && (
              <div>
                <span style={{ fontFamily: bodyFont, fontSize: '12px', color: '#ECEAE5' }}>{fonts.body}</span>
                <span style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.3)', marginLeft: '6px' }}>body</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Elite markers */}
      {markers.length > 0 && (
        <div>
          <p style={labelStyle}>Elite Markers</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {markers.map((m, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#16A34A', flexShrink: 0, fontSize: '11px', marginTop: '1px' }}>✓</span>
                <span style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.45)', lineHeight: '1.5' }}>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PreviewPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [spec, setSpec] = useState<SpecData | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const [projectRes, specRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/spec`),
      ])
      if (!projectRes.ok) { router.push('/dashboard'); return }

      const projectData = await projectRes.json() as { project: ProjectData }
      const specData = await specRes.json() as { spec: SpecData | null }

      setProject(projectData.project)
      setSpec(specData.spec)
      setLoading(false)
    }
    void load()
  }, [projectId, router])

  async function handleApprove() {
    setError(null)
    setApproving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/approve`, { method: 'PATCH' })
      if (res.ok) { router.push('/dashboard') }
      else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Approval failed. Please try again.')
        setApproving(false)
      }
    } catch { setError('Approval failed. Please try again.'); setApproving(false) }
  }

  async function handleRequestChanges() {
    setError(null)
    setRetrying(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/retry`, { method: 'POST' })
      if (res.ok) { router.push(`/projects/${projectId}`) }
      else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to request changes. Please try again.')
        setRetrying(false)
      }
    } catch { setError('Failed to request changes. Please try again.'); setRetrying(false) }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SpinnerIcon />
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!spec?.preview_html) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <p style={{ fontFamily: bodyFont, fontSize: '15px', color: 'rgba(236,234,229,0.45)' }}>No preview available for this project.</p>
        <button onClick={() => router.push(`/projects/${projectId}`)} style={{ fontFamily: bodyFont, fontSize: '13px', color: '#1A6FFF', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Back to project
        </button>
      </div>
    )
  }

  const qaFailed = spec.qa_result && spec.qa_result.overall !== 'pass'
  const iframeRight = sidebarOpen ? '280px' : '0'

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      {/* Fixed header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '56px',
        background: '#0a0a0a', borderBottom: '1px solid #1a1a1a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 100,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: headingFont, fontSize: '14px', fontWeight: 600, color: '#ECEAE5', letterSpacing: '-0.01em' }}>
            {project?.name ?? 'Preview'}
          </span>
          {qaFailed && (
            <span style={{
              fontFamily: bodyFont, fontSize: '10px', fontWeight: 500,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#CA8A04', background: 'rgba(202,138,4,0.1)',
              border: '1px solid rgba(202,138,4,0.25)', borderRadius: '999px',
              padding: '2px 8px',
            }}>
              QA warnings
            </span>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {error && (
            <span style={{ fontFamily: bodyFont, fontSize: '12px', color: '#DC2626', marginRight: '8px' }}>{error}</span>
          )}

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title="Toggle design panel"
            style={{
              height: '36px', width: '36px',
              background: sidebarOpen ? 'rgba(26,111,255,0.15)' : 'transparent',
              border: `1px solid ${sidebarOpen ? 'rgba(26,111,255,0.4)' : '#333'}`,
              color: sidebarOpen ? '#1A6FFF' : 'rgba(236,234,229,0.5)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 200ms ease',
              marginRight: '4px',
            }}
            onMouseEnter={(e) => { if (!sidebarOpen) e.currentTarget.style.borderColor = '#555' }}
            onMouseLeave={(e) => { if (!sidebarOpen) e.currentTarget.style.borderColor = '#333' }}
          >
            <PanelIcon open={sidebarOpen} />
          </button>

          <button
            onClick={() => void handleRequestChanges()}
            disabled={retrying || approving}
            style={{
              height: '36px', padding: '0 16px',
              background: 'transparent', border: '1px solid #333',
              color: retrying ? 'rgba(236,234,229,0.4)' : '#ECEAE5',
              fontFamily: bodyFont, fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              cursor: retrying || approving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'border-color 200ms ease',
            }}
            onMouseEnter={(e) => { if (!retrying && !approving) e.currentTarget.style.borderColor = '#555' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333' }}
          >
            {retrying && <SpinnerIcon />}
            {retrying ? 'Requesting...' : 'Request Changes'}
          </button>

          <button
            onClick={() => void handleApprove()}
            disabled={approving || retrying}
            style={{
              height: '36px', padding: '0 20px',
              background: approving ? 'rgba(26,111,255,0.6)' : '#1A6FFF',
              border: 'none', color: '#ffffff',
              fontFamily: bodyFont, fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              cursor: approving || retrying ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 200ms ease',
            }}
            onMouseEnter={(e) => { if (!approving && !retrying) e.currentTarget.style.background = '#1560E0' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = approving ? 'rgba(26,111,255,0.6)' : '#1A6FFF' }}
          >
            {approving && <SpinnerIcon />}
            {approving ? 'Approving...' : 'Approve'}
          </button>
        </div>
      </header>

      {/* Iframe — narrows when sidebar is open */}
      <iframe
        srcDoc={preparePreviewHtml(spec.preview_html)}
        title={`${project?.name ?? 'Preview'} — Design Preview`}
        sandbox="allow-scripts allow-same-origin allow-popups"
        style={{
          position: 'fixed',
          top: '56px', left: 0,
          right: iframeRight,
          width: sidebarOpen ? 'calc(100% - 280px)' : '100%',
          height: 'calc(100vh - 56px)',
          border: 'none', display: 'block',
          transition: 'width 250ms ease, right 250ms ease',
        }}
      />

      {/* Sidebar */}
      {sidebarOpen && <DesignSidebar spec={spec} />}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
      `}</style>
    </div>
  )
}
