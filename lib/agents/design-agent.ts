import { callClaude } from '../claude'
import { DESIGN_SYSTEM_PROMPT } from '../prompts/design'
import { extractJSON } from '../utils'

const REQUIRED_SPEC_FIELDS = ['mode', 'niche', 'audience', 'keyEmotion', 'eliteMarkers', 'slopPatterns', 'colorStyles', 'pages', 'cmsCollections']

export async function runDesignAgent(
  intake: Record<string, unknown>,
  qaFailures?: string[]
): Promise<Record<string, unknown>> {
  try {
    let userMessage = `Generate a complete design spec for this project:\n${JSON.stringify(intake, null, 2)}`

    if (qaFailures && qaFailures.length > 0) {
      userMessage += `\n\nQA FAILURES TO FIX — redesign to resolve all of these:\n${qaFailures.map((f, i) => `${i + 1}. ${f}`).join('\n')}`
    }

    const raw = await callClaude({
      systemPrompt: DESIGN_SYSTEM_PROMPT,
      userMessage,
      useHaiku: false,
      maxTokens: 8000,
      timeoutMs: 120000,
    })

    const parsed: unknown = JSON.parse(extractJSON(raw))
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
