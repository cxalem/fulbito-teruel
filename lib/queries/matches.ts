'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { 
  createMatchWithRenter, 
  updateMatch, 
  deleteMatch,
  type CreateMatchData 
} from '@/lib/actions/matches'
import { toast } from 'sonner'

// Query Keys
export const matchKeys = {
  all: ['matches'] as const,
  upcoming: () => [...matchKeys.all, 'upcoming'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
}

/**
 * Hook to fetch upcoming matches
 */
export function useUpcomingMatches() {
  return useQuery({
    queryKey: matchKeys.upcoming(),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(20)
      
      if (error) throw new Error(`Error al obtener partidos: ${error.message}`)
      return data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch a single match
 */
export function useMatch(matchId: string, options?: { initialData?: unknown }) {
  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      
      if (error) throw new Error(`Error al obtener partido: ${error.message}`)
      return data
    },
    enabled: !!matchId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    initialData: options?.initialData,
  })
}

/**
 * Hook to create a match
 */
export function useCreateMatch() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (matchData: CreateMatchData) => {
      const result = await createMatchWithRenter(matchData)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch matches
      queryClient.invalidateQueries({ queryKey: matchKeys.all })
      toast.success('¡Partido creado con éxito!')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear partido')
    },
  })
}

/**
 * Hook to update a match
 */
export function useUpdateMatch() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ matchId, updates }: { matchId: string, updates: Partial<CreateMatchData> }) => {
      const result = await updateMatch(matchId, updates)
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate specific match and all matches
      if (data && typeof data === 'object' && 'id' in data) {
        queryClient.invalidateQueries({ queryKey: matchKeys.detail((data as { id: string }).id) })
      }
      queryClient.invalidateQueries({ queryKey: matchKeys.upcoming() })
      toast.success('Partido actualizado con éxito')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar partido')
    },
  })
}

/**
 * Hook to delete a match
 */
export function useDeleteMatch() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (matchId: string) => {
      const result = await deleteMatch(matchId)
      if (!result.success) throw new Error(result.error)
      return matchId
    },
    onSuccess: (matchId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: matchKeys.detail(matchId) })
      queryClient.invalidateQueries({ queryKey: matchKeys.upcoming() })
      toast.success('Partido eliminado con éxito')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar partido')
    },
  })
}
