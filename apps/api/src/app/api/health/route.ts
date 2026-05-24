import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Health check endpoint — used by load balancers, uptime monitors, and k8s probes
// This route is intentionally PUBLIC (no auth required)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ServiceStatus {
  status: 'ok' | 'degraded' | 'down'
  latencyMs?: number
  error?: string
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down'
  timestamp: string
  version: string
  uptime: number
  services: {
    database: ServiceStatus
    redis?: ServiceStatus
  }
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'ok', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'down',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown DB error',
    }
  }
}

async function checkRedis(): Promise<ServiceStatus | undefined> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return undefined // Redis not configured — skip check
  }

  const start = Date.now()
  try {
    const { Redis } = await import('@upstash/redis')
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    await redis.ping()
    return { status: 'ok', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'degraded', // Redis failure is non-critical (app falls back to DB)
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown Redis error',
    }
  }
}

export async function GET() {
  const [db, redis] = await Promise.all([checkDatabase(), checkRedis()])

  const allOk = db.status === 'ok'
  const anyDown = db.status === 'down'

  const overallStatus: 'ok' | 'degraded' | 'down' = anyDown
    ? 'down'
    : !allOk
    ? 'degraded'
    : 'ok'

  const body: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: Math.floor(process.uptime()),
    services: {
      database: db,
      ...(redis ? { redis } : {}),
    },
  }

  const httpStatus = overallStatus === 'down' ? 503 : 200

  return NextResponse.json(body, { status: httpStatus })
}
