import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPending() {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, mentor_id, status, scheduled_start, founder_brief')
  
  if (error) {
    console.error(error)
    return
  }

  console.log('Total Sessions:', sessions.length)
  sessions.forEach(s => {
    console.log(`- ID: ${s.id}, Status: ${s.status}, Start: ${s.scheduled_start}, Brief: ${s.founder_brief?.substring(0, 20)}...`)
  })
}

checkPending()
