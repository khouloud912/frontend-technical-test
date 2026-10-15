type ErrorContext = Record<string, unknown>

/** Single entry point for error monitoring: plug Sentry here in production. */
export function reportError(error: unknown, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'production') return
  // warn, not error: Next's dev overlay pops up on console.error and would cover
  // the friendly error screens of expected failures (e.g. a 503)
  console.warn('[reportError]', error, context ?? {})
}
