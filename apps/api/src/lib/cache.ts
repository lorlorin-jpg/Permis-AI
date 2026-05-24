// ─────────────────────────────────────────────────────────────────────────────
// Redis caching layer (Upstash REST client)
// ─────────────────────────────────────────────────────────────────────────────

import { Redis } from '@upstash/redis'
import { logger } from './logger'

// ─────────────────────────────────────────────────────────────────────────────
// Singleton client
// ─────────────────────────────────────────────────────────────────────────────

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null // Cache gracefully disabled when Redis is not configured
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

// ─────────────────────────────────────────────────────────────────────────────
// TTL constants (seconds)
// ─────────────────────────────────────────────────────────────────────────────

export const TTL = {
  /** AI-generated explanations rarely change. Cache for 7 days. */
  AI_EXPLANATION: 7 * 24 * 60 * 60,
  /** Question list (no correct answers exposed). Cache for 5 min. */
  QUESTION_LIST: 5 * 60,
  /** Individual question. Cache for 10 min. */
  QUESTION_DETAIL: 10 * 60,
  /** User progress page data. Cache for 2 min. */
  USER_PROGRESS: 2 * 60,
  /** AI weakness analysis is expensive. Cache for 1 hour. */
  WEAKNESS_ANALYSIS: 60 * 60,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Key builders (centralised to avoid typos)
// ─────────────────────────────────────────────────────────────────────────────

export const CacheKey = {
  aiExplanation: (questionId: string, language = 'fr') =>
    `explanation:${questionId}:${language}`,
  questionList: (category: string, difficulty: string, limit: number, offset: number) =>
    `questions:${category}:${difficulty}:${limit}:${offset}`,
  questionDetail: (id: string) => `question:${id}`,
  userProgress: (userId: string) => `progress:${userId}`,
  weaknessAnalysis: (userId: string) => `weakness:${userId}`,
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic cache helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a cached value. Returns null on cache miss or if Redis is unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedis()
  if (!client) return null

  try {
    const value = await client.get<T>(key)
    return value ?? null
  } catch (err) {
    logger.warn('[cache] GET failed — falling through to source', { key, error: String(err) })
    return null
  }
}

/**
 * Set a cached value with an optional TTL (seconds).
 * Silently swallows errors so cache failures never break the request.
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedis()
  if (!client) return

  try {
    await client.set(key, value, { ex: ttlSeconds })
  } catch (err) {
    logger.warn('[cache] SET failed', { key, error: String(err) })
  }
}

/**
 * Delete one or more cached keys.
 */
export async function cacheDel(...keys: string[]): Promise<void> {
  const client = getRedis()
  if (!client || keys.length === 0) return

  try {
    await client.del(...keys)
  } catch (err) {
    logger.warn('[cache] DEL failed', { keys, error: String(err) })
  }
}

/**
 * Convenience: get-or-set cache wrapper.
 *
 * @param key        - Cache key
 * @param ttl        - TTL in seconds
 * @param fetcher    - Async function to call on cache miss
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    logger.debug('[cache] HIT', { key })
    return cached
  }

  logger.debug('[cache] MISS', { key })
  const value = await fetcher()
  await cacheSet(key, value, ttl)
  return value
}

// ─────────────────────────────────────────────────────────────────────────────
// Aliases — getCached/setCached/invalidateCache + CacheKeys match the spec
// ─────────────────────────────────────────────────────────────────────────────

/** Alias for cacheGet — spec naming convention */
export const getCached = cacheGet

/** Alias for cacheSet — spec naming convention */
export const setCached = cacheSet

/** Alias for cacheDel — spec naming convention */
export const invalidateCache = cacheDel

/** Alias for CacheKey — spec naming convention (plural) */
export const CacheKeys = CacheKey
