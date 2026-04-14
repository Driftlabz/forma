import FirecrawlApp from '@mendable/firecrawl-js'

const MAX_CHARS = 2000

export async function scrapeReference(url: string): Promise<string | null> {
  try {
    const key = process.env.FIRECRAWL_API_KEY
    if (!key) {
      console.warn('[Firecrawl] FIRECRAWL_API_KEY not set — skipping')
      return null
    }

    const client = new FirecrawlApp({ apiKey: key })

    const scrapeWithTimeout = Promise.race([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as unknown as any).scrapeUrl(url, { formats: ['markdown'] }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]) as Promise<{ success?: boolean; markdown?: string }>

    const result = await scrapeWithTimeout
    if (!result.success || !result.markdown) return null
    return result.markdown.slice(0, MAX_CHARS)
  } catch (err) {
    console.warn('[Firecrawl] Error:', err instanceof Error ? err.message : String(err))
    return null
  }
}
