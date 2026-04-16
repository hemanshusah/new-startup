import { createServiceClient } from '@/lib/supabase/server'
import { SettingsForm, type FieldConfig } from '@/components/admin/SettingsForm'
import { SECTOR_DEFAULTS, normalizeSectorsFromDb } from '@/lib/site-field-schema'

async function loadOrCreateSiteConfigRow() {
  const supabase = createServiceClient()
  const { data: rows } = await supabase
    .from('site_config')
    .select('id, field_schema, sectors')
    .limit(1)

  const row = rows?.[0]
  if (row) return row

  // Create default if missing
  const { data: inserted } = await supabase
    .from('site_config')
    .insert({
      site_name: 'GrantsIndia',
      programs_per_page: 12,
      si_slot_positions: [6, 14, 20],
      maintenance_mode: false,
      field_schema: {},
      sectors: SECTOR_DEFAULTS,
    })
    .select('id, field_schema, sectors')
    .maybeSingle()

  return inserted ?? null
}

export default async function AdminSettingsPage() {
  const row = await loadOrCreateSiteConfigRow()

  const fieldConfig = (row?.field_schema as Record<string, FieldConfig> | null) ?? {}
  const sectors = normalizeSectorsFromDb(row?.sectors)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '4px' }}>Settings</h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'var(--ink-3)' }}>
          Manage field schema, sector tags, and cache controls.
        </p>
      </div>
      <SettingsForm
        settingsRowId={row?.id ?? null}
        initialFieldConfig={fieldConfig}
        initialSectors={sectors}
      />
    </div>
  )
}
