import { runIntakeAgent } from './intake-agent'
import { runDesignAgent } from './design-agent'
import { runQAAgent } from './qa-agent'
import { runPreviewAgent } from './preview-agent'

interface ResourceBundle {
  referenceContent: string[]
  photoUrls: string[]
}

interface PipelineResult {
  intake: Record<string, unknown>
  spec: Record<string, unknown>
  qaResult: Record<string, unknown>
  previewHtml: string
  passed: boolean
  errors: string[]
}

export async function runDesignPipeline(
  rawIntake: Record<string, unknown>,
  resources?: ResourceBundle
): Promise<PipelineResult> {
  const errors: string[] = []
  let intake: Record<string, unknown> = {}
  let spec: Record<string, unknown> = {}
  let qaResult: Record<string, unknown> = {}
  let previewHtml = ''
  let passed = false

  // Step 1: Intake Agent
  console.log('[Pipeline] Step 1: Running Intake Agent...')
  try {
    intake = await runIntakeAgent(rawIntake)
    console.log('[Pipeline] Intake Agent complete:', JSON.stringify(intake, null, 2))
  } catch (err) {
    const msg = typeof err === 'object' && err !== null && 'error' in err
      ? String((err as Record<string, unknown>).error)
      : 'Intake agent failed'
    console.error('[Pipeline] Intake Agent error:', msg)
    errors.push(`INTAKE: ${msg}`)
    return { intake, spec, qaResult, previewHtml, passed: false, errors }
  }

  // Step 2: Design Agent
  console.log('[Pipeline] Step 2: Running Design Agent...')
  try {
    spec = await runDesignAgent(intake, undefined, resources)
    console.log('[Pipeline] Design Agent complete. Pages:', (spec.pages as unknown[] | undefined)?.length ?? 0)
  } catch (err) {
    const msg = typeof err === 'object' && err !== null && 'error' in err
      ? String((err as Record<string, unknown>).error)
      : 'Design agent failed'
    console.error('[Pipeline] Design Agent error:', msg)
    errors.push(`DESIGN: ${msg}`)
    return { intake, spec, qaResult, previewHtml, passed: false, errors }
  }

  // Steps 3–4: QA loop (max 2 attempts)
  const MAX_QA_LOOPS = 2
  for (let attempt = 1; attempt <= MAX_QA_LOOPS; attempt++) {
    console.log(`[Pipeline] Step 3: Running QA Agent (attempt ${attempt}/${MAX_QA_LOOPS})...`)
    try {
      qaResult = await runQAAgent(spec)
      console.log('[Pipeline] QA result:', qaResult.overall, '— failures:', qaResult.failures)

      if (qaResult.overall === 'pass') {
        passed = true
        break
      }

      if (attempt < MAX_QA_LOOPS) {
        const failures = Array.isArray(qaResult.failures)
          ? (qaResult.failures as string[])
          : []
        console.log(`[Pipeline] QA failed. Re-running Design Agent with ${failures.length} failure notes...`)
        try {
          const revisedSpec = await runDesignAgent(intake, failures)
          spec = revisedSpec
          console.log('[Pipeline] Design Agent revision complete.')
        } catch (revisionErr) {
          const revMsg = typeof revisionErr === 'object' && revisionErr !== null && 'error' in revisionErr
            ? String((revisionErr as Record<string, unknown>).error)
            : String(revisionErr)
          console.warn('[Pipeline] Design Agent revision produced malformed JSON — keeping previous spec:', revMsg)
          errors.push(`REVISION_SKIPPED: ${revMsg}`)
          // Do not re-throw — outer loop continues to next attempt with previous valid spec
        }
      } else {
        console.warn('[Pipeline] QA failed after max attempts. Continuing with failed spec.')
        errors.push(`QA: Failed after ${MAX_QA_LOOPS} attempts. Failures: ${JSON.stringify(qaResult.failures)}`)
        passed = false
      }
    } catch (err) {
      const msg = typeof err === 'object' && err !== null && 'error' in err
        ? String((err as Record<string, unknown>).error)
        : 'QA agent failed'
      console.error('[Pipeline] QA/Design Agent error:', msg)
      errors.push(`QA_LOOP: ${msg}`)
      break
    }
  }

  // Step 5: Preview Agent
  console.log('[Pipeline] Step 5: Running Preview Agent...')
  try {
    previewHtml = await runPreviewAgent(spec)
    console.log('[Pipeline] Preview Agent complete. HTML length:', previewHtml.length)
  } catch (err) {
    const msg = typeof err === 'object' && err !== null && 'error' in err
      ? String((err as Record<string, unknown>).error)
      : 'Preview agent failed'
    console.error('[Pipeline] Preview Agent error:', msg)
    errors.push(`PREVIEW: ${msg}`)
    // Don't abort — return partial result with whatever we have
  }

  console.log('[Pipeline] Complete. Passed:', passed, '| Errors:', errors.length)
  return { intake, spec, qaResult, previewHtml, passed, errors }
}
