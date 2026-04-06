import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeIntake } from '@/lib/utils'
import { runDesignPipeline } from '@/lib/agents/orchestrator'

async function runPipelineInBackground(
  projectId: string,
  sanitizedIntake: Record<string, unknown>
): Promise<void> {
  const supabaseModule = await import('@/lib/supabase/server')
  const supabase = supabaseModule.createClient()

  try {
    const result = await runDesignPipeline(sanitizedIntake)

    // Save spec to database
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

    // Update project status
    const newStatus = result.passed ? 'preview' : 'failed'
    await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId)
  } catch (err) {
    const message = typeof err === 'object' && err !== null && 'error' in err
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (project.status !== 'intake') {
      return NextResponse.json(
        { error: `Project status is '${project.status}', expected 'intake'`, code: 'INVALID_STATUS' },
        { status: 409 }
      )
    }

    const body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 })
    }

    const sanitized = sanitizeIntake(body as Record<string, unknown>)

    // Save intake to DB
    const intakePayload = {
      project_id: params.id,
      business_name: sanitized.business_name ?? sanitized.businessName ?? '',
      niche: sanitized.niche ?? '',
      audience: sanitized.audience ?? '',
      key_emotion: sanitized.key_emotion ?? sanitized.keyEmotion ?? '',
      designed_pages: sanitized.designed_pages ?? sanitized.designedPages ?? [],
      cms_pages: sanitized.cms_pages ?? sanitized.cmsPages ?? [],
      references: sanitized.refUrls ?? sanitized.references ?? [],
      reference_images: sanitized.refImages ?? sanitized.reference_images ?? [],
      avoid: sanitized.avoid ?? '',
    }

    const { error: intakeError } = await supabase.from('intakes').insert(intakePayload)

    if (intakeError) {
      return NextResponse.json({ error: intakeError.message, code: 'DB_ERROR' }, { status: 500 })
    }

    // Update project status to designing
    await supabase
      .from('projects')
      .update({ status: 'designing' })
      .eq('id', params.id)

    // Fire and forget — do not await
    void runPipelineInBackground(params.id, sanitized)

    return NextResponse.json({ message: 'Design pipeline started', projectId: params.id }, { status: 202 })
  } catch {
    return NextResponse.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
