import { createClient } from '@/lib/supabase/server'
import type { FieldConfig } from '@/lib/site-field-schema'
import { mergeFieldSchema, normalizeSectorsFromDb } from '@/lib/site-field-schema'

/** site_config rows used by admin program create/edit */
export async function getProgramFormSiteConfig() {
  const supabase = await createClient()
  const { data: rows } = await supabase.from('site_config').select('field_schema, sectors').limit(1)
  const row = rows?.[0]
  const fieldSchema = mergeFieldSchema((row?.field_schema as Record<string, FieldConfig>) ?? {})
  const sectors = normalizeSectorsFromDb(row?.sectors)
  return { fieldSchema, sectors }
}
