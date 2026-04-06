'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DesignModeSelector from '@/components/intake/DesignModeSelector'
import { uploadReferenceImage } from '@/lib/storage'

const headingFont = 'var(--font-space-grotesk), sans-serif'
const bodyFont = 'var(--font-inter), sans-serif'

type DesignMode = 'CINEMATIC' | 'EDITORIAL' | 'BRUTALIST'

const DESIGNED_PAGES = [
  'Landing / Home',
  'About',
  'Pricing',
  'Contact',
  'Features / Product detail',
]

const CMS_PAGES = [
  'Blog',
  'Case Studies',
  'Team Members',
  'Changelog',
  'FAQ',
]

const NICHES = [
  'AI SaaS / Dev Tool',
  'Agency / Studio',
  'Startup / Product',
  'E-commerce',
  'Portfolio',
  'Other',
]

const KEY_EMOTIONS = [
  'Trusted and confident',
  'Excited and curious',
  'Impressed by quality',
  'Safe and understood',
  'Cutting edge / ahead of the curve',
]

interface IntakeFormState {
  mode: DesignMode
  businessName: string
  niche: string
  audience: string
  keyEmotion: string
  designedPages: string[]
  cmsPages: string[]
  brandVoice: string
  brandColors: string
  avoid: string
  refUrls: [string, string]
  refImages: string[]
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: bodyFont,
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.10em',
  color: 'rgba(236,234,229,0.4)',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '48px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0px',
  color: '#ECEAE5',
  fontFamily: bodyFont,
  fontSize: '15px',
  padding: '0 16px',
  outline: 'none',
  transition: 'border-color 200ms ease, background 200ms ease',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  height: '96px',
  padding: '12px 16px',
  resize: 'vertical' as const,
  lineHeight: '1.5',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(236,234,229,0.3)' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
  paddingRight: '40px',
  cursor: 'pointer',
}

const sectionDivider: React.CSSProperties = {
  borderTop: '1px solid rgba(255,255,255,0.07)',
  paddingTop: '48px',
  marginTop: '48px',
}

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: headingFont,
  fontSize: '24px',
  fontWeight: 600,
  color: '#ECEAE5',
  letterSpacing: '-0.01em',
  margin: '0 0 8px 0',
}

const sectionSubtextStyle: React.CSSProperties = {
  fontFamily: bodyFont,
  fontSize: '15px',
  color: 'rgba(236,234,229,0.45)',
  margin: '0 0 32px 0',
  lineHeight: 1.5,
}

export default function IntakePage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [form, setForm] = useState<IntakeFormState>({
    mode: 'CINEMATIC',
    businessName: '',
    niche: '',
    audience: '',
    keyEmotion: '',
    designedPages: [],
    cmsPages: [],
    brandVoice: '',
    brandColors: '',
    avoid: '',
    refUrls: ['', ''],
    refImages: [],
  })

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tooManyPages = form.designedPages.length > 5

  const canSubmit =
    form.businessName.trim().length > 0 &&
    form.niche.length > 0 &&
    form.designedPages.length > 0 &&
    !submitting

  function togglePage(list: 'designedPages' | 'cmsPages', page: string) {
    setForm((prev) => ({
      ...prev,
      [list]: prev[list].includes(page)
        ? prev[list].filter((p) => p !== page)
        : [...prev[list], page],
    }))
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files)
    const valid = arr.filter((f) => {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) return false
      if (f.size > 5 * 1024 * 1024) return false
      return true
    })

    if (form.refImages.length + valid.length > 4) {
      setUploadError('Maximum 4 images allowed.')
      return
    }

    if (valid.length === 0) {
      setUploadError('Only PNG, JPG or WEBP files under 5MB are accepted.')
      return
    }

    setUploadError(null)
    setUploading(true)

    try {
      const urls = await Promise.all(valid.map((f) => uploadReferenceImage(f, projectId)))
      setForm((prev) => ({ ...prev, refImages: [...prev.refImages, ...urls] }))
    } catch {
      setUploadError('Upload failed. Check your Supabase storage bucket settings.')
    } finally {
      setUploading(false)
    }
  }, [form.refImages.length, projectId])

  function removeImage(url: string) {
    setForm((prev) => ({ ...prev, refImages: prev.refImages.filter((u) => u !== url) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitError(null)
    setSubmitting(true)

    const payload = {
      businessName: form.businessName.trim(),
      niche: form.niche,
      audience: form.audience.trim(),
      keyEmotion: form.keyEmotion,
      designedPages: form.designedPages,
      cmsPages: form.cmsPages,
      brandVoice: form.brandVoice.trim(),
      existingColors: form.brandColors.trim(),
      avoid: form.avoid.trim(),
      refUrls: form.refUrls.filter(Boolean),
      refImages: form.refImages,
      mode: form.mode,
    }

    const res = await fetch(`/api/projects/${projectId}/intake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json() as { error?: string }
      setSubmitError(data.error ?? 'Failed to submit intake. Please try again.')
      setSubmitting(false)
      return
    }

    router.push(`/projects/${projectId}`)
  }

  function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'rgba(26,111,255,0.6)'
    e.currentTarget.style.background = 'rgba(26,111,255,0.04)'
  }
  function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050505', fontFamily: bodyFont }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
        <div>
          <span style={{ fontFamily: bodyFont, fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', color: '#1A6FFF', textTransform: 'uppercase' as const }}>FORMA</span>
          <span style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.3)', textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}> / Intake</span>
        </div>
        <Link href="/dashboard" style={{ fontFamily: bodyFont, fontSize: '13px', color: 'rgba(236,234,229,0.4)', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#ECEAE5' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(236,234,229,0.4)' }}
        >
          ← Dashboard
        </Link>
      </header>

      {/* Page title */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 0' }}>
        <h1 style={{ fontFamily: headingFont, fontSize: '40px', fontWeight: 700, letterSpacing: '-0.02em', color: '#ECEAE5', margin: '0 0 8px 0' }}>
          Design Intake
        </h1>
        <p style={{ fontFamily: bodyFont, fontSize: '16px', color: 'rgba(236,234,229,0.45)', margin: 0 }}>
          Tell us about your project. The more context you give, the better your design will be.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px 120px' }}>

          {/* SECTION 1 — Design Style */}
          <div>
            <h2 style={sectionHeadingStyle}>Choose your design style</h2>
            <p style={sectionSubtextStyle}>This determines the entire visual direction of your site.</p>
            <DesignModeSelector value={form.mode} onChange={(m) => setForm((p) => ({ ...p, mode: m }))} />
          </div>

          {/* SECTION 2 — About Your Business */}
          <div style={sectionDivider}>
            <h2 style={sectionHeadingStyle}>Tell us about your business</h2>
            <p style={sectionSubtextStyle}>&nbsp;</p>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Business Name <span style={{ color: '#DC2626' }}>*</span></label>
              <input type="text" value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))} maxLength={100} required placeholder="e.g. Nexus AI" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Niche <span style={{ color: '#DC2626' }}>*</span></label>
              <select value={form.niche} onChange={(e) => setForm((p) => ({ ...p, niche: e.target.value }))} required style={selectStyle} onFocus={focusInput} onBlur={blurInput}>
                <option value="" disabled>Select your niche</option>
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Target Audience <span style={{ color: '#DC2626' }}>*</span></label>
              <textarea value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))} maxLength={300} placeholder="Who are your ideal customers? e.g. Technical founders building AI products" style={textareaStyle} onFocus={focusInput} onBlur={blurInput} />
              <div style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.25)', marginTop: '4px', textAlign: 'right' as const }}>{form.audience.length}/300</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Key Emotion <span style={{ color: '#DC2626' }}>*</span></label>
              <select value={form.keyEmotion} onChange={(e) => setForm((p) => ({ ...p, keyEmotion: e.target.value }))} style={selectStyle} onFocus={focusInput} onBlur={blurInput}>
                <option value="" disabled>How should visitors feel?</option>
                {KEY_EMOTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>

          {/* SECTION 3 — Pages */}
          <div style={sectionDivider}>
            <h2 style={sectionHeadingStyle}>What pages do you need?</h2>
            <p style={sectionSubtextStyle}>Select up to 5 designed pages. CMS pages are unlimited and template-based.</p>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ ...labelStyle, marginBottom: '16px' }}>Designed Pages (max 5)</label>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                {DESIGNED_PAGES.map((page) => (
                  <CheckboxRow
                    key={page}
                    label={page}
                    checked={form.designedPages.includes(page)}
                    onChange={() => togglePage('designedPages', page)}

                  />
                ))}
              </div>
              {tooManyPages && (
                <p style={{ fontFamily: bodyFont, fontSize: '13px', color: '#CA8A04', marginTop: '12px' }}>
                  Maximum 5 designed pages. We&apos;ll prioritize the most important ones.
                </p>
              )}
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: '16px' }}>CMS Pages (unlimited, template-based)</label>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
                {CMS_PAGES.map((page) => (
                  <CheckboxRow
                    key={page}
                    label={page}
                    checked={form.cmsPages.includes(page)}
                    onChange={() => togglePage('cmsPages', page)}

                  />
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4 — Brand Identity */}
          <div style={sectionDivider}>
            <h2 style={sectionHeadingStyle}>Do you have an existing brand?</h2>
            <p style={sectionSubtextStyle}>All optional — skip if starting from scratch.</p>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Brand Voice</label>
              <input type="text" value={form.brandVoice} onChange={(e) => setForm((p) => ({ ...p, brandVoice: e.target.value }))} maxLength={200} placeholder="e.g. Technical but human. Confident without arrogance." style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Brand Colors</label>
              <input type="text" value={form.brandColors} onChange={(e) => setForm((p) => ({ ...p, brandColors: e.target.value }))} maxLength={200} placeholder="e.g. #1A6FFF, #050505 — paste your hex codes if you have them" style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Avoid</label>
              <textarea value={form.avoid} onChange={(e) => setForm((p) => ({ ...p, avoid: e.target.value }))} maxLength={500} placeholder="e.g. No rounded corners, no stock photos, nothing that looks like a Webflow template" style={textareaStyle} onFocus={focusInput} onBlur={blurInput} />
              <div style={{ fontFamily: bodyFont, fontSize: '11px', color: 'rgba(236,234,229,0.25)', marginTop: '4px', textAlign: 'right' as const }}>{form.avoid.length}/500</div>
            </div>
          </div>

          {/* SECTION 5 — References */}
          <div style={sectionDivider}>
            <h2 style={sectionHeadingStyle}>Show us what you like</h2>
            <p style={sectionSubtextStyle}>Optional. The more context you give, the better your design will be.</p>

            {/* Reference URLs */}
            <div style={{ marginBottom: '32px' }}>
              <label style={labelStyle}>Sites You Admire</label>
              <p style={{ fontFamily: bodyFont, fontSize: '13px', color: 'rgba(236,234,229,0.3)', marginBottom: '12px', marginTop: '-4px' }}>
                We&apos;ll analyze these for design signals — not copy them
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
                {[0, 1].map((i) => (
                  <input
                    key={i}
                    type="url"
                    value={form.refUrls[i]}
                    onChange={(e) => {
                      const urls: [string, string] = [...form.refUrls] as [string, string]
                      urls[i] = e.target.value
                      setForm((p) => ({ ...p, refUrls: urls }))
                    }}
                    placeholder="https://..."
                    style={inputStyle}
                    onFocus={focusInput}
                    onBlur={blurInput}
                  />
                ))}
              </div>
            </div>

            {/* Reference Images */}
            <div>
              <label style={labelStyle}>Mood Board / Brand Assets</label>
              <p style={{ fontFamily: bodyFont, fontSize: '13px', color: 'rgba(236,234,229,0.3)', marginBottom: '12px', marginTop: '-4px' }}>
                Screenshots, inspiration images, your logo — upload up to 4
              </p>

              {/* Upload zone */}
              {form.refImages.length < 4 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    if (e.dataTransfer.files.length > 0) void handleFiles(e.dataTransfer.files)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `1px dashed ${dragOver ? '#1A6FFF' : 'rgba(255,255,255,0.12)'}`,
                    background: dragOver ? 'rgba(26,111,255,0.04)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '0px',
                    padding: '32px',
                    textAlign: 'center' as const,
                    cursor: 'pointer',
                    transition: 'border-color 200ms ease, background 200ms ease',
                    marginBottom: '16px',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files) void handleFiles(e.target.files) }}
                  />
                  {uploading ? (
                    <p style={{ fontFamily: bodyFont, fontSize: '14px', color: 'rgba(236,234,229,0.45)' }}>Uploading...</p>
                  ) : (
                    <>
                      <p style={{ fontFamily: bodyFont, fontSize: '14px', color: 'rgba(236,234,229,0.45)', margin: '0 0 4px 0' }}>
                        Drag & drop or click to upload
                      </p>
                      <p style={{ fontFamily: bodyFont, fontSize: '12px', color: 'rgba(236,234,229,0.25)', margin: 0 }}>
                        PNG, JPG, WEBP · Max 5MB each · {4 - form.refImages.length} remaining
                      </p>
                    </>
                  )}
                </div>
              )}

              {uploadError && (
                <p style={{ fontFamily: bodyFont, fontSize: '13px', color: '#DC2626', marginBottom: '12px' }}>
                  {uploadError}
                </p>
              )}

              {/* Image previews */}
              {form.refImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {form.refImages.map((url) => (
                    <div key={url} style={{ position: 'relative', aspectRatio: '1', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(5,5,5,0.8)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0px', color: '#ECEAE5', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit error */}
          {submitError && (
            <p style={{ fontFamily: bodyFont, fontSize: '14px', color: '#DC2626', marginTop: '32px' }}>
              {submitError}
            </p>
          )}
        </div>

        {/* Sticky submit bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(5,5,5,0.95)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)', padding: '16px 24px', zIndex: 10 }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%',
                height: '56px',
                background: '#1A6FFF',
                border: 'none',
                borderRadius: '0px',
                color: '#ffffff',
                fontFamily: bodyFont,
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.4,
                transition: 'background 200ms ease, opacity 200ms ease',
              }}
              onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.background = '#1560E0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1A6FFF' }}
            >
              {submitting ? 'Starting pipeline...' : 'Generate My Design'}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        input::placeholder, textarea::placeholder { color: rgba(236,234,229,0.2); }
        select option { background: #111; color: #ECEAE5; }
      `}</style>
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          background: checked ? '#1A6FFF' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${checked ? '#1A6FFF' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '0px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 150ms ease, border-color 150ms ease',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontFamily: bodyFont, fontSize: '15px', color: checked ? '#ECEAE5' : 'rgba(236,234,229,0.6)', transition: 'color 150ms ease' }}>
        {label}
      </span>
    </label>
  )
}
