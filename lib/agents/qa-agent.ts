import { callClaude } from '../claude'
import { QA_SYSTEM_PROMPT } from '../prompts/qa'
import { repairJSON } from '../utils'

export async function runQAAgent(
  designSpec: Record<string, unknown>
): Promise<Record<string, unknown>> {
  try {
    const userMessage = `Audit this design spec against all 9 QA categories:\n${JSON.stringify(designSpec, null, 2)}`

    const raw = await callClaude({
      systemPrompt: QA_SYSTEM_PROMPT,
      userMessage,
      useHaiku: true,
      maxTokens: 2000,
    })

    const parsed: unknown = repairJSON(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Invalid QA result response shape')
    }

    return parsed as Record<string, unknown>
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) throw err
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw { error: message, code: 'QA_AGENT_ERROR' }
  }
}
