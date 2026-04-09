import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/AdminShell'

/**
 * Admin layout — wraps all /admin/* pages with AdminShell.
 * Double-checks admin role server-side (middleware already checked, but
 * belt-and-braces per CONTEXT.md §9).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()

  if (!user?.email) redirect('/')

  const supabase = createServiceClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('email', user.email)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <AdminShell adminEmail={profile?.email ?? user.email} role={profile?.role}>
      {children}
    </AdminShell>
  )
}
