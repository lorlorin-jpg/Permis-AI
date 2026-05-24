import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/api/auth/verify',
  '/api/webhooks/stripe',
]

// Routes that require auth but allow OPTIONS (CORS preflight)
const CORS_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

async function verifyToken(token: string): Promise<{
  sub: string
  email?: string
  role?: string
  aud?: string
  exp?: number
} | null> {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) return null

  try {
    const encoded = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, encoded, {
      algorithms: ['HS256'],
    })
    if (!payload.sub) return null
    return payload as { sub: string; email?: string; role?: string; aud?: string; exp?: number }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': CORS_ORIGIN,
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers':
          'Authorization, Content-Type, X-Requested-With, Accept',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Skip auth for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Only protect /api/* routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Extract Bearer token
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header' },
      {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': CORS_ORIGIN,
          'WWW-Authenticate': 'Bearer realm="permis-ai"',
        },
      }
    )
  }

  const token = authHeader.slice(7).trim()
  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      {
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': CORS_ORIGIN,
        },
      }
    )
  }

  // Forward user context via headers to API route handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-supabase-id', payload.sub)
  requestHeaders.set('x-user-email', payload.email ?? '')
  requestHeaders.set('x-user-role', payload.role ?? 'authenticated')

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', CORS_ORIGIN)
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
