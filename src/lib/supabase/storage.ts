import { createClient } from './client'

/** Upload a file to the 'avatars' bucket */
export async function uploadAvatar(userId: string, file: File) {
  const supabase = createClient()

  // 1. Define path: userId/avatar.png (or original ext)
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

  // 2. Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  // 3. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return publicUrl
}
