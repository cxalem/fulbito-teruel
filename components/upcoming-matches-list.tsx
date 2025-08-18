'use client'

import { useUpcomingMatches } from '@/lib/queries'
import { MatchCard } from '@/components/match-card'
import { MatchesSkeleton } from '@/components/matches-skeleton'
import { NoMatchesEmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface UpcomingMatchesListProps {
  user: User | null
  isAdmin: boolean
}

export function UpcomingMatchesList({ isAdmin }: UpcomingMatchesListProps) {
  // React Query hook for matches
  const { 
    data: matches, 
    isLoading: matchesLoading, 
    error: matchesError,
    refetch: refetchMatches 
  } = useUpcomingMatches()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Próximos Partidos ⚽
          </h1>
          <p className="text-muted-foreground">
            Encuentra y únete a partidos de fútbol en Teruel
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchMatches()}
            disabled={matchesLoading}
            className="cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${matchesLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          {isAdmin && (
            <Button asChild className="cursor-pointer">
              <Link href="/matches/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Partido
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Matches List */}
      <div>
        {matchesLoading ? (
          <MatchesSkeleton />
        ) : matchesError ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Error al cargar los partidos: {matchesError.message}
            </p>
            <Button 
              variant="outline" 
              onClick={() => refetchMatches()}
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : matches && matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <NoMatchesEmptyState isAdmin={isAdmin} />
        )}
      </div>
    </div>
  )
}
