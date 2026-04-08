import { callClaude } from '../claude'
import { PREVIEW_SYSTEM_PROMPT } from '../prompts/preview'

export async function runPreviewAgent(
  designSpec: Record<string, unknown>
): Promise<string> {
  try {
    const userMessage = `Generate the full HTML preview for this design spec:\n${JSON.stringify(designSpec, null, 2)}`

    const html = await callClaude({
      systemPrompt: PREVIEW_SYSTEM_PROMPT,
      userMessage,
      useHaiku: false,
      maxTokens: 12000,
      timeoutMs: 150000,
    })

    // Strip markdown code fences if Claude wrapped the HTML
    const fenceMatch = html.match(/```(?:html)?\s*([\s\S]*?)```/i)
    const trimmed = (fenceMatch ? fenceMatch[1] : html).trim()

    if (!trimmed.toLowerCase().startsWith('<!doctype html')) {
      throw new Error('Preview agent response is not valid HTML')
    }

    return trimmed
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err) throw err
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw { error: message, code: 'PREVIEW_AGENT_ERROR' }
  }
}
