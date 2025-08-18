import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('id')

    if (!matchId) {
      return new Response('Match ID is required', { status: 400 })
    }

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
          Match: {matchId.slice(0, 8)}...
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.error('Error generating match OG image:', e)
    return new Response(`Failed to generate the image: ${e instanceof Error ? e.message : 'Unknown error'}`, {
      status: 500,
    })
  }
}