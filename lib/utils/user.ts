import type { User } from '@supabase/supabase-js'

/**
 * Get user avatar URL from various possible fields
 */
export function getUserAvatar(user: User | null): string | undefined {
  if (!user?.user_metadata) return undefined
  
  return user.user_metadata.avatar_url ||
         user.user_metadata.picture ||
         user.user_metadata.photo_url ||
         user.user_metadata.image_url ||
         user.user_metadata.profile_picture ||
         undefined
}

/**
 * Get user display name from various possible fields
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Usuario'
  
  return user.user_metadata?.full_name ||
         user.user_metadata?.name ||
         user.user_metadata?.display_name ||
         user.email?.split('@')[0] ||
         'Usuario'
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(user: User | null): string {
  if (!user) return 'U'
  
  const name = getUserDisplayName(user)
  
  // If it's an email, use the first letter of the email
  if (name.includes('@')) {
    return name.charAt(0).toUpperCase()
  }
  
  // Split by spaces and take first letter of each word
  const words = name.split(' ').filter(word => word.length > 0)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  
  // Single word, take first two characters
  return name.slice(0, 2).toUpperCase()
}
