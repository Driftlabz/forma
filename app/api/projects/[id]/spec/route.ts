import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    const { data: spec, error: specError } = await supabase
      .from('specs')
      .select('*')
      .eq('project_id', params.id)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (specError) {
      return NextResponse.json({ error: specError.message, code: 'DB_ERROR' }, { status: 500 })
    }

    return NextResponse.json({ spec: spec ?? null })
  } catch {
    return NextResponse.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
  }
}
