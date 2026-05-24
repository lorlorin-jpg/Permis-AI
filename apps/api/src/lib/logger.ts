// ─────────────────────────────────────────────────────────────────────────────
// Structured logger (pino-compatible interface, works in Edge & Node runtimes)
// ─────────────────────────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  environment: string
  [key: string]: unknown
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

function formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    ...context,
  }
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry = formatEntry(level, message, context)

  if (IS_PRODUCTION) {
    // In production, emit JSON for log aggregators (Datadog, Logtail, etc.)
    const output = JSON.stringify(entry)
    switch (level) {
      case 'error':
        console.error(output)
        break
      case 'warn':
        console.warn(output)
        break
      default:
        console.log(output)
    }
  } else {
    // Human-readable format for development
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
    const ctxStr = context && Object.keys(context).length > 0
      ? ' ' + JSON.stringify(context)
      : ''
    const line = `${prefix} ${message}${ctxStr}`
    switch (level) {
      case 'error':
        console.error(line)
        break
      case 'warn':
        console.warn(line)
        break
      case 'debug':
        if (process.env.LOG_LEVEL === 'debug') console.debug(line)
        break
      default:
        console.log(line)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public logger interface
// ─────────────────────────────────────────────────────────────────────────────

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    write('debug', message, context),

  info: (message: string, context?: Record<string, unknown>) =>
    write('info', message, context),

  warn: (message: string, context?: Record<string, unknown>) =>
    write('warn', message, context),

  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    const errorContext: Record<string, unknown> = { ...context }

    if (error instanceof Error) {
      errorContext.errorMessage = error.message
      errorContext.errorName = error.name
      if (!IS_PRODUCTION && error.stack) {
        errorContext.stack = error.stack
      }
    } else if (error !== undefined) {
      errorContext.error = String(error)
    }

    write('error', message, errorContext)
  },

  /**
   * Log an API request — call at route entry.
   */
  request: (method: string, path: string, userId?: string) =>
    write('info', `${method} ${path}`, { userId, type: 'request' }),

  /**
   * Log an API response — call before returning.
   */
  response: (method: string, path: string, statusCode: number, durationMs?: number) =>
    write('info', `${method} ${path} -> ${statusCode}`, {
      statusCode,
      durationMs,
      type: 'response',
    }),

  /**
   * Create a child logger with pre-bound context (e.g., route name, userId).
   */
  child: (bindings: Record<string, unknown>) => ({
    debug: (message: string, ctx?: Record<string, unknown>) =>
      write('debug', message, { ...bindings, ...ctx }),
    info: (message: string, ctx?: Record<string, unknown>) =>
      write('info', message, { ...bindings, ...ctx }),
    warn: (message: string, ctx?: Record<string, unknown>) =>
      write('warn', message, { ...bindings, ...ctx }),
    error: (message: string, error?: unknown, ctx?: Record<string, unknown>) => {
      const errorContext: Record<string, unknown> = { ...bindings, ...ctx }
      if (error instanceof Error) {
        errorContext.errorMessage = error.message
        errorContext.errorName = error.name
        if (!IS_PRODUCTION && error.stack) errorContext.stack = error.stack
      }
      write('error', message, errorContext)
    },
  }),
}

export default logger
