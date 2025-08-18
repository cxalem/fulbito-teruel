'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { 
  createOrUpdatePlayer, 
  updatePlayer,
  type CreatePlayerData 
} from '@/lib/actions/players'
import { toast } from 'sonner'

// Query Keys
export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (filters: string) => [...playerKeys.lists(), { filters }] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (id: string) => [...playerKeys.details(), id] as const,
  search: (query: string) => [...playerKeys.all, 'search', query] as const,
}

/**
 * Hook to fetch all players
 */
export function usePlayers() {
  return useQuery({
    queryKey: playerKeys.lists(),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('display_name', { ascending: true })
      
      if (error) throw new Error(`Error al obtener jugadores: ${error.message}`)
      return data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to fetch a single player
 */
export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: playerKeys.detail(playerId),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()
      
      if (error) throw new Error(`Error al obtener jugador: ${error.message}`)
      return data
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to search players by name
 */
export function useSearchPlayers(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: playerKeys.search(query),
    queryFn: async () => {
      if (!query.trim()) return []
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .order('display_name', { ascending: true })
        .limit(10)
      
      if (error) throw new Error(`Error al buscar jugadores: ${error.message}`)
      return data
    },
    enabled: (options?.enabled ?? true) && !!query.trim(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to create or update a player
 */
export function useCreateOrUpdatePlayer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (playerData: CreatePlayerData) => {
      const result = await createOrUpdatePlayer(playerData)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate player lists and update specific player cache
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
      if (data && typeof data === 'object' && 'id' in data) {
        queryClient.setQueryData(playerKeys.detail((data as { id: string }).id), data)
      }
      
      toast.success('Jugador guardado con éxito')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al guardar jugador')
    },
  })
}

/**
 * Hook to update an existing player
 */
export function useUpdatePlayer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ playerId, updates }: { playerId: string, updates: Partial<CreatePlayerData> }) => {
      const result = await updatePlayer(playerId, updates)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      // Update specific player cache and invalidate lists
      if (data && typeof data === 'object' && 'id' in data) {
        queryClient.setQueryData(playerKeys.detail((data as { id: string }).id), data)
      }
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
      
      toast.success('Jugador actualizado con éxito')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar jugador')
    },
  })
}

/**
 * Hook to get or create a player by display name (useful for quick signup)
 */
export function useGetOrCreatePlayer() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (displayName: string) => {
      // First try to find existing player
      const supabase = createClient()
      const { data: existing } = await supabase
        .from('players')
        .select('*')
        .eq('display_name', displayName)
        .single()
      
      if (existing) {
        return existing
      }
      
      // Create new player if not found
      const result = await createOrUpdatePlayer({ display_name: displayName })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      // Update caches
      queryClient.setQueryData(playerKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al procesar jugador')
    },
  })
}
