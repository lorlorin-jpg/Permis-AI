import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET!

// ─────────────────────────────────────────────────────────────────────────────
// Server-side client (service role — bypasses RLS, use only in API routes)
// ─────────────────────────────────────────────────────────────────────────────

let serverClientInstance: SupabaseClient | null = null

export function createServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars'
    )
  }

  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return serverClientInstance
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser / anon client (obeys RLS, safe to expose in client components)
// ─────────────────────────────────────────────────────────────────────────────

export function createBrowserClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT verification
// ─────────────────────────────────────────────────────────────────────────────

export interface SupabaseTokenPayload {
  sub: string          // Supabase user UUID
  email?: string
  role?: string
  aud?: string
  exp?: number
  iat?: number
}

export async function verifySupabaseToken(
  token: string
): Promise<SupabaseTokenPayload> {
  if (!supabaseJwtSecret) {
    throw new Error('Missing SUPABASE_JWT_SECRET env var')
  }

  try {
    const secret = new TextEncoder().encode(supabaseJwtSecret)
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })

    if (!payload.sub) {
      throw new Error('Token payload missing sub claim')
    }

    return payload as unknown as SupabaseTokenPayload
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid Supabase token: ${error.message}`)
    }
    throw new Error('Invalid Supabase token')
  }
}
