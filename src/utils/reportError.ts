export type ErrorContext = Record<string, unknown>

/**
 * Single entry point for error monitoring. Logs to the console outside production;
 * in production this is where Sentry (or any APM) would be plugged:
 *   Sentry.captureException(error, { extra: context })
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'production') return
  console.error('[reportError]', error, context ?? {})
}
