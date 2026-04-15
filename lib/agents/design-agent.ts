import { callClaude } from '../claude'
import { DESIGN_SYSTEM_PROMPT } from '../prompts/design'
import { repairJSON } from '../utils'

const REQUIRED_SPEC_FIELDS = ['mode', 'niche', 'audience', 'keyEmotion', 'eliteMarkers', 'slopPatterns', 'colorStyles', 'pages', 'cmsCollections']

interface ResourceBundle {
  referenceContent: string[]
  photoUrls: string[]
  referenceScreenshot: string | null
}

export async function runDesignAgent(
  intake: Record<string, unknown>,
  qaFailures?: string[],
  resources?: ResourceBundle
): Promise<Record<string, unknown>> {
  try {
    let userMessage = `Generate a complete design spec for this project:\n${JSON.stringify(intake, null, 2)}`

    if (resources) {
      if (resources.referenceContent.length > 0) {
        userMessage += `\n\nREFERENCE CONTENT (scraped from client's reference URLs — use for tone, structure, and content signals):\n${resources.referenceContent.join('\n\n---\n\n')}`
      }
      if (resources.photoUrls.length > 0) {
        userMessage += `\n\nAVAILABLE PHOTOS (Unsplash — you may reference these URLs in image layers):\n${resources.photoUrls.join('\n')}`
      }
      if (resources.referenceScreenshot) {
        userMessage += `\n\nA screenshot of the client's reference site is attached as an image. Analyze it for visual aesthetic signals: color temperature, layout density, typographic weight, spacing philosophy, and overall atmosphere. Use these signals to inform your archetype selection and design decisions.`
      }
    }

    if (qaFailures && qaFailures.length > 0) {
      userMessage += `\n\nQA FAILURES TO FIX — redesign to resolve all of these:\n${qaFailures.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
    }

    const raw = await callClaude({
      systemPrompt: DESIGN_SYSTEM_PROMPT,
      userMessage,
      useHaiku: false,
      maxTokens: 12000,
      timeoutMs: 120000,
      // Pass screenshot as vision input if available
      imageBase64: resources?.referenceScreenshot ?? undefined,
    })

    const parsed: unknown = repairJSON(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Invalid design spec response shape')
    }

    const result = parsed as Record<string, unknown>

    for (const field of REQUIRED_SPEC_FIELDS) {
      if (!(field in result)) {
        throw new Error(`Missing required field in design spec: ${field}`)
      }
    }

    if (!Array.isArray(result.pages) || (result.pages as unknown[]).length === 0) {
      throw new Error('Design spec must contain at least one page')
    }

    return result
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) throw err
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw { error: message, code: 'DESIGN_AGENT_ERROR' }
  }
}
