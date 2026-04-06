import { createClient } from './supabase/client'

export async function uploadReferenceImage(
  file: File,
  projectId: string
): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'png'
  const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from('reference-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('reference-images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
