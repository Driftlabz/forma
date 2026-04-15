'use client'

export type DesignMode = 'CINEMATIC' | 'EDITORIAL_LIGHT' | 'BOLD' | 'MINIMAL' | 'PRODUCT_LED' | 'WARM_ORGANIC'

interface DesignModeSelectorProps {
  value: DesignMode
  onChange: (mode: DesignMode) => void
}

// ─── Preview components ───────────────────────────────────────────────────────

function CinematicPreview() {
  return (
    <div style={{ width: '100%', height: '72px', background: '#050505', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '70px', height: '70px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,111,255,0.25) 0%, transparent 70%)' }} />
      <div style={{ fontSize: '6px', color: '#1A6FFF', letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase' as const, fontFamily: 'sans-serif' }}>AI PLATFORM</div>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#ECEAE5', lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'sans-serif' }}>Intelligence<br />at scale.</div>
      <div style={{ width: '20px', height: '2px', background: '#1A6FFF', marginTop: '5px' }} />
    </div>
  )
}

function EditorialLightPreview() {
  return (
    <div style={{ width: '100%', height: '72px', background: '#FAFAFA', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ fontSize: '6px', color: '#888', letterSpacing: '0.15em', marginBottom: '4px', textTransform: 'uppercase' as const, fontFamily: 'serif' }}>Financial Services</div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0A0A0A', lineHeight: 1.1, letterSpacing: '-0.02em', fontFamily: 'serif' }}>Capital that<br />moves markets.</div>
      <div style={{ display: 'flex', gap: '3px', marginTop: '5px' }}>
        <div style={{ width: '24px', height: '2px', background: '#0A0A0A' }} />
        <div style={{ width: '12px', height: '2px', background: '#bbb' }} />
      </div>
    </div>
  )
}

function BoldPreview() {
  return (
    <div style={{ width: '100%', height: '72px', background: '#FF3B00', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', width: '60px', height: '60px', background: 'rgba(0,0,0,0.15)', borderRadius: '50%' }} />
      <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase' as const, fontFamily: 'sans-serif' }}>Consumer App</div>
      <div style={{ fontSize: '11px', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.01em', textTransform: 'uppercase' as const, fontFamily: 'sans-serif' }}>DO MORE.<br />NOW.</div>
    </div>
  )
}

function MinimalPreview() {
  return (
    <div style={{ width: '100%', height: '72px', background: '#fff', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ fontSize: '6px', color: '#bbb', letterSpacing: '0.20em', marginBottom: '8px', textTransform: 'uppercase' as const, fontFamily: 'serif' }}>Studio</div>
      <div style={{ fontSize: '12px', fontWeight: 400, color: '#111', lineHeight: 1.2, fontFamily: 'serif', fontStyle: 'italic' }}>Less. Always<br />less.</div>
    </div>
  )
}

function ProductLedPreview() {
  return (
    <div style={{ width: '100%', height: '72px', background: '#0F1117', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 8px', gap: '8px' }}>
      {/* Left: label */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '4px', fontFamily: 'monospace' }}>Dashboard</div>
        <div style={{ fontSize: '8px', fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>Analytics<br />Pro</div>
      </div>
      {/* Right: UI mockup bars */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '28px' }}>
          {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 3 ? '#1A6FFF' : 'rgba(255,255,255,0.12)', borderRadius: '1px 1px 0 0' }} />
          ))}
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ flex: 2, height: '6px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ flex: 1, height: '6px', background: 'rgba(26,111,255,0.4)' }} />
        </div>
      </div>
    </div>
  )
}

function WarmOrganicPreview() {
  return (
    <div style={{ width: '100%', height: '72px', background: '#FBF6EE', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px' }}>
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(211,130,80,0.12)' }} />
      <div style={{ fontSize: '6px', color: '#C4835A', letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase' as const, fontFamily: 'serif' }}>Wellness</div>
      <div style={{ fontSize: '10px', fontWeight: 500, color: '#3D2B1F', lineHeight: 1.2, fontFamily: 'serif', fontStyle: 'italic' }}>Nourish what<br />matters most.</div>
    </div>
  )
}

// ─── Mode configurations ───────────────────────────────────────────────────────

interface ModeConfig {
  id: DesignMode
  label: string
  description: string
  tag: string
  preview: React.ReactNode
}

const MODES: ModeConfig[] = [
  {
    id: 'CINEMATIC',
    label: 'CINEMATIC',
    description: 'Dark, atmospheric, technical. Built for AI products and dev tools.',
    tag: 'AI SaaS · Dev Tools · Agencies',
    preview: <CinematicPreview />,
  },
  {
    id: 'EDITORIAL_LIGHT',
    label: 'EDITORIAL LIGHT',
    description: 'Clean, authoritative, typographic. Built for finance and enterprise.',
    tag: 'Finance · Legal · Enterprise · B2B',
    preview: <EditorialLightPreview />,
  },
  {
    id: 'BOLD',
    label: 'BOLD',
    description: 'Saturated color, high energy. Built for consumer apps and youth brands.',
    tag: 'Consumer Apps · Gaming · Youth',
    preview: <BoldPreview />,
  },
  {
    id: 'MINIMAL',
    label: 'MINIMAL',
    description: 'Maximum whitespace, understated. Built for portfolios and luxury.',
    tag: 'Portfolios · Luxury · Design Studios',
    preview: <MinimalPreview />,
  },
  {
    id: 'PRODUCT_LED',
    label: 'PRODUCT LED',
    description: 'Dashboard as hero, UI-forward. Built for SaaS with strong product UI.',
    tag: 'SaaS · Analytics · Workflow Tools',
    preview: <ProductLedPreview />,
  },
  {
    id: 'WARM_ORGANIC',
    label: 'WARM ORGANIC',
    description: 'Warm tones, approachable. Built for health, wellness, and education.',
    tag: 'Health · Wellness · Food · Education',
    preview: <WarmOrganicPreview />,
  },
]

// ─── Selector component ────────────────────────────────────────────────────────

const bodyFont = 'var(--font-inter), sans-serif'

export default function DesignModeSelector({ value, onChange }: DesignModeSelectorProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="mode-grid">
      {MODES.map((mode) => {
        const isSelected = value === mode.id
        return (
          <div
            key={mode.id}
            onClick={() => onChange(mode.id)}
            style={{
              background: isSelected ? 'rgba(26,111,255,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isSelected ? '#1A6FFF' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '0px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'border-color 200ms ease, background 200ms ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
            }}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#1A6FFF', padding: '2px 7px' }}>
                <span style={{ fontFamily: bodyFont, fontSize: '9px', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Selected</span>
              </div>
            )}

            {/* Preview */}
            <div style={{ marginBottom: '12px' }}>{mode.preview}</div>

            {/* Label */}
            <div style={{ fontFamily: bodyFont, fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: isSelected ? '#1A6FFF' : 'rgba(236,234,229,0.9)', textTransform: 'uppercase' as const, marginBottom: '6px' }}>
              {mode.label}
            </div>

            {/* Description */}
            <p style={{ fontFamily: bodyFont, fontSize: '12px', color: 'rgba(236,234,229,0.5)', lineHeight: 1.5, margin: '0 0 8px 0' }}>
              {mode.description}
            </p>

            {/* Tag */}
            <div style={{ fontFamily: bodyFont, fontSize: '10px', color: 'rgba(236,234,229,0.25)', letterSpacing: '0.04em' }}>
              {mode.tag}
            </div>
          </div>
        )
      })}

      <style>{`
        @media (max-width: 640px) {
          .mode-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) and (min-width: 641px) {
          .mode-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
