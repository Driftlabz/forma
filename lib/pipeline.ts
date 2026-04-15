import { runDesignPipeline } from './agents/orchestrator'
import { searchPhotos, captureScreenshot } from './services'

export interface ResourceBundle {
  referenceContent: string[]
  photoUrls: string[]
  referenceScreenshot: string | null
}

async function runReferenceIntelligence(intake: Record<string, unknown>): Promise<ResourceBundle> {
  const bundle: ResourceBundle = { referenceContent: [], photoUrls: [], referenceScreenshot: null }

  // Env key warnings — degrade gracefully if missing
  const warnings: string[] = []
  if (!process.env.FIRECRAWL_API_KEY) warnings.push('FIRECRAWL_API_KEY')
  if (!process.env.UNSPLASH_ACCESS_KEY) warnings.push('UNSPLASH_ACCESS_KEY')
  if (!process.env.FAL_KEY) warnings.push('FAL_KEY')
  if (!process.env.GEMINI_API_KEY) warnings.push('GEMINI_API_KEY')
  if (!process.env.SCREENSHOTONE_API_KEY) warnings.push('SCREENSHOTONE_API_KEY')
  if (warnings.length > 0) {
    console.warn('[Pipeline] Missing env keys (services will degrade gracefully):', warnings.join(', '))
  }

  const tasks: Promise<void>[] = []

  // Firecrawl scraping temporarily disabled — hanging issue, will fix later
  // const refUrls = Array.isArray(intake.refUrls) ? (intake.refUrls as string[]).slice(0, 3) : []

  // Screenshot capture — run in parallel on first ref URL if present
  const refUrls = Array.isArray(intake.refUrls) ? (intake.refUrls as string[]) : []
  const firstUrl = refUrls.find((u) => typeof u === 'string' && u.startsWith('http'))
  if (firstUrl) {
    tasks.push(
      captureScreenshot(firstUrl).then((screenshot) => {
        bundle.referenceScreenshot = screenshot
        if (screenshot) console.log('[Pipeline] Screenshot captured for:', firstUrl)
      })
    )
  }

  // Unsplash photos using niche as query
  const niche = typeof intake.niche === 'string' ? intake.niche : 'technology website'
  tasks.push(
    searchPhotos(niche, 3).then(urls => {
      bundle.photoUrls = urls
      console.log(`[Pipeline] Unsplash returned ${urls.length} photos`)
    })
  )

  await Promise.all(tasks)
  return bundle
}

export async function runPipelineInBackground(
  projectId: string,
  intake: Record<string, unknown>
): Promise<void> {
  // Dynamic import avoids server-client instantiation at module load time
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()

  try {
    // Pre-Design Agent step: gather reference intelligence (hard 15s cap)
    console.log('[Pipeline] Pre-step: Running reference intelligence...')

    // Use manual promise so we can clearTimeout when the main work finishes,
    // avoiding the spurious "timed out" log when services complete quickly.
    const resources = await new Promise<ResourceBundle>((resolve) => {
      const timer = setTimeout(() => {
        console.warn('[Pipeline] Reference intelligence timed out after 15s — continuing with empty bundle')
        resolve({ referenceContent: [], photoUrls: [], referenceScreenshot: null })
      }, 15000)

      runReferenceIntelligence(intake)
        .then((result) => { clearTimeout(timer); resolve(result) })
        .catch(() => { clearTimeout(timer); resolve({ referenceContent: [], photoUrls: [], referenceScreenshot: null }) })
    })

    const result = await runDesignPipeline(intake, resources)

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
