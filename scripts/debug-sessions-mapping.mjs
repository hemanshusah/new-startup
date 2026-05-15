import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key))?.split('=')[1]?.replace(/"/g, '')

const supabase = createClient(
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY')
)

async function debugSessions() {
  // 1. Get mentor profiles
  const { data: mentors } = await supabase.from('mentor_profiles').select('id, user_id, display_name')
  console.log('Mentors found:', mentors.length)
  for (const m of mentors) {
    const { data: user } = await supabase.auth.admin.getUserById(m.user_id)
    console.log(`Mentor: ${m.display_name}, UserEmail: ${user.user?.email}, ProfileID: ${m.id}`)
    
    // 2. Get sessions for this mentor
    const { data: sessions } = await supabase.from('sessions').select('id, status, scheduled_start').eq('mentor_id', m.id)
    console.log(`   -> Sessions (${sessions.length}):`, sessions.map(s => `${s.status} (${s.scheduled_start})`).join(', '))
  }

  // 3. Find sessions with NO mentor or invalid mentor
  const { data: allSessions } = await supabase.from('sessions').select('id, mentor_id, status')
  const orphaned = allSessions.filter(s => !mentors.find(m => m.id === s.mentor_id))
  if (orphaned.length > 0) {
    console.log('Orphaned sessions found:', orphaned.length)
    orphaned.forEach(s => console.log(`   -> SessionID: ${s.id}, MentorID: ${s.mentor_id}, Status: ${s.status}`))
  }
}

debugSessions()
