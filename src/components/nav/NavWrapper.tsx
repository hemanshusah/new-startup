import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { NavbarClient } from '@/components/nav/NavbarClient'

/**
 * Server component — fetches the mentor_connect_enabled toggle
 * and passes it to the client Navbar so it can show/hide the nav item.
 */
export async function NavWrapper() {
  const supabase = createServiceClient()
  const { data: settings } = await supabase
    .from('site_config')
    .select('mentor_connect_enabled')
    .limit(1)
    .maybeSingle()

  return <NavbarClient mentorConnectEnabled={settings?.mentor_connect_enabled ?? false} />
}
