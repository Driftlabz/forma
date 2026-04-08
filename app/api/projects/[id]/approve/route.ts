import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    // Verify project belongs to user and is in a approvable state
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, status')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (project.status !== 'preview' && project.status !== 'revision') {
      return NextResponse.json(
        { error: `Cannot approve — project status is '${project.status}'`, code: 'INVALID_STATUS' },
        { status: 409 }
      )
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update({ status: 'approved' })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message, code: 'DB_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ success: true, projectId: params.id })
  } catch {
    return NextResponse.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
