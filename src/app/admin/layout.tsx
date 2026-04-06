import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <AdminShell adminEmail={profile?.email ?? user.email} role={profile?.role}>
      {children}
    </AdminShell>
  )
}
