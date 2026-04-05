import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Load field schema config and sectors from site_config
  const { data: configs } = await supabase
    .from('site_config')
    .select('key, value')
    .in('key', ['field_schema', 'sectors'])

  const configMap: Record<string, string> = {}
  for (const c of configs ?? []) configMap[c.key] = c.value

  const fieldConfig = configMap['field_schema']
    ? JSON.parse(configMap['field_schema'])
    : {}

  const sectors = configMap['sectors']
    ? JSON.parse(configMap['sectors'])
    : [
        'AgriTech', 'AI / ML', 'CleanTech', 'Climate Tech', 'Deep Tech', 'EdTech',
        'Fintech', 'HealthTech', 'HRTech', 'IoT', 'LegalTech', 'Logistics', 'Manufacturing',
        'Media & Entertainment', 'MedTech', 'PropTech', 'RetailTech', 'SaaS', 'SpaceTech',
        'Sustainability', 'WaterTech', 'Women-led',
      ]

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          Manage field schema, sector tags, and cache controls.
        </p>
      </div>
      <SettingsForm initialFieldConfig={fieldConfig} initialSectors={sectors} />
    </div>
  )
}
