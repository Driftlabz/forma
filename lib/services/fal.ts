import { fal } from '@fal-ai/client'

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const key = process.env.FAL_KEY
    if (!key) {
      console.warn('[Fal] FAL_KEY not set — skipping')
      return null
    }

    fal.config({ credentials: key })

    const result = await fal.run('fal-ai/flux/schnell', {
      input: { prompt },
    }) as { images?: Array<{ url?: string }> }

    return result?.images?.[0]?.url ?? null
  } catch (err) {
    console.warn('[Fal] Error:', err instanceof Error ? err.message : String(err))
    return null
  }
}
