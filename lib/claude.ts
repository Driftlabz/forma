import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { join } from 'path'

let _client: Anthropic | null = null

function resolveApiKey(): string | undefined {
  // Use env var if non-empty
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY

  // Fallback: read .env.local directly.
  // On Windows, ANTHROPIC_API_KEY='' in system env causes Next.js/.env.local to be skipped.
  // Reading the file directly bypasses that.
  try {
    const content = readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m)
    return match?.[1]?.trim()
  } catch {
    return undefined
  }
}

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: resolveApiKey() })
  }
  return _client
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 60000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Agent call timed out after 60s')), timeoutMs)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

export async function callClaude({
  systemPrompt,
  userMessage,
  model = 'claude-sonnet-4-20250514',
  maxTokens = 4000,
  useHaiku = false,
  timeoutMs = 60000,
  imageBase64,
}: {
  systemPrompt: string
  userMessage: string
  model?: string
  maxTokens?: number
  useHaiku?: boolean
  timeoutMs?: number
  /** Optional base64-encoded PNG image to include alongside the user message */
  imageBase64?: string
}): Promise<string> {
  const selectedModel = useHaiku ? 'claude-haiku-4-5-20251001' : model

  // Build user content — include image if provided
  const userContent: Anthropic.MessageParam['content'] = imageBase64
    ? [
        {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/png' as const,
            data: imageBase64,
          },
        },
        { type: 'text' as const, text: userMessage },
      ]
    : userMessage

  try {
    const response = await withTimeout(
      getClient().messages.create({
        model: selectedModel,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
      }),
      timeoutMs
    )

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API')
    }
    return content.text
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw { error: message, code: 'CLAUDE_API_ERROR' }
  }
}
