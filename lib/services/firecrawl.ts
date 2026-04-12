import FirecrawlApp from '@mendable/firecrawl-js'

const TIMEOUT_MS = 10_000
const MAX_CHARS = 2000

export async function scrapeReference(url: string): Promise<string | null> {
  try {
    const key = process.env.FIRECRAWL_API_KEY
    if (!key) {
      console.warn('[Firecrawl] FIRECRAWL_API_KEY not set — skipping')
      return null
    }

    const app = new FirecrawlApp({ apiKey: key })

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), TIMEOUT_MS)
    )

    const scrapePromise = (async () => {
      const result = await app.scrape(url, { formats: ['markdown'] }) as {
        success?: boolean
        markdown?: string
      }
      if (!result.success || !result.markdown) return null
      return result.markdown.slice(0, MAX_CHARS)
    })()

    return await Promise.race([scrapePromise, timeoutPromise])
  } catch (err) {
    console.warn('[Firecrawl] Error:', err instanceof Error ? err.message : String(err))
    return null
  }
}
