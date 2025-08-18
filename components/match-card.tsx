'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Clock, Euro } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type Match = Database['public']['Tables']['matches']['Row']

interface MatchCardProps {
  match: Match
  isAdmin?: boolean
}

export function MatchCard({ match, isAdmin = false }: MatchCardProps) {
  const startDate = new Date(match.starts_at)
  const endDate = new Date(match.ends_at)
  
  // Calculate duration in hours
  const durationMs = endDate.getTime() - startDate.getTime()
  const durationHours = Math.round(durationMs / (1000 * 60 * 60))
  
  // Check if match is private and user is not admin
  const isPrivateForUser = match.is_private && !isAdmin
  
  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-zinc-200 dark:border-zinc-800 cursor-pointer">
      <Link href={`/matches/${match.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={match.match_type === 'friendly' ? 'secondary' : 'default'}
                  className="text-xs"
                >
                  {match.match_type === 'friendly' ? 'Amistoso' : 'Competitivo'}
                </Badge>
                {match.is_private && (
                  <Badge variant="outline" className="text-xs">
                    Privado
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(startDate, "EEEE, d 'de' MMMM", { locale: es })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  <span className="ml-1 text-xs">
                    ({durationHours}h)
                  </span>
                </span>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{match.capacity} jugadores</span>
              </div>
              
              {match.total_cost && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Euro className="h-4 w-4" />
                  <span>{match.total_cost}€</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {isPrivateForUser ? 'Ubicación privada' : match.location}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="cursor-pointer group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
            >
              Ver detalles
            </Button>
          </div>
          
          {/* Progress bar for capacity */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Inscripciones</span>
              <span>0/{match.capacity}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: '0%' }}
              />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
