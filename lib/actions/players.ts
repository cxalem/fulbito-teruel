'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SoccerPosition } from '@/lib/supabase/types'
import type { ActionResult } from './matches'

export interface CreatePlayerData {
  display_name: string
  image_url?: string | null
  preferred_position?: SoccerPosition | null
}

/**
 * Get all players
 */
export async function getPlayers(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('display_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching players:', error)
      return {
        success: false,
        error: `Error al obtener jugadores: ${error.message}`
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
      error: 'Error inesperado al obtener jugadores'
    }
  }
}

/**
 * Get a single player by ID
 */
export async function getPlayer(playerId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single()
    
    if (error) {
      console.error('Error fetching player:', error)
      return {
        success: false,
        error: `Error al obtener jugador: ${error.message}`
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
      error: 'Error inesperado al obtener jugador'
    }
  }
}

/**
 * Create or update a player (upsert by display_name)
 */
export async function createOrUpdatePlayer(playerData: CreatePlayerData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Use upsert to handle duplicate display_name
    const { data, error } = await supabase
      .from('players')
      .upsert(playerData, { 
        onConflict: 'display_name',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) {
      console.error('Player creation/update error:', error)
      return {
        success: false,
        error: `Error al crear/actualizar jugador: ${error.message}`
      }
    }
    
    revalidatePath('/players')
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al crear/actualizar jugador'
    }
  }
}

/**
 * Update an existing player
 */
export async function updatePlayer(playerId: string, updates: Partial<CreatePlayerData>): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single()
    
    if (error) {
      console.error('Player update error:', error)
      return {
        success: false,
        error: `Error al actualizar jugador: ${error.message}`
      }
    }
    
    revalidatePath('/players')
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: 'Error inesperado al actualizar jugador'
    }
  }
}

/**
 * Search players by display name
 */
export async function searchPlayers(query: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .ilike('display_name', `%${query}%`)
      .order('display_name', { ascending: true })
      .limit(10)
    
    if (error) {
      console.error('Error searching players:', error)
      return {
        success: false,
        error: `Error al buscar jugadores: ${error.message}`
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
      error: 'Error inesperado al buscar jugadores'
    }
  }
}
