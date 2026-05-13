import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Mentor Connect layout.
 * Checks the site_config toggle.
 * When mentor_connect_enabled = false, redirects all public routes to /.
 * Admin can still access /admin/mentor-connect/* at all times (handled separately).
 */
export default async function MentorConnectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServiceClient()

  const { data: settings } = await supabase
    .from('site_config')
    .select('mentor_connect_enabled')
    .limit(1)
    .maybeSingle()

  // If toggle is off, bounce all public visitors to home
  if (!settings?.mentor_connect_enabled) {
    redirect('/?coming_soon=mentor-connect')
  }

  return <>{children}</>
}
