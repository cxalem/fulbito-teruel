/**
 * localStorage utilities for anonymous user persistence
 */

const STORAGE_KEYS = {
  DISPLAY_NAME: 'fulbito_display_name',
  AVATAR_URL: 'fulbito_avatar_url'
} as const

/**
 * Get stored display name for anonymous users
 */
export function getStoredDisplayName(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem(STORAGE_KEYS.DISPLAY_NAME)
  } catch (error) {
    console.warn('Failed to get stored display name:', error)
    return null
  }
}

/**
 * Store display name for anonymous users
 */
export function setStoredDisplayName(displayName: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.DISPLAY_NAME, displayName)
  } catch (error) {
    console.warn('Failed to store display name:', error)
  }
}

/**
 * Get stored avatar URL for anonymous users
 */
export function getStoredAvatarUrl(): string | null {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem(STORAGE_KEYS.AVATAR_URL)
  } catch (error) {
    console.warn('Failed to get stored avatar URL:', error)
    return null
  }
}

/**
 * Store avatar URL for anonymous users
 */
export function setStoredAvatarUrl(avatarUrl: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.AVATAR_URL, avatarUrl)
  } catch (error) {
    console.warn('Failed to store avatar URL:', error)
  }
}

/**
 * Clear all stored anonymous user data
 */
export function clearStoredUserData(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEYS.DISPLAY_NAME)
    localStorage.removeItem(STORAGE_KEYS.AVATAR_URL)
  } catch (error) {
    console.warn('Failed to clear stored user data:', error)
  }
}
