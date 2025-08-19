'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { MatchType, Database } from '@/lib/supabase/types'

export interface ActionResult<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

export interface CreateMatchData {
  starts_at: string
  ends_at: string
  location: string
  capacity: number
  is_private: boolean
  match_type: MatchType
  total_cost: number | null
  renter_player_id?: string | null
  renter_name?: string | null
  description?: string | null
}

/**
 * Get upcoming matches
 */
export async function getUpcomingMatches(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(20)
    
    if (error) {
      console.error('Error fetching matches:', error)
      return {
        success: false,
        error: `Error al obtener partidos: ${error.message}`
      }
    }
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al obtener partidos'
    }
  }
}

/**
 * Get a single match by ID
 */
export async function getMatch(matchId: string): Promise<ActionResult<Database['public']['Tables']['matches']['Row']>> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()
    
    if (error) {
      console.error('Error fetching match:', error)
      return {
        success: false,
        error: `Error al obtener partido: ${error.message}`
      }
    }
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al obtener partido'
    }
  }
}

/**
 * Create a new match using the RPC function
 */
export async function createMatchWithRenter(matchData: CreateMatchData): Promise<ActionResult<{ id: string; match: Database['public']['Tables']['matches']['Row'] }>> {
  try {
    const { user, isAdmin } = await getCurrentUser()
    
    if (!user) {
      return {
        success: false,
        error: 'Debes iniciar sesión para crear partidos'
      }
    }
    
    if (!isAdmin) {
      return {
        success: false,
        error: 'Solo los administradores pueden crear partidos'
      }
    }
    
    const supabase = await createClient()
    
    // Use the RPC function to create match with renter
    const { data: matchId, error } = await supabase
      .rpc('create_match_with_renter', {
        _starts_at: matchData.starts_at,
        _ends_at: matchData.ends_at,
        _location: matchData.location,
        _capacity: matchData.capacity,
        _is_private: matchData.is_private,
        _match_type: matchData.match_type,
        _total_cost: matchData.total_cost,
        _renter_player_id: matchData.renter_player_id,
        _renter_name: matchData.renter_name,
        _description: matchData.description
      })
    
    if (error) {
      console.error('Match creation error:', error)
      return {
        success: false,
        error: `Error al crear partido: ${error.message}`
      }
    }
    
    // Get the created match details
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching created match:', fetchError)
    }
    
    revalidatePath('/')
    revalidatePath('/matches')
    
    return {
      success: true,
      data: { id: matchId, match }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al crear el partido'
    }
  }
}

/**
 * Update an existing match
 */
export async function updateMatch(matchId: string, updates: Partial<CreateMatchData>): Promise<ActionResult> {
  try {
    const { user, isAdmin } = await getCurrentUser()
    
    if (!user || !isAdmin) {
      return {
        success: false,
        error: 'Solo los administradores pueden modificar partidos'
      }
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single()
    
    if (error) {
      console.error('Match update error:', error)
      return {
        success: false,
        error: `Error al actualizar partido: ${error.message}`
      }
    }
    
    revalidatePath('/')
    revalidatePath('/matches')
    revalidatePath(`/matches/${matchId}`)
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al actualizar el partido'
    }
  }
}

/**
 * Delete a match
 */
export async function deleteMatch(matchId: string): Promise<ActionResult> {
  try {
    const { user, isAdmin } = await getCurrentUser()
    
    if (!user || !isAdmin) {
      return {
        success: false,
        error: 'Solo los administradores pueden eliminar partidos'
      }
    }
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
    
    if (error) {
      console.error('Match deletion error:', error)
      return {
        success: false,
        error: `Error al eliminar partido: ${error.message}`
      }
    }
    
    revalidatePath('/')
    revalidatePath('/matches')
    
    return {
      success: true
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al eliminar el partido'
    }
  }
}

/**
 * Test function to create a simple match - tests RLS policies
 */
export async function testCreateMatch(): Promise<ActionResult> {
  const testMatch: CreateMatchData = {
    starts_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    ends_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
    location: 'Campo de Prueba',
    capacity: 16,
    is_private: false,
    match_type: 'friendly',
    total_cost: 50.00,
    renter_name: 'Usuario de Prueba'
  }
  
  return await createMatchWithRenter(testMatch)
}

/**
 * Delete test match
 */
export async function deleteTestMatch(matchId: string): Promise<ActionResult> {
  return await deleteMatch(matchId)
}
