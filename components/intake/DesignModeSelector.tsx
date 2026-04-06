'use client'

import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] })

type DesignMode = 'CINEMATIC' | 'EDITORIAL' | 'BRUTALIST'

interface DesignModeSelectorProps {
  value: DesignMode
  onChange: (mode: DesignMode) => void
}

interface ModeConfig {
  id: DesignMode
  label: string
  description: string
  tag: string
  available: boolean
  previewBg: string
  previewContent: React.ReactNode
  cardBg: string
  cardBorder: string
}

function CinematicPreview() {
  return (
    <div style={{ width: '100%', height: '80px', background: '#050505', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,111,255,0.3) 0%, transparent 70%)' }} />
      <div style={{ fontSize: '6px', fontFamily: inter.style.fontFamily, color: '#1A6FFF', letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase' as const }}>FORMA / AI PLATFORM</div>
      <div style={{ fontSize: '10px', fontFamily: spaceGrotesk.style.fontFamily, fontWeight: 700, color: '#ECEAE5', lineHeight: 1.1, letterSpacing: '-0.02em' }}>Build smarter.<br />Ship faster.</div>
      <div style={{ width: '24px', height: '3px', background: '#1A6FFF', marginTop: '6px' }} />
    </div>
  )
}

function EditorialPreview() {
  return (
    <div style={{ width: '100%', height: '80px', background: '#F5F4F0', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ fontSize: '6px', fontFamily: inter.style.fontFamily, color: '#666', letterSpacing: '0.15em', marginBottom: '5px', textTransform: 'uppercase' as const }}>Studio / Agency</div>
      <div style={{ fontSize: '11px', fontFamily: spaceGrotesk.style.fontFamily, fontWeight: 700, color: '#111', lineHeight: 1.1, letterSpacing: '-0.02em' }}>Craft without<br />compromise.</div>
      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
        <div style={{ width: '28px', height: '2px', background: '#111' }} />
        <div style={{ width: '14px', height: '2px', background: '#999' }} />
      </div>
    </div>
  )
}

function BrutalistPreview() {
  return (
    <div style={{ width: '100%', height: '80px', background: '#000', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#fff' }} />
      <div style={{ fontSize: '6px', fontFamily: inter.style.fontFamily, color: '#fff', letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase' as const, opacity: 0.5 }}>Portfolio / 2026</div>
      <div style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#fff', lineHeight: 1.1, textTransform: 'uppercase' as const }}>RAW.<br />STRUCTURAL.</div>
    </div>
  )
}

const MODES: ModeConfig[] = [
  {
    id: 'CINEMATIC',
    label: 'CINEMATIC',
    description: 'Dark, atmospheric, technical. Built for AI products and dev tools.',
    tag: 'Recommended for AI SaaS',
    available: true,
    previewBg: '#050505',
    previewContent: <CinematicPreview />,
    cardBg: '#050505',
    cardBorder: 'rgba(255,255,255,0.07)',
  },
  {
    id: 'EDITORIAL',
    label: 'EDITORIAL',
    description: 'Clean, authoritative, typographic. Built for agencies and studios.',
    tag: 'Recommended for Agencies',
    available: false,
    previewBg: '#F5F4F0',
    previewContent: <EditorialPreview />,
    cardBg: '#050505',
    cardBorder: 'rgba(255,255,255,0.07)',
  },
  {
    id: 'BRUTALIST',
    label: 'BRUTALIST',
    description: 'Raw, structural, unapologetic. Built for portfolios and experimental brands.',
    tag: 'Recommended for Portfolios',
    available: false,
    previewBg: '#000',
    previewContent: <BrutalistPreview />,
    cardBg: '#050505',
    cardBorder: 'rgba(255,255,255,0.07)',
  },
]

export default function DesignModeSelector({ value, onChange }: DesignModeSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
      className="mode-grid"
    >
      {MODES.map((mode) => {
        const isSelected = value === mode.id && mode.available
        return (
          <div
            key={mode.id}
            onClick={() => { if (mode.available) onChange(mode.id) }}
            style={{
              background: mode.cardBg,
              border: `1px solid ${isSelected ? '#1A6FFF' : mode.cardBorder}`,
              borderRadius: '0px',
              padding: '24px',
              cursor: mode.available ? 'pointer' : 'not-allowed',
              transition: 'border-color 200ms ease, background 200ms ease',
              position: 'relative',
              opacity: mode.available ? 1 : 0.55,
              backgroundColor: isSelected ? 'rgba(26,111,255,0.06)' : mode.cardBg,
            }}
            onMouseEnter={(e) => {
              if (mode.available && !isSelected) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              }
            }}
            onMouseLeave={(e) => {
              if (mode.available && !isSelected) {
                e.currentTarget.style.borderColor = mode.cardBorder
              }
            }}
          >
            {/* Coming soon badge */}
            {!mode.available && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '0px' }}>
                <span style={{ fontFamily: inter.style.fontFamily, fontSize: '10px', color: 'rgba(236,234,229,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Soon</span>
              </div>
            )}

            {/* Selected indicator */}
            {isSelected && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#1A6FFF', padding: '2px 8px', borderRadius: '0px' }}>
                <span style={{ fontFamily: inter.style.fontFamily, fontSize: '10px', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Selected</span>
              </div>
            )}

            {/* Preview mockup */}
            <div style={{ marginBottom: '16px' }}>
              {mode.previewContent}
            </div>

            {/* Label */}
            <div style={{ fontFamily: inter.style.fontFamily, fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: isSelected ? '#1A6FFF' : 'rgba(236,234,229,0.9)', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
              {mode.label}
            </div>

            {/* Description */}
            <p style={{ fontFamily: inter.style.fontFamily, fontSize: '13px', color: 'rgba(236,234,229,0.5)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              {mode.description}
            </p>

            {/* Tag */}
            <div style={{ fontFamily: inter.style.fontFamily, fontSize: '11px', color: 'rgba(236,234,229,0.3)', letterSpacing: '0.06em' }}>
              {mode.tag}
            </div>
          </div>
        )
      })}

      <style>{`
        @media (max-width: 640px) {
          .mode-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
