import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getMatch } from '@/lib/actions/matches'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('id')

    if (!matchId) {
      return new Response('Match ID is required', { status: 400 })
    }

    // Get match data
    const matchResult = await getMatch(matchId)
    if (!matchResult.success || !matchResult.data) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#18181b',
              color: '#fafafa',
              fontSize: 48,
            }}
          >
            Partido no encontrado
          </div>
        ),
        { width: 1200, height: 630 }
      )
    }

    const match = matchResult.data
    const startDate = new Date(match.starts_at)
    const endDate = new Date(match.ends_at)
    
    // Get signup count for this match
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { count: signupCount } = await supabase
      .from('signups')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId)
    
    const currentSignups = signupCount || 0
    const spotsRemaining = match.capacity - currentSignups
    
    // Format date and time
    const dateStr = startDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
    
    const timeStr = `${startDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    })} - ${endDate.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    })}`
    
    // Determine match type
    const matchTypeEmoji = match.match_type === 'friendly' ? '🤝' : '🏃‍♂️'
    const matchTypeLabel = match.match_type === 'friendly' ? 'Amistoso' : 'Entrenamiento'
    const location = match.is_private ? 'Ubicación privada' : (match.location || 'Ubicación no especificada')

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#18181b',
            backgroundImage: 'linear-gradient(45deg, #18181b 0%, #27272a 100%)',
            padding: 60,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span>⚽</span>
              <span>Fulbito Teruel</span>
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#27272a',
                padding: '12px 24px',
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>{matchTypeEmoji}</span>
              <span
                style={{
                  fontSize: 20,
                  color: '#a1a1aa',
                }}
              >
                {matchTypeLabel}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Location */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#fafafa',
                marginBottom: 20,
              }}
            >
              {location}
            </div>

            {/* Date */}
            <div
              style={{
                fontSize: 28,
                color: '#a1a1aa',
                marginBottom: 16,
                textTransform: 'capitalize',
              }}
            >
              {dateStr}
            </div>

            {/* Time */}
            <div
              style={{
                fontSize: 24,
                color: '#fafafa',
                marginBottom: 40,
              }}
            >
              {timeStr}
            </div>

            {/* Signup Stats */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                backgroundColor: '#27272a',
                padding: '20px 40px',
                borderRadius: 16,
              }}
            >
              <span style={{ fontSize: 32 }}>👥</span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#fafafa',
                  }}
                >
                  {currentSignups}/{match.capacity}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: spotsRemaining === 0 ? '#ef4444' : '#a1a1aa',
                  }}
                >
                  {spotsRemaining === 0 ? '¡Completo!' : `${spotsRemaining} disponibles`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <span
              style={{
                fontSize: 18,
                color: '#71717a',
              }}
            >
              ¡Únete al partido!
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        },
      }
    )
  } catch (e) {
    console.error('Error generating match OG image:', e)
    return new Response(`Failed to generate the image: ${e instanceof Error ? e.message : 'Unknown error'}`, {
      status: 500,
    })
  }
}