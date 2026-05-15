import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createServiceClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/ProfileView'
import { getProgramFormSiteConfig } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getAuthenticatedUser()

  if (!user?.email) {
    redirect('/?redirect=/profile')
  }

  const supabase = createServiceClient()

  // 1. Fetch sectors and field schema
  const { sectors: sectorOptions } = await getProgramFormSiteConfig('grants')

  // 2. Fetch Profile (Full) by email to bridge from Supabase Auth
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!profile) {
    redirect('/')
  }
  
  // Redirect mentors to their own dashboard
  if (profile.account_intent === 'mentor') {
    redirect('/mentor/availability')
  }

  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <ProfileView
        profile={profile}
        userImage={user.image}
        sectorOptions={sectorOptions}
      />
    </Suspense>
  )
}
