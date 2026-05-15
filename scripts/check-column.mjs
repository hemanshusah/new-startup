import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key))?.split('=')[1]?.replace(/"/g, '')

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY')
)

async function checkSchema() {
  console.log('Checking site_config columns...')
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'site_config' })
  
  if (error) {
    // If RPC doesn't exist, try a simple select
    console.log('RPC get_table_columns not found, trying select...')
    const { data: row, error: sError } = await supabase.from('site_config').select('*').limit(1).maybeSingle()
    if (sError) {
      console.error('Select error:', sError)
    } else {
      console.log('Columns found in site_config row:', Object.keys(row || {}))
    }
  } else {
    console.log('Columns list:', data)
  }
}

checkSchema()
