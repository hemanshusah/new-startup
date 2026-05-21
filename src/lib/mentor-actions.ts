'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'

export async function toggleSavedMentor(mentorId: string) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'You must be logged in to save mentors.' }
  }

  const supabase = createServiceClient()

  try {
    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_mentors')
      .select('id')
      .eq('user_id', user.id)
      .eq('mentor_id', mentorId)
      .single()

    if (existing) {
      // Unsave
      const { error } = await supabase
        .from('saved_mentors')
        .delete()
        .eq('id', existing.id)
      if (error) throw error
      return { saved: false }
    } else {
      // Save
      const { error } = await supabase
        .from('saved_mentors')
        .insert({
          user_id: user.id,
          mentor_id: mentorId
        })
      if (error) throw error
      return { saved: true }
    }
  } catch (error: any) {
    console.error('Error toggling saved mentor:', error)
    return { error: error.message || 'Failed to update saved mentor.' }
  }
}

export async function submitMentorApplication(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'You must be logged in to apply as a mentor.' }
  }

  const supabase = createServiceClient()

  try {
    // Generate a unique slug from the display name
    const displayName = formData.get('display_name') as string
    const baseSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    let slug = baseSlug
    
    // Quick check if slug exists
    let counter = 1
    while (true) {
      const { data } = await supabase.from('mentor_profiles').select('id').eq('slug', slug).single()
      if (!data) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Parse array fields
    const expertiseStr = formData.get('expertise_areas') as string
    const expertiseAreas = expertiseStr ? expertiseStr.split(',').map(s => s.trim()).filter(Boolean) : []
    
    const industriesStr = formData.get('industries') as string
    const industries = industriesStr ? industriesStr.split(',').map(s => s.trim()).filter(Boolean) : []
    
    const companiesStr = formData.get('notable_companies') as string
    const notableCompanies = companiesStr ? companiesStr.split(',').map(s => s.trim()).filter(Boolean) : []

    const insertData: any = {
      user_id: user.id,
      slug,
      status: 'pending',
      display_name: displayName,
      linkedin_url: formData.get('linkedin_url'),
      twitter_url: formData.get('twitter_url') || null,
      location_city: formData.get('location_city'),
      location_country: formData.get('location_country'),
      headline: formData.get('headline'),
      bio: formData.get('bio'),
      years_experience: parseInt(formData.get('years_experience') as string, 10),
      intro_video_url: formData.get('intro_video_url') || null,
      expertise_areas: expertiseAreas,
      industries: industries,
      notable_companies: notableCompanies,
      languages: ['English'] // default for now, can add a field later
    }

    // Handle avatar upload if provided
    const avatarFile = formData.get('avatar') as File
    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        
        insertData.avatar_url = publicUrl
      }
    }

    const { error } = await supabase
      .from('mentor_profiles')
      .insert(insertData)

    if (error) {
      if (error.code === '23505') {
        return { error: 'You have already submitted an application.' }
      }
      return { error: error.message || 'Database error occurred.' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error submitting application:', error)
    return { error: error.message || 'Failed to submit application.' }
  }
}

export async function updateMentorAvatar(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { error: 'You must be logged in.' }
  }

  const supabase = createServiceClient()
  const avatarFile = formData.get('avatar') as File
  if (!avatarFile || avatarFile.size === 0) {
    return { error: 'No image provided.' }
  }

  try {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const { error: updateError } = await supabase
      .from('mentor_profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id)

    if (updateError) throw updateError

    return { success: true, avatarUrl: publicUrl }
  } catch (error: any) {
    console.error('Error updating avatar:', error)
    return { error: error.message || 'Failed to update avatar.' }
  }
}
