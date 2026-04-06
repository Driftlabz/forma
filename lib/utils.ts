/**
 * Strip markdown code fences from a model response and return raw JSON string.
 * Handles ```json ... ``` and bare ``` ... ``` wrappers.
 */
export function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  return raw.trim()
}

const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/gi,
  /you\s+are\s+now/gi,
  /forget\s+everything/gi,
  /system\s+prompt/gi,
  /jailbreak/gi,
  /<[^>]*>/g,
  /\[[^\]]{20,}\]/g,
]

export function sanitizeText(input: string, maxLength: number): string {
  if (typeof input !== 'string') return ''
  let clean = input
  for (const pattern of INJECTION_PATTERNS) {
    clean = clean.replace(pattern, '')
  }
  clean = clean.trim()
  return clean.slice(0, maxLength)
}

export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return ''
  const trimmed = url.trim().slice(0, 500)
  if (!/^https?:\/\//i.test(trimmed)) return ''
  if (/^(script|javascript|data|vbscript):/i.test(trimmed)) return ''
  return trimmed
}

export function sanitizeIntake(raw: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  sanitized.business_name = sanitizeText(String(raw.business_name ?? ''), 100)
  sanitized.niche = sanitizeText(String(raw.niche ?? ''), 100)
  sanitized.audience = sanitizeText(String(raw.audience ?? ''), 300)
  sanitized.key_emotion = sanitizeText(String(raw.key_emotion ?? ''), 100)
  sanitized.avoid = sanitizeText(String(raw.avoid ?? ''), 500)
  sanitized.brand_voice = sanitizeText(String(raw.brand_voice ?? ''), 200)
  sanitized.existing_colors = sanitizeText(String(raw.existing_colors ?? ''), 200)
  sanitized.notes = sanitizeText(String(raw.notes ?? ''), 500)

  // Arrays of page names — handle both snake_case and camelCase input
  const rawDesignedPages = raw.designed_pages ?? raw.designedPages
  sanitized.designed_pages = Array.isArray(rawDesignedPages)
    ? (rawDesignedPages as unknown[]).map((p) => sanitizeText(String(p), 100)).filter(Boolean)
    : []
  sanitized.designedPages = sanitized.designed_pages

  const rawCmsPages = raw.cms_pages ?? raw.cmsPages
  sanitized.cms_pages = Array.isArray(rawCmsPages)
    ? (rawCmsPages as unknown[]).map((p) => sanitizeText(String(p), 100)).filter(Boolean)
    : []
  sanitized.cmsPages = sanitized.cms_pages

  sanitized.flags = Array.isArray(raw.flags)
    ? (raw.flags as unknown[]).map((f) => sanitizeText(String(f), 200)).filter(Boolean)
    : []

  // Arrays of URLs
  sanitized.refUrls = Array.isArray(raw.refUrls)
    ? (raw.refUrls as unknown[]).map((u) => sanitizeUrl(String(u))).filter(Boolean)
    : []

  sanitized.ref_urls = Array.isArray(raw.ref_urls)
    ? (raw.ref_urls as unknown[]).map((u) => sanitizeUrl(String(u))).filter(Boolean)
    : []

  sanitized.refImages = Array.isArray(raw.refImages)
    ? (raw.refImages as unknown[]).map((u) => sanitizeUrl(String(u))).filter(Boolean)
    : []

  sanitized.reference_images = Array.isArray(raw.reference_images)
    ? (raw.reference_images as unknown[]).map((u) => sanitizeUrl(String(u))).filter(Boolean)
    : []

  sanitized.brandColors = Array.isArray(raw.brandColors)
    ? (raw.brandColors as unknown[]).map((c) => sanitizeText(String(c), 50)).filter(Boolean)
    : []

  // Pass through businessName alias
  if (raw.businessName !== undefined) {
    sanitized.businessName = sanitizeText(String(raw.businessName), 100)
  }
  if (raw.brandVoice !== undefined) {
    sanitized.brandVoice = sanitizeText(String(raw.brandVoice), 200)
  }
  if (raw.keyEmotion !== undefined) {
    sanitized.keyEmotion = sanitizeText(String(raw.keyEmotion), 100)
  }

  return sanitized
}
