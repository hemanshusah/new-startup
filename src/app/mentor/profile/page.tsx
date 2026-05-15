import { getAuthenticatedUser } from '@/lib/auth-utils'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvatarUpload } from '@/components/mentor/AvatarUpload'

export default async function MentorProfilePage() {
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  const supabase = createServiceClient()
  const { data: mentor } = await supabase
    .from('mentor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!mentor) redirect('/mentor-connect/apply')

  const isApproved = mentor.status === 'active'

  const InfoGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ 
        display: 'block', 
        fontFamily: 'var(--font-sans)', 
        fontSize: '12px', 
        fontWeight: 600, 
        color: 'var(--ink-4)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.05em',
        marginBottom: '8px'
      }}>
        {label}
      </label>
      <div style={{ 
        fontFamily: 'var(--font-sans)', 
        fontSize: '15px', 
        color: 'var(--ink)', 
        lineHeight: 1.5 
      }}>
        {children || <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>Not provided</span>}
      </div>
    </div>
  )

  const TagList = ({ tags }: { tags: string[] }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {tags.map((tag, i) => (
        <span key={i} style={{ 
          background: 'var(--cream)', 
          border: '1px solid var(--cream-border)', 
          padding: '4px 10px', 
          borderRadius: '6px', 
          fontSize: '13px', 
          color: 'var(--ink-2)' 
        }}>
          {tag}
        </span>
      ))}
    </div>
  )

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header Info */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <AvatarUpload currentUrl={mentor.avatar_url} displayName={mentor.display_name} />
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--ink)', margin: '0 0 8px' }}>
                Application Details
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-3)', margin: 0 }}>
                Manage your profile picture and view your credentials.
              </p>
            </div>
          </div>
          
          {isApproved ? (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🔒</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#166534' }}>Profile Locked</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#15803d' }}>Contact admin to update</p>
              </div>
            </div>
          ) : (
            <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📋</span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#92400E' }}>Under Review</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#B45309' }}>Profile is read-only</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--cream-border)', paddingTop: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div>
              <InfoGroup label="Display Name">{mentor.display_name}</InfoGroup>
              <InfoGroup label="Headline">{mentor.headline}</InfoGroup>
              <InfoGroup label="Location">{mentor.location_city}, {mentor.location_country}</InfoGroup>
              <InfoGroup label="Years of Experience">{mentor.years_experience} Years</InfoGroup>
            </div>
            <div>
              <InfoGroup label="LinkedIn Profile">
                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077B5', textDecoration: 'none', fontWeight: 500 }}>
                  View LinkedIn ↗
                </a>
              </InfoGroup>
              <InfoGroup label="Twitter / X">
                {mentor.twitter_url ? (
                  <a href={mentor.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                    View Profile ↗
                  </a>
                ) : 'Not provided'}
              </InfoGroup>
              <InfoGroup label="Website">
                {mentor.website_url ? (
                  <a href={mentor.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                    {mentor.website_url.replace(/^https?:\/\//, '')} ↗
                  </a>
                ) : 'Not provided'}
              </InfoGroup>
              <InfoGroup label="Languages">
                <div style={{ display: 'flex', gap: '6px' }}>
                  {mentor.languages.join(', ')}
                </div>
              </InfoGroup>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        {/* Left Column: Bio & Video */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px' }}>
          <InfoGroup label="Professional Bio">
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--ink-2)' }}>{mentor.bio}</div>
          </InfoGroup>
          
          {mentor.intro_video_url && (
            <InfoGroup label="Intro Video">
              <a href={mentor.intro_video_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
                {mentor.intro_video_url}
              </a>
            </InfoGroup>
          )}

          <InfoGroup label="Notable Companies">
            <TagList tags={mentor.notable_companies || []} />
          </InfoGroup>
        </div>

        {/* Right Column: Expertise */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--cream-border)', borderRadius: '16px', padding: '32px' }}>
          <InfoGroup label="Expertise Areas">
            <TagList tags={mentor.expertise_areas} />
          </InfoGroup>
          
          <InfoGroup label="Industries">
            <TagList tags={mentor.industries} />
          </InfoGroup>

          <InfoGroup label="Markets Covered">
            <TagList tags={mentor.markets_covered} />
          </InfoGroup>

          <div style={{ marginTop: '40px', padding: '20px', background: 'var(--cream)', borderRadius: '12px', border: '1px solid var(--cream-border)' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Need to update these details? Our quality team manages profile changes to maintain platform integrity. Please email support@grantsindia.in with the subject "Profile Update".
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
