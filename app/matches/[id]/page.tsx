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
      description: 'El partido que buscas no existe o ha sido eliminado.',
      openGraph: {
        title: 'Partido no encontrado - Fulbito Teruel',
        description: 'El partido que buscas no existe o ha sido eliminado.',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Partido no encontrado - Fulbito Teruel',
        description: 'El partido que buscas no existe o ha sido eliminado.',
      },
    }
  }

  const match = matchResult.data
  const startDate = new Date(match.starts_at)
  const endDate = new Date(match.ends_at)
  
  const date = startDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const time = `${startDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })} - ${endDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid'
  })}`

  const location = match.is_private ? 'Ubicación privada' : match.location
  const matchType = match.match_type === 'friendly' ? 'Amistoso' : 'Entrenamiento'
  
  const title = `${location} - ${date} - Fulbito Teruel`
  const description = `${matchType} de fútbol en ${location} el ${date} a las ${time}. Capacidad: ${match.capacity} jugadores.${match.total_cost ? ` Coste: €${match.total_cost}` : ''}`

  return {
    title,
    description,
    keywords: ["fútbol", "teruel", "partido", matchType.toLowerCase(), "deporte", "equipos"],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/matches/${id}`,
      siteName: 'Fulbito Teruel',
      locale: 'es_ES',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/og/match?id=${id}&v=${Date.now()}`,
          width: 1200,
          height: 630,
          alt: `Partido de fútbol en ${location}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@fulbitoteruel',
      images: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/og/match?id=${id}&v=${Date.now()}`],
    },
  }
}
