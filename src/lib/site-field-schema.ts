/** Shared between Settings and Program form — keys must match `programs` columns / form state. */

export type FieldConfig = 'required' | 'optional' | 'hidden'

export const SECTOR_DEFAULTS = [
  'AgriTech', 'AI / ML', 'CleanTech', 'Climate Tech', 'Deep Tech', 'EdTech',
  'Fintech', 'HealthTech', 'HRTech', 'IoT', 'LegalTech', 'Logistics', 'Manufacturing',
  'Media & Entertainment', 'MedTech', 'PropTech', 'RetailTech', 'SaaS', 'SpaceTech',
  'Sustainability', 'WaterTech', 'Women-led',
]

export const PROGRAM_FORM_FIELDS = [
  { key: 'description_short', label: 'Short description' },
  { key: 'about', label: 'About the program' },
  { key: 'what_you_get', label: 'What you get' },
  { key: 'eligibility', label: 'Eligibility criteria' },
  { key: 'how_to_apply', label: 'How to apply' },
  { key: 'mode', label: 'Mode' },
  { key: 'stage', label: 'Stage' },
  { key: 'duration', label: 'Duration' },
  { key: 'cohort_size', label: 'Cohort size' },
  { key: 'equity', label: 'Equity' },
  { key: 'amount_min', label: 'Amount (min)' },
  { key: 'amount_max', label: 'Amount (max)' },
  { key: 'amount_display', label: 'Amount display string' },
  { key: 'state', label: 'Indian state' },
  { key: 'sectors', label: 'Focus sectors' },
  { key: 'apply_url', label: 'Apply URL' },
  { key: 'is_featured', label: 'Is featured' },
] as const

export type ProgramFormFieldKey = (typeof PROGRAM_FORM_FIELDS)[number]['key']

export function mergeFieldSchema(raw: Record<string, FieldConfig>): Record<string, FieldConfig> {
  const out: Record<string, FieldConfig> = {}
  for (const f of PROGRAM_FORM_FIELDS) {
    const v = raw[f.key]
    out[f.key] = v === 'required' || v === 'optional' || v === 'hidden' ? v : 'optional'
  }
  return out
}

export function normalizeSectorsFromDb(raw: unknown): string[] {
  let arr: string[] = []
  if (Array.isArray(raw)) arr = raw as string[]
  else if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw) as string[]
    } catch {
      arr = []
    }
  }
  if (!arr.length) return [...SECTOR_DEFAULTS]
  return arr
}
