import { runDesignPipeline } from './agents/orchestrator'

export async function runPipelineInBackground(
  projectId: string,
  intake: Record<string, unknown>
): Promise<void> {
  // Dynamic import avoids server-client instantiation at module load time
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()

  try {
    const result = await runDesignPipeline(intake)

    const specPayload = {
      project_id: projectId,
      version: 1,
      mode: String(result.spec.mode ?? 'CINEMATIC'),
      design_spec: result.spec,
      preview_html: result.previewHtml || null,
      qa_result: result.qaResult,
      approved: false,
    }

    await supabase.from('specs').insert(specPayload)

    // Show preview if HTML was generated, even if QA failed
    const newStatus = result.previewHtml ? 'preview' : 'failed'
    await supabase.from('projects').update({ status: newStatus }).eq('id', projectId)
  } catch (err) {
    const message =
      typeof err === 'object' && err !== null && 'error' in err
        ? String((err as Record<string, unknown>).error)
        : String(err)
    console.error('[Background pipeline error]', message)

    await Promise.all([
      supabase.from('projects').update({ status: 'failed' }).eq('id', projectId),
      supabase.from('build_logs').insert({
        project_id: projectId,
        step: 'pipeline',
        status: 'failed',
        error: message.slice(0, 1000),
      }),
    ])
  }
}
