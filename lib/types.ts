export type ProjectStatus =
  'intake' | 'designing' | 'preview' | 'revision' | 'building' | 'complete' | 'failed'

export type BuildStepStatus = 'pending' | 'running' | 'complete' | 'failed'

export type DesignMode = 'CINEMATIC' | 'EDITORIAL' | 'BRUTALIST'

export type Niche =
  'AI SaaS / Dev Tool' | 'Agency / Studio' | 'Startup / Product' |
  'E-commerce' | 'Portfolio' | 'Other'

export type KeyEmotion =
  'Trusted and confident' | 'Excited and curious' | 'Impressed by quality' |
  'Safe and understood' | 'Cutting edge / ahead of the curve'

export interface Project {
  id: string
  user_id: string
  name: string
  status: ProjectStatus
  revision_count: number
  created_at: string
  updated_at: string
}

export interface Intake {
  id: string
  project_id: string
  business_name: string
  niche: Niche
  audience: string
  key_emotion: KeyEmotion
  designed_pages: string[]
  cms_pages: string[]
  references: string[]
  reference_images: string[]
  avoid: string
  created_at: string
}

export interface Spec {
  id: string
  project_id: string
  version: number
  mode: DesignMode
  design_spec: DesignSpec | null
  preview_html: string | null
  qa_result: QAResult | null
  approved: boolean
  created_at: string
}

export interface DesignSpec {
  mode: DesignMode
  niche: string
  audience: string
  keyEmotion: string
  eliteMarkers: string[]
  slopPatterns: string[]
  colorStyles: ColorStyles
  pages: DesignPage[]
  cmsCollections: CMSCollection[]
}

export interface ColorStyles {
  background: string
  textPrimary: string
  accent: string
  surface: string
  border: string
  muted: string
}

export interface DesignPage {
  name: string
  type: 'designed' | 'cms_template'
  sections: DesignSection[]
}

export interface DesignSection {
  name: string
  layoutAxis: string
  layers: string[]
  colorStyles: string[]
  textStyles: string[]
  spacing: SectionSpacing
  animation: SectionAnimation
  breakpoints: SectionBreakpoints
  interactions: string[]
}

export interface SectionSpacing {
  paddingTop: string
  paddingBottom: string
  paddingX: string
  gap: string
}

export interface SectionAnimation {
  type: string
  duration: string
  easing: string
  stagger: string
}

export interface SectionBreakpoints {
  desktop: string
  tablet: string
  mobile: string
}

export interface CMSCollection {
  name: string
  fields: CMSField[]
  templatePage: string
}

export interface CMSField {
  name: string
  type: 'text' | 'image' | 'date' | 'formattedText' | 'boolean' | 'number'
}

export interface QAResult {
  overall: 'pass' | 'fail'
  categories: {
    spacing: QACategory
    border: QACategory
    typography: QACategory
    color: QACategory
    shadow: QACategory
    animation: QACategory
    accessibility: QACategory
    structure: QACategory
    breakpoints: QACategory
  }
  failures: string[]
  action: string
}

export interface QACategory {
  pass: boolean
  notes: string
}

export interface BuildLog {
  id: string
  project_id: string
  step: string
  status: BuildStepStatus
  error: string | null
  created_at: string
}

export interface MCPInstruction {
  step: number
  description: string
  tool: string
  params: Record<string, unknown>
  fallback: 'skip_and_log' | 'abort'
}

export interface ApiError {
  error: string
  code: string
}
