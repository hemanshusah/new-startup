import { notFound, redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminReviewMentorPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!mentor) notFound()

  async function updateStatus(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as string
    const tier = formData.get('verification_tier') as string
    const isFeatured = formData.get('is_featured') === 'true'
    
    const supabase = createServiceClient()
    const { error } = await supabase
      .from('mentor_profiles')
      .update({ 
        status: newStatus,
        verification_tier: tier,
        is_featured: isFeatured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating mentor status:', error)
      return
    }

    revalidatePath('/admin/mentor-connect/mentors')
    redirect('/admin/mentor-connect/mentors')
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <a href="/admin/mentor-connect/mentors" style={{ fontSize: '13px', color: 'var(--ink-4)', textDecoration: 'none' }}>
          ← Back to Mentors
        </a>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '16px 0 8px' }}>
          Review Application: {mentor.display_name}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--ink-3)' }}>
          Applied on {new Date(mentor.created_at).toLocaleDateString()}
        </p>
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '32px', borderBottom: '1px solid var(--cream-border)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '32px' }}>
            {mentor.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mentor.avatar_url} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{mentor.display_name}</p>
              <p style={{ color: 'var(--ink-3)', margin: '0 0 8px' }}>{mentor.headline}</p>
              <a href={mentor.linkedin_url} target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px' }}>LinkedIn Profile ↗</a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Location</p>
              <p>{mentor.location_city}, {mentor.location_country}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Experience</p>
              <p>{mentor.years_experience} years</p>
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Bio</p>
            <p style={{ lineHeight: 1.6, color: 'var(--ink-3)' }}>{mentor.bio}</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Expertise & Industries</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {mentor.expertise_areas?.map((a: string) => <span key={a} style={{ padding: '4px 10px', background: 'var(--cream)', borderRadius: '4px', fontSize: '12px' }}>{a}</span>)}
              {mentor.industries?.map((i: string) => <span key={i} style={{ padding: '4px 10px', background: '#F0F9FF', color: '#0369A1', borderRadius: '4px', fontSize: '12px' }}>{i}</span>)}
            </div>
          </div>

          {mentor.intro_video_url && (
            <div>
              <p style={{ fontSize: '12px', color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: '8px' }}>Intro Video</p>
              <a href={mentor.intro_video_url} target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{mentor.intro_video_url}</a>
            </div>
          )}
        </div>

        <form action={updateStatus} style={{ padding: '32px', background: 'var(--cream)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Decision</h3>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--ink-4)', marginBottom: '8px' }}>Profile Status</label>
              <select name="status" defaultValue={mentor.status} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--white)', width: '200px' }}>
                <option value="pending">Pending Review</option>
                <option value="active">Active (Visible)</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--ink-4)', marginBottom: '8px' }}>Verification Tier</label>
              <select name="verification_tier" defaultValue={mentor.verification_tier} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--white)', width: '200px' }}>
                <option value="community">Community (Unverified)</option>
                <option value="verified">Verified</option>
                <option value="credential_verified">Credential Verified</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--ink-4)', marginBottom: '8px' }}>Featured Operator</label>
              <select name="is_featured" defaultValue={mentor.is_featured ? 'true' : 'false'} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--cream-border)', background: 'var(--white)', width: '200px' }}>
                <option value="false">Standard Operator</option>
                <option value="true">★ Featured on Landing</option>
              </select>
            </div>
          </div>

          <button type="submit" style={{ padding: '12px 32px', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  )
}
