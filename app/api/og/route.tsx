import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Fulbito Teruel'
    const description = searchParams.get('description') || 'Partidos de fútbol en Teruel'
    const type = searchParams.get('type') || 'home'

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
            backgroundImage: 'radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 40,
            }}
          >
            {/* Soccer Ball Emoji */}
            <div
              style={{
                fontSize: 120,
                marginBottom: 20,
              }}
            >
              ⚽
            </div>
            
            {/* Title */}
            <div
              style={{
                fontSize: type === 'match' ? 48 : 64,
                fontWeight: 'bold',
                color: '#fafafa',
                textAlign: 'center',
                marginBottom: 16,
                maxWidth: '90%',
              }}
            >
              {title}
            </div>
            
            {/* Description */}
            <div
              style={{
                fontSize: type === 'match' ? 24 : 32,
                color: '#a1a1aa',
                textAlign: 'center',
                marginBottom: 40,
                maxWidth: '80%',
              }}
            >
              {description}
            </div>
          </div>

          {type === 'home' && (
            /* Features for home page */
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 60,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#fafafa',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏟️</div>
                <div style={{ fontSize: 20 }}>Encuentra partidos</div>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#fafafa',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
                <div style={{ fontSize: 20 }}>Únete a equipos</div>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#fafafa',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
                <div style={{ fontSize: 20 }}>Juega ya</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              display: 'flex',
              alignItems: 'center',
              color: '#71717a',
              fontSize: 24,
            }}
          >
            fulbito-teruel.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.error('Error generating OG image:', e)
    return new Response(`Failed to generate the image: ${e instanceof Error ? e.message : 'Unknown error'}`, {
      status: 500,
    })
  }
}
