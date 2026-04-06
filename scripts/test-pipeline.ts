import * as fs from 'fs'
import * as path from 'path'

// dotenv is loaded via --require in the ts-node command before imports
// But we also call it here as a safety net for environments without the flag
import * as dotenv from 'dotenv'
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

import { runDesignPipeline } from '../lib/agents/orchestrator'

const MOCK_INTAKE = {
  businessName: 'Nexus AI',
  niche: 'AI SaaS / Dev Tool',
  audience: 'Technical founders building AI-native products',
  keyEmotion: 'Trusted and confident',
  designedPages: ['Landing', 'Pricing', 'About'],
  cmsPages: ['Blog'],
  refUrls: [],
  refImages: [],
  brandColors: [],
  brandVoice: 'Technical but human. Confident without arrogance.',
  avoid: 'Anything that looks like a generic SaaS template',
  notes: '',
  flags: [],
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('FORMA — Pipeline Test')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Input:', JSON.stringify(MOCK_INTAKE, null, 2))
  console.log('')

  const startTime = Date.now()

  const result = await runDesignPipeline(MOCK_INTAKE)

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('RESULTS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('QA Passed:', result.passed)
  console.log('QA Overall:', result.qaResult.overall ?? 'n/a')
  console.log('QA Failures:', result.qaResult.failures ?? [])
  console.log('Errors:', result.errors.length > 0 ? result.errors : 'none')
  console.log('Preview HTML length:', result.previewHtml.length, 'chars')
  console.log('Time taken:', elapsed, 'seconds')

  // Save outputs
  const outputDir = path.resolve(__dirname, 'output')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const specPath = path.join(outputDir, 'test-spec.json')
  const previewPath = path.join(outputDir, 'test-preview.html')

  fs.writeFileSync(specPath, JSON.stringify(result.spec, null, 2), 'utf8')
  console.log('Spec saved to:', specPath)

  if (result.previewHtml.length > 0) {
    fs.writeFileSync(previewPath, result.previewHtml, 'utf8')
    console.log('Preview saved to:', previewPath)
  } else {
    console.warn('Preview HTML was empty — not saved.')
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('SPEC SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (result.spec && typeof result.spec === 'object') {
    const spec = result.spec as Record<string, unknown>
    console.log('Mode:', spec.mode)
    console.log('Niche:', spec.niche)
    console.log('Elite Markers:', spec.eliteMarkers)
    const pages = spec.pages as Array<Record<string, unknown>> | undefined
    if (pages) {
      console.log('Pages:', pages.map((p) => `${p.name} (${p.type})`))
      pages.forEach((p) => {
        const sections = p.sections as Array<Record<string, unknown>> | undefined
        console.log(`  ${p.name}: ${sections?.length ?? 0} sections`)
      })
    }
    const cms = spec.cmsCollections as Array<Record<string, unknown>> | undefined
    if (cms) console.log('CMS Collections:', cms.map((c) => c.name))
  }

  console.log('')
  console.log('Total time:', elapsed, 'seconds')

  // Exit cleanly
  process.exit(result.errors.length === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
