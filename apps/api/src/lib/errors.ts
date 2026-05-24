// ─────────────────────────────────────────────────────────────────────────────
// Standardized application error class and error codes
// ─────────────────────────────────────────────────────────────────────────────

export const ErrorCode = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // AI
  AI_ERROR: 'AI_ERROR',
  AI_PARSE_ERROR: 'AI_PARSE_ERROR',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',

  // Stripe / payments
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

/**
 * Standardized application error.
 *
 * Usage:
 *   throw new AppError('User not found', ErrorCode.NOT_FOUND, 404)
 */
export class AppError extends Error {
  public readonly code: ErrorCodeType
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    code: ErrorCodeType = ErrorCode.INTERNAL_ERROR,
    statusCode: number = 500,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true
    this.details = details

    // Maintains proper prototype chain in transpiled code
    Object.setPrototypeOf(this, AppError.prototype)
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.details ? { details: this.details } : {}),
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory helpers
// ─────────────────────────────────────────────────────────────────────────────

export const errors = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, ErrorCode.UNAUTHORIZED, 401),

  forbidden: (message = 'Forbidden') =>
    new AppError(message, ErrorCode.FORBIDDEN, 403),

  notFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, ErrorCode.NOT_FOUND, 404),

  conflict: (message: string) =>
    new AppError(message, ErrorCode.CONFLICT, 409),

  validation: (message: string, details?: Record<string, unknown>) =>
    new AppError(message, ErrorCode.VALIDATION_ERROR, 400, details),

  rateLimited: (remaining: number, reset: number) =>
    new AppError('Rate limit exceeded', ErrorCode.RATE_LIMIT_EXCEEDED, 429, {
      remaining,
      reset,
    }),

  internal: (message = 'Internal server error') =>
    new AppError(message, ErrorCode.INTERNAL_ERROR, 500),

  ai: (message = 'AI service error') =>
    new AppError(message, ErrorCode.AI_ERROR, 502),

  payment: (message: string) =>
    new AppError(message, ErrorCode.PAYMENT_ERROR, 402),
}

// ─────────────────────────────────────────────────────────────────────────────
// Type guard
// ─────────────────────────────────────────────────────────────────────────────

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Extract a safe error message for logging — never exposes stack traces.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

// ─────────────────────────────────────────────────────────────────────────────
// Shorthand factory object (matches the spec's Errors.UNAUTHORIZED() pattern)
// ─────────────────────────────────────────────────────────────────────────────

export const Errors = {
  UNAUTHORIZED: () => new AppError('Non autorisé', ErrorCode.UNAUTHORIZED, 401),
  FORBIDDEN: () => new AppError('Accès refusé', ErrorCode.FORBIDDEN, 403),
  NOT_FOUND: (resource: string) =>
    new AppError(`${resource} introuvable`, ErrorCode.NOT_FOUND, 404),
  RATE_LIMITED: () =>
    new AppError('Limite de requêtes atteinte', ErrorCode.RATE_LIMIT_EXCEEDED, 429),
  AI_ERROR: (msg: string) => new AppError(msg, ErrorCode.AI_ERROR, 500),
  VALIDATION: (msg: string) => new AppError(msg, ErrorCode.VALIDATION_ERROR, 422),
}

// ─────────────────────────────────────────────────────────────────────────────
// Centralized error → Response converter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert any thrown value into a standardized JSON Response.
 * Use at the top of every route catch block.
 */
export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.statusCode },
    )
  }
  console.error('[Unhandled error]', error)
  return Response.json(
    { error: ErrorCode.INTERNAL_ERROR, message: 'Erreur interne du serveur' },
    { status: 500 },
  )
}
