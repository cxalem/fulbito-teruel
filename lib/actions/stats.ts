'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAppStats() {
  try {
    const supabase = await createClient()
    
    // Get upcoming matches count
    const { count: matchCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('starts_at', new Date().toISOString())
    
    // Get total signups count (active players)
    const { count: playerCount } = await supabase
      .from('signups')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    
    return {
      success: true,
      data: {
        matchCount: matchCount || 0,
        playerCount: playerCount || 0
      }
    }
  } catch (error) {
    console.error('Error fetching app stats:', error)
    return {
      success: false,
      error: 'Failed to fetch app stats',
      data: null
    }
  }
}
