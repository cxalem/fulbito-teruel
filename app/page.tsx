import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { AdminTestPanel } from '@/components/admin-test-panel'
import { DebugPanel } from '@/components/debug-panel'
import { UpcomingMatchesList } from '@/components/upcoming-matches-list'

export const metadata: Metadata = {
  title: 'Inicio - Fulbito Teruel',
  description: 'Encuentra y únete a partidos de fútbol en Teruel. Descubre próximos partidos, forma equipos y disfruta del deporte rey.',
  openGraph: {
    title: 'Inicio - Fulbito Teruel',
    description: 'Encuentra y únete a partidos de fútbol en Teruel. Descubre próximos partidos, forma equipos y disfruta del deporte rey.',
    url: '/',
    images: [
      {
        url: '/api/og?type=home&title=Fulbito Teruel&description=Partidos de fútbol en Teruel',
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
    images: ['/api/og?type=home&title=Fulbito Teruel&description=Partidos de fútbol en Teruel'],
  },
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