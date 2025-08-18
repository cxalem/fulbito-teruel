import { createClient } from '@/lib/supabase/client'
import { setStoredAvatarUrl } from './localStorage'

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient()
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'El archivo debe ser una imagen' }
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'La imagen debe ser menor a 5MB' }
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `avatars/${fileName}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: `Error al subir imagen: ${error.message}` }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path)
    
    // Store in localStorage for anonymous users
    setStoredAvatarUrl(publicUrl)
    
    return { success: true, url: publicUrl }
    
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return { success: false, error: 'Error inesperado al subir imagen' }
  }
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath])
    
    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: `Error al eliminar imagen: ${error.message}` }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Unexpected delete error:', error)
    return { success: false, error: 'Error inesperado al eliminar imagen' }
  }
}
