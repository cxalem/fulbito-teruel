import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { AdminTestPanel } from '@/components/admin-test-panel'
import { DebugPanel } from '@/components/debug-panel'
import { UpcomingMatchesList } from '@/components/upcoming-matches-list'
import { getAppStats } from '@/lib/actions/stats'

export async function generateMetadata(): Promise<Metadata> {
  const stats = await getAppStats()
  const matchCount = stats.success ? stats.data?.matchCount : 0
  const playerCount = stats.success ? stats.data?.playerCount : 0
  
  const ogImageUrl = `/api/og?type=home&title=${encodeURIComponent('Fulbito Teruel')}&description=${encodeURIComponent('Partidos de fútbol en Teruel')}&matchCount=${matchCount}&playerCount=${playerCount}`
  
  return {
    title: 'Inicio - Fulbito Teruel',
    description: 'Encuentra y únete a partidos de fútbol en Teruel. Descubre próximos partidos, forma equipos y disfruta del deporte rey.',
    openGraph: {
      title: 'Inicio - Fulbito Teruel',
      description: 'Encuentra y únete a partidos de fútbol en Teruel. Descubre próximos partidos, forma equipos y disfruta del deporte rey.',
      url: '/',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Fulbito Teruel - Partidos de fútbol en Teruel',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Inicio - Fulbito Teruel',
      description: 'Encuentra y únete a partidos de fútbol en Teruel. Descubre próximos partidos, forma equipos y disfruta del deporte rey.',
      images: [ogImageUrl],
    },
  }
}

export default async function Home() {
  const { user, isAdmin } = await getCurrentUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Matches List */}
        <UpcomingMatchesList user={user} isAdmin={isAdmin} />
        
        {/* Debug Panels - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 space-y-6 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <h2 className="text-lg font-semibold text-muted-foreground">
              Paneles de Debug (Solo en desarrollo)
            </h2>
            
            <DebugPanel isAdmin={isAdmin} user={user} />
            <AdminTestPanel isAdmin={isAdmin} user={user} />
          </div>
        )}
      </div>
    </div>
  )
}