'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

const headingFont = 'var(--font-space-grotesk), sans-serif'
const bodyFont = 'var(--font-inter), sans-serif'

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
  // 1. Strip any Google Fonts <link> tags — we inject our own via @import
  const stripped = html.replace(
    /<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>/gi,
    ''
  )

  // 2. Inject base styles immediately after <head>
  const injected = stripped.replace(
    /<head([^>]*)>/i,
    `<head$1><style>${INJECTED_STYLES}</style>`
  )

  // 3. If no <head> tag found, prepend a minimal one
  if (injected === stripped) {
    return `<head><style>${INJECTED_STYLES}</style></head>${html}`
  }

  return injected
}

interface ProjectData {
  id: string
  name: string
  status: string
}

interface SpecData {
  preview_html: string | null
  qa_result: { overall: string } | null
  mode: string
}

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="10" cy="10" r="8" stroke="rgba(26,111,255,0.25)" strokeWidth="2" />
      <path d="M10 2a8 8 0 0 1 8 8" stroke="#1A6FFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

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

  useEffect(() => {
    async function load() {
      const [projectRes, specRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/spec`),
      ])

      if (!projectRes.ok) {
        router.push('/dashboard')
        return
      }

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
      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Approval failed. Please try again.')
        setApproving(false)
      }
    } catch {
      setError('Approval failed. Please try again.')
      setApproving(false)
    }
  }

  async function handleRequestChanges() {
    setError(null)
    setRetrying(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/retry`, { method: 'POST' })
      if (res.ok) {
        router.push(`/projects/${projectId}`)
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to request changes. Please try again.')
        setRetrying(false)
      }
    } catch {
      setError('Failed to request changes. Please try again.')
      setRetrying(false)
    }
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
        <p style={{ fontFamily: bodyFont, fontSize: '15px', color: 'rgba(236,234,229,0.45)' }}>
          No preview available for this project.
        </p>
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          style={{ fontFamily: bodyFont, fontSize: '13px', color: '#1A6FFF', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          ← Back to project
        </button>
      </div>
    )
  }

  const qaFailed = spec.qa_result && spec.qa_result.overall !== 'pass'

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      {/* Fixed header bar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
      }}>
        {/* Left: project name + QA badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: headingFont, fontSize: '14px', fontWeight: 600, color: '#ECEAE5', letterSpacing: '-0.01em' }}>
            {project?.name ?? 'Preview'}
          </span>
          {qaFailed && (
            <span style={{
              fontFamily: bodyFont,
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#CA8A04',
              background: 'rgba(202,138,4,0.1)',
              border: '1px solid rgba(202,138,4,0.25)',
              borderRadius: '999px',
              padding: '2px 8px',
            }}>
              QA warnings
            </span>
          )}
        </div>

        {/* Right: action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {error && (
            <span style={{ fontFamily: bodyFont, fontSize: '12px', color: '#DC2626', marginRight: '8px' }}>
              {error}
            </span>
          )}

          <button
            onClick={() => void handleRequestChanges()}
            disabled={retrying || approving}
            style={{
              height: '36px',
              padding: '0 16px',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: '0px',
              color: retrying ? 'rgba(236,234,229,0.4)' : '#ECEAE5',
              fontFamily: bodyFont,
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: retrying || approving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'border-color 200ms ease, color 200ms ease',
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
              height: '36px',
              padding: '0 20px',
              background: approving ? 'rgba(26,111,255,0.6)' : '#1A6FFF',
              border: 'none',
              borderRadius: '0px',
              color: '#ffffff',
              fontFamily: bodyFont,
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: approving || retrying ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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

      {/* Full-viewport iframe */}
      <iframe
        srcDoc={preparePreviewHtml(spec.preview_html)}
        title={`${project?.name ?? 'Preview'} — Design Preview`}
        sandbox="allow-scripts allow-same-origin allow-popups"
        style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          width: '100%',
          height: 'calc(100vh - 56px)',
          border: 'none',
          display: 'block',
        }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }
      `}</style>
    </div>
  )
}
