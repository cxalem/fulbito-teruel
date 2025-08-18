'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Server action to sign out user
 */
export async function signOutAction() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    // For form actions, we can't return values, so just log and redirect anyway
  }
  
  // Redirect to home page
  redirect('/')
}
