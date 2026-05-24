// Simple monitoring wrapper — replace with Sentry/Datadog in production
export function captureException(error: unknown, context?: Record<string, unknown>) {
  const err = error instanceof Error ? error : new Error(String(error))
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    context,
    timestamp: new Date().toISOString(),
  })
  // TODO: Send to Sentry in production
  // Sentry.captureException(err, { extra: context })
}

export function captureEvent(event: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[EVENT]', event, data)
  }
  // TODO: Send to analytics in production
}

export function trackAIUsage(userId: string, tokens: number, model: string, action: string) {
  captureEvent('ai_usage', { userId, tokens, model, action, cost: estimateCost(tokens, model) })
}

function estimateCost(tokens: number, model: string): number {
  // GPT-4o: ~$5/1M tokens input, ~$15/1M output (rough estimate)
  const rates: Record<string, number> = {
    'gpt-4o': 0.000010,
    'gpt-4o-mini': 0.000000150,
    'text-embedding-3-small': 0.000000020,
  }
  return tokens * (rates[model] || 0.000010)
}
