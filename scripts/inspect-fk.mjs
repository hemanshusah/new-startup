import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key))?.split('=')[1]?.replace(/"/g, '')

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY')
)

async function inspectForeignKeys() {
  console.log('Inspecting foreign keys for table: sessions...')
  
  // Query information_schema
  const { data, error } = await supabase.rpc('inspect_table_fk', { t_name: 'sessions' })
  
  if (error) {
    console.log('RPC failed, trying raw query via query builder (might fail)...')
    // Fallback: Try to list all tables and columns
    const { data: cols, error: cError } = await supabase.from('sessions').select('*').limit(1)
    console.log('Sessions columns:', Object.keys(cols?.[0] || {}))
    
    const { data: pCols, error: pError } = await supabase.from('profiles').select('*').limit(1)
    console.log('Profiles columns:', Object.keys(pCols?.[0] || {}))
  } else {
    console.log('Foreign Keys found:', data)
  }
}

inspectForeignKeys()
