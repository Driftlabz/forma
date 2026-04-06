import { callClaude } from '../claude'
import { BUILD_SYSTEM_PROMPT } from '../prompts/build'
import { extractJSON } from '../utils'

interface MCPInstruction {
  step: number
  description: string
  tool: string
  params: Record<string, unknown>
  fallback: 'skip_and_log' | 'abort'
}

function isValidInstruction(item: unknown): item is MCPInstruction {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  return (
    typeof obj.step === 'number' &&
    typeof obj.description === 'string' &&
    typeof obj.tool === 'string' &&
    typeof obj.params === 'object' &&
    obj.params !== null &&
    (obj.fallback === 'skip_and_log' || obj.fallback === 'abort')
  )
}

export async function runBuildAgent(
  designSpec: Record<string, unknown>
): Promise<Array<Record<string, unknown>>> {
  try {
    const userMessage = `Generate the complete ordered MCP instruction sequence for this approved design spec:\n${JSON.stringify(designSpec, null, 2)}`

    const raw = await callClaude({
      systemPrompt: BUILD_SYSTEM_PROMPT,
      userMessage,
      useHaiku: false,
      maxTokens: 8000,
      timeoutMs: 120000,
    })

    const parsed: unknown = JSON.parse(extractJSON(raw))
    if (!Array.isArray(parsed)) {
      throw new Error('Build agent response must be a JSON array')
    }

    const invalid = parsed.filter((item) => !isValidInstruction(item))
    if (invalid.length > 0) {
      throw new Error(`${invalid.length} instructions failed validation`)
    }

    return parsed as Array<Record<string, unknown>>
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) throw err
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw { error: message, code: 'BUILD_AGENT_ERROR' }
  }
}
