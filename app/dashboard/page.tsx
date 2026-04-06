import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Project, ProjectStatus } from '@/lib/types'

const statusColors: Record<ProjectStatus, string> = {
  intake: 'bg-[#6B7280]/20 text-[#6B7280] border border-[#6B7280]/30',
  designing: 'bg-[#1A6FFF]/20 text-[#1A6FFF] border border-[#1A6FFF]/30',
  preview: 'bg-[#CA8A04]/20 text-[#CA8A04] border border-[#CA8A04]/30',
  revision: 'bg-[#CA8A04]/20 text-[#CA8A04] border border-[#CA8A04]/30',
  building: 'bg-[#1A6FFF]/20 text-[#1A6FFF] border border-[#1A6FFF]/30',
  complete: 'bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30',
  failed: 'bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const projectList = (projects ?? []) as Project[]

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="border-b border-[#1E1E1E] px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-[#1A6FFF] text-sm font-body tracking-widest uppercase">Forma</span>
          <span className="text-[#ECEAE5]/30 text-sm font-body"> by Driftlabs</span>
        </div>
        <span className="font-body text-xs text-[#ECEAE5]/30">{user.email}</span>
      </header>

      <main className="px-6 py-12 max-w-4xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-[#ECEAE5]">Projects</h1>
            <p className="font-body text-sm text-[#ECEAE5]/40 mt-1">
              {projectList.length} {projectList.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <Link
            href="/projects/new"
            className="bg-[#1A6FFF] text-white font-body text-sm font-medium px-5 py-2.5 hover:bg-[#1557CC] transition-colors"
          >
            New Project
          </Link>
        </div>

        {projectList.length === 0 ? (
          <div className="border border-[#1E1E1E] px-8 py-16">
            <h2 className="font-heading text-xl font-medium text-[#ECEAE5] mb-2">
              No projects yet
            </h2>
            <p className="font-body text-sm text-[#ECEAE5]/40 mb-8">
              Start by creating your first Forma project.
            </p>
            <Link
              href="/projects/new"
              className="inline-block bg-[#1A6FFF] text-white font-body text-sm font-medium px-5 py-2.5 hover:bg-[#1557CC] transition-colors"
            >
              New Project
            </Link>
          </div>
        ) : (
          <div className="space-y-0 border border-[#1E1E1E]">
            {projectList.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] last:border-b-0 hover:bg-[#0F0F0F] transition-colors"
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-body text-sm font-medium text-[#ECEAE5]">{project.name}</p>
                    <p className="font-body text-xs text-[#ECEAE5]/30 mt-0.5">
                      {formatDate(project.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`font-body text-xs px-2.5 py-1 uppercase tracking-wider ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
