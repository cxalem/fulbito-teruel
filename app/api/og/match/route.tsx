import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getMatch } from '@/lib/actions/matches'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('id')

    if (!matchId) {
      return new Response('Match ID is required', { status: 400 })
    }

    // Get match details
    const matchResult = await getMatch(matchId)
    
    if (!matchResult.success || !matchResult.data) {
      // Fallback image for invalid matches
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#18181b',
              color: '#fafafa',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>❌</div>
            <div style={{ fontSize: 48, textAlign: 'center' }}>
              Partido no encontrado
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      )
    }

    const match = matchResult.data
    const startDate = new Date(match.starts_at)
    const endDate = new Date(match.ends_at)
    
    // Format date and time
    const dateStr = startDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    
    const timeStr = `${startDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${endDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
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
            backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
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
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 40 }}>⚽</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#fafafa',
                }}
              >
                Fulbito Teruel
              </div>
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
              <div style={{ fontSize: 24 }}>{matchTypeEmoji}</div>
              <div
                style={{
                  fontSize: 20,
                  color: '#a1a1aa',
                }}
              >
                {matchTypeLabel}
              </div>
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
                fontSize: 56,
                fontWeight: 'bold',
                color: '#fafafa',
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              {location}
            </div>

            {/* Date */}
            <div
              style={{
                fontSize: 32,
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
                fontSize: 28,
                color: '#fafafa',
                marginBottom: 40,
              }}
            >
              {timeStr}
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: 60,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 32 }}>👥</div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#fafafa',
                  }}
                >
                  {match.capacity}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: '#a1a1aa',
                  }}
                >
                  jugadores
                </div>
              </div>

              {match.total_cost && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 32 }}>💶</div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#fafafa',
                    }}
                  >
                    €{match.total_cost}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      color: '#a1a1aa',
                    }}
                  >
                    total
                  </div>
                </div>
              )}

              {match.is_private && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 32 }}>🔒</div>
                  <div
                    style={{
                      fontSize: 18,
                      color: '#a1a1aa',
                    }}
                  >
                    Privado
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#71717a',
              fontSize: 20,
            }}
          >
            ¡Únete al partido!
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('Error generating match OG image:', e)
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    })
  }
}
