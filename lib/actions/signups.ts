'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SoccerPosition, Team } from '@/lib/supabase/types'
import type { ActionResult } from './matches'

export interface CreateSignupData {
  match_id: string
  player_id?: string
  player_name?: string  // For creating new players
  team: Team
  position?: SoccerPosition | null
  display_name_snapshot?: string
}

/**
 * Get team lineup using the RPC function
 */
export async function getTeamLineup(matchId: string, team: Team): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .rpc('get_team_lineup', { 
        _match_id: matchId, 
        _team: team 
      })
    
    if (error) {
      console.error('Error fetching team lineup:', error)
      return {
        success: false,
        error: `Error al obtener alineación: ${error.message}`
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
      error: 'Error inesperado al obtener alineación'
    }
  }
}

/**
 * Get all signups for a match
 */
export async function getMatchSignups(matchId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('signups')
      .select(`
        *,
        players:player_id (
          id,
          display_name,
          image_url,
          preferred_position
        )
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching match signups:', error)
      return {
        success: false,
        error: `Error al obtener inscripciones: ${error.message}`
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
      error: 'Error inesperado al obtener inscripciones'
    }
  }
}

/**
 * Create a new signup
 */
export async function createSignup(signupData: CreateSignupData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    let playerId = signupData.player_id
    let displayNameSnapshot = signupData.display_name_snapshot
    
    // If player_name is provided, create or find the player first
    if (signupData.player_name && !playerId) {
      // Try to find existing player first
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id, display_name')
        .eq('display_name', signupData.player_name)
        .single()
      
      if (existingPlayer) {
        playerId = existingPlayer.id
        displayNameSnapshot = existingPlayer.display_name
      } else {
        // Create new player
        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert({ display_name: signupData.player_name })
          .select('id, display_name')
          .single()
        
        if (playerError) {
          console.error('Player creation error:', playerError)
          return {
            success: false,
            error: `Error al crear jugador: ${playerError.message}`
          }
        }
        
        playerId = newPlayer.id
        displayNameSnapshot = newPlayer.display_name
      }
    }
    
    if (!playerId) {
      return {
        success: false,
        error: 'Se requiere un jugador válido'
      }
    }
    
    // Check if player is already signed up for this match
    const { data: existing } = await supabase
      .from('signups')
      .select('match_id, player_id, team')
      .eq('match_id', signupData.match_id)
      .eq('player_id', playerId)
      .single()
    
    if (existing) {
      return {
        success: false,
        error: 'El jugador ya está inscrito en este partido'
      }
    }
    
    // Create the signup
    const signupPayload = {
      match_id: signupData.match_id,
      player_id: playerId,
      team: signupData.team,
      position: signupData.position,
      display_name_snapshot: displayNameSnapshot
    }
    
    const { data, error } = await supabase
      .from('signups')
      .insert(signupPayload)
      .select(`
        *,
        players:player_id (
          id,
          display_name,
          image_url,
          preferred_position
        )
      `)
      .single()
    
    if (error) {
      console.error('Signup creation error:', error)
      return {
        success: false,
        error: `Error al inscribirse: ${error.message}`
      }
    }
    
    revalidatePath(`/matches/${signupData.match_id}`)
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al inscribirse'
    }
  }
}

/**
 * Update an existing signup
 */
export async function updateSignup(
  matchId: string, 
  playerId: string, 
  updates: Partial<Pick<CreateSignupData, 'team' | 'position'>>
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('signups')
      .update(updates)
      .eq('match_id', matchId)
      .eq('player_id', playerId)
      .select(`
        *,
        players:player_id (
          id,
          display_name,
          image_url,
          preferred_position
        )
      `)
      .single()
    
    if (error) {
      console.error('Signup update error:', error)
      return {
        success: false,
        error: `Error al actualizar inscripción: ${error.message}`
      }
    }
    
    revalidatePath(`/matches/${matchId}`)
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al actualizar inscripción'
    }
  }
}

/**
 * Delete a signup
 */
export async function deleteSignup(matchId: string, playerId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('signups')
      .delete()
      .eq('match_id', matchId)
      .eq('player_id', playerId)
    
    if (error) {
      console.error('Signup deletion error:', error)
      return {
        success: false,
        error: `Error al cancelar inscripción: ${error.message}`
      }
    }
    
    revalidatePath(`/matches/${matchId}`)
    
    return {
      success: true
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al cancelar inscripción'
    }
  }
}

/**
 * Upsert signup (create or update if exists)
 */
export async function upsertSignup(signupData: CreateSignupData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('signups')
      .upsert(signupData, {
        onConflict: 'match_id, player_id',
        ignoreDuplicates: false
      })
      .select(`
        *,
        players:player_id (
          id,
          display_name,
          image_url,
          preferred_position
        )
      `)
      .single()
    
    if (error) {
      console.error('Signup upsert error:', error)
      return {
        success: false,
        error: `Error al procesar inscripción: ${error.message}`
      }
    }
    
    revalidatePath(`/matches/${signupData.match_id}`)
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al procesar inscripción'
    }
  }
}
