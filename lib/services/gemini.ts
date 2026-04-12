import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateBackground(brandBrief: string): Promise<string | null> {
  try {
    const key = process.env.GEMINI_API_KEY
    if (!key) {
      console.warn('[Gemini] GEMINI_API_KEY not set — skipping')
      return null
    }

    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `You are a visual art director. Based on this brand brief, describe the ideal background atmosphere and visual texture for the website hero section in 2–3 sentences. Be specific: colors, lighting, texture, mood. No generic answers.

Brand brief: ${brandBrief}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    return text || null
  } catch (err) {
    console.warn('[Gemini] Error:', err instanceof Error ? err.message : String(err))
    return null
  }
}
