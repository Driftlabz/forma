/**
 * Screenshot capture service using ScreenshotOne API.
 * Returns a base64-encoded PNG string for use as Claude vision input.
 *
 * Activation: set SCREENSHOTONE_API_KEY in .env.local
 * Until the key is set, the function returns null gracefully.
 */
export async function captureScreenshot(url: string): Promise<string | null> {
  try {
    const key = process.env.SCREENSHOTONE_API_KEY
    if (!key) {
      // Not yet activated — degrade gracefully
      return null
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    const params = new URLSearchParams({
      access_key: key,
      url,
      format: 'png',
      response_type: 'base64',
      viewport_width: '1440',
      viewport_height: '900',
      full_page: 'false',
      delay: '1',
      block_ads: 'true',
      block_cookie_banners: 'true',
    })

    const res = await fetch(
      `https://api.screenshotone.com/take?${params.toString()}`,
      { signal: controller.signal }
    )

    clearTimeout(timeoutId)

    if (!res.ok) {
      console.warn(`[Screenshot] Request failed: ${res.status} ${res.statusText}`)
      return null
    }

    const text = await res.text()
    return text.trim() || null
  } catch (err) {
    console.warn('[Screenshot] Error:', err instanceof Error ? err.message : String(err))
    return null
  }
}
