import { createServiceClient } from '@/lib/supabase/server'
import type { FieldConfig } from '@/lib/site-field-schema'
import { mergeFieldSchema, normalizeSectorsFromDb } from '@/lib/site-field-schema'

/** 
 * Fetches site configuration (field schema and sectors) for a specific product.
 * Used primarily by the admin dashboard for dynamic form generation.
 * 
 * @param productSlug - The product to fetch config for (e.g., 'grants', 'school')
 */
export async function getProgramFormSiteConfig(productSlug: string = 'grants') {
  const supabase = createServiceClient()
  const { data: rows } = await supabase
    .from('site_config')
    .select('field_schema, sectors')
    .eq('product_slug', productSlug)
    .limit(1)
  
  const row = rows?.[0]
  const fieldSchema = mergeFieldSchema((row?.field_schema as Record<string, FieldConfig>) ?? {})
  const sectors = normalizeSectorsFromDb(row?.sectors)
  return { fieldSchema, sectors }
}
