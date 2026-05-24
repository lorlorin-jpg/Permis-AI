import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ─────────────────────────────────────────────────────────────────────────────
// Redis client singleton
// ─────────────────────────────────────────────────────────────────────────────

let redisClient: Redis | null = null

function getRedisClient(): Redis {
  if (!redisClient) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN env vars'
      )
    }
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redisClient
}

// ─────────────────────────────────────────────────────────────────────────────
// Limit definitions
// ─────────────────────────────────────────────────────────────────────────────

export type RateLimitAction = 'AI_QUESTION' | 'EXAM' | 'CHAT'

interface LimitConfig {
  limit: number
  /** Window duration in seconds */
  window: number
}

export const FREE_LIMITS: Record<RateLimitAction, LimitConfig> = {
  AI_QUESTION: { limit: 5, window: 86400 },   // 5 per day
  EXAM: { limit: 2, window: 86400 },            // 2 per day
  CHAT: { limit: 10, window: 86400 },           // 10 per day
}

export const PREMIUM_LIMITS: Record<RateLimitAction, LimitConfig> = {
  AI_QUESTION: { limit: 100, window: 86400 },  // 100 per day
  EXAM: { limit: 20, window: 86400 },           // 20 per day
  CHAT: { limit: 200, window: 86400 },          // 200 per day
}

// ─────────────────────────────────────────────────────────────────────────────
// Ratelimit cache (one instance per action/limit combination)
// ─────────────────────────────────────────────────────────────────────────────

const limiterCache = new Map<string, Ratelimit>()

function getLimiter(limit: number, windowSeconds: number): Ratelimit {
  const key = `${limit}:${windowSeconds}`
  if (!limiterCache.has(key)) {
    limiterCache.set(
      key,
      new Ratelimit({
        redis: getRedisClient(),
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        analytics: true,
        prefix: 'permis_ai_rl',
      })
    )
  }
  return limiterCache.get(key)!
}

// ─────────────────────────────────────────────────────────────────────────────
// Public rate-limit function
// ─────────────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number  // Unix timestamp (ms) when the window resets
  limit: number
}

/**
 * Check and increment rate limit for a user action.
 *
 * @param userId  - The user's internal DB ID (or Supabase ID)
 * @param action  - The action being rate-limited
 * @param limit   - Maximum allowed requests in the window
 * @param window  - Window duration in seconds
 */
export async function rateLimit(
  userId: string,
  action: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  const limiter = getLimiter(limit, window)
  const identifier = `${action}:${userId}`

  const result = await limiter.limit(identifier)

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
    limit: result.limit,
  }
}

/**
 * Convenience helper: rate-limit using the predefined free or premium limits.
 */
export async function rateLimitByPlan(
  userId: string,
  action: RateLimitAction,
  isPremium: boolean
): Promise<RateLimitResult> {
  const limits = isPremium ? PREMIUM_LIMITS : FREE_LIMITS
  const config = limits[action]
  return rateLimit(userId, action, config.limit, config.window)
}
