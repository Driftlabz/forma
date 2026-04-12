export async function searchPhotos(query: string, count: number = 3): Promise<string[]> {
  try {
    const key = process.env.UNSPLASH_ACCESS_KEY
    if (!key) {
      console.warn('[Unsplash] UNSPLASH_ACCESS_KEY not set — skipping')
      return []
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
    })

    if (!res.ok) {
      console.warn(`[Unsplash] Request failed: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json() as { results?: Array<{ urls?: { regular?: string } }> }
    const urls = (data.results ?? [])
      .map(r => r?.urls?.regular)
      .filter((u): u is string => typeof u === 'string')

    return urls.slice(0, count)
  } catch (err) {
    console.warn('[Unsplash] Error:', err instanceof Error ? err.message : String(err))
    return []
  }
}
