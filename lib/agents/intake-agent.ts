import { callClaude } from '../claude'
import { INTAKE_SYSTEM_PROMPT } from '../prompts/intake'
import { sanitizeIntake, extractJSON } from '../utils'

const REQUIRED_FIELDS = [
  'businessName', 'niche', 'audience', 'keyEmotion', 'mode',
  'designedPages', 'cmsPages',
]

export async function runIntakeAgent(
  rawIntake: Record<string, unknown>
): Promise<Record<string, unknown>> {
  try {
    const sanitized = sanitizeIntake(rawIntake)

    const userMessage = `Process this intake data and return the enriched JSON object:\n${JSON.stringify(sanitized, null, 2)}`

    const raw = await callClaude({
      systemPrompt: INTAKE_SYSTEM_PROMPT,
      userMessage,
      useHaiku: false,
      maxTokens: 2000,
    })

    const parsed: unknown = JSON.parse(extractJSON(raw))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Invalid intake response shape')
    }

    const result = parsed as Record<string, unknown>

    for (const field of REQUIRED_FIELDS) {
      if (!(field in result)) {
        throw new Error(`Missing required field in intake result: ${field}`)
      }
    }

    return result
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) throw err
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw { error: message, code: 'INTAKE_AGENT_ERROR' }
  }
}
