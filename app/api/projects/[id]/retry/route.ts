import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runPipelineInBackground } from '@/lib/pipeline'

export async function POST(
  _request: NextRequest,
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
      .select('id, status, user_id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const retryableStatuses = ['failed', 'preview', 'revision']
    if (!retryableStatuses.includes(project.status)) {
      return NextResponse.json(
        { error: `Cannot retry — project status is '${project.status}'`, code: 'INVALID_STATUS' },
        { status: 409 }
      )
    }

    // Load the most recent intake for this project
    const { data: intake, error: intakeError } = await supabase
      .from('intakes')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (intakeError || !intake) {
      return NextResponse.json({ error: 'No intake data found for this project', code: 'NO_INTAKE' }, { status: 404 })
    }

    // Clear the failed spec so the retry can insert a fresh one
    await supabase.from('specs').delete().eq('project_id', params.id)

    // Reset project to designing before firing the pipeline
    await supabase.from('projects').update({ status: 'designing' }).eq('id', params.id)

    // Fire and forget
    void runPipelineInBackground(params.id, intake as Record<string, unknown>)

    return NextResponse.json({ message: 'Pipeline restarted', projectId: params.id }, { status: 202 })
  } catch {
    return NextResponse.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
