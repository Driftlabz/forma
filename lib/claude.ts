import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
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
}: {
  systemPrompt: string
  userMessage: string
  model?: string
  maxTokens?: number
  useHaiku?: boolean
  timeoutMs?: number
}): Promise<string> {
  const selectedModel = useHaiku ? 'claude-haiku-4-5-20251001' : model

  try {
    const response = await withTimeout(
      getClient().messages.create({
        model: selectedModel,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
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
