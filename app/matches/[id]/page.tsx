import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getMatch } from '@/lib/actions/matches'
import { MatchDetailView } from '@/components/match-detail-view'

interface MatchPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { user, isAdmin } = await getCurrentUser()
  const { id } = await params
  
  // Get match details
  const matchResult = await getMatch(id)
  
  if (!matchResult.success || !matchResult.data) {
    notFound()
  }

  const match = matchResult.data

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <MatchDetailView 
          match={match}
          user={user}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: MatchPageProps) {
  const { id } = await params
  const matchResult = await getMatch(id)
  
  if (!matchResult.success || !matchResult.data) {
    return {
      title: 'Partido no encontrado - Fulbito Teruel',
    }
  }

  const match = matchResult.data
  const date = new Date(match.starts_at).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return {
    title: `${match.location} - ${date} - Fulbito Teruel`,
    description: `Partido de fútbol en ${match.location} el ${date}. Capacidad: ${match.capacity} jugadores.`,
  }
}
