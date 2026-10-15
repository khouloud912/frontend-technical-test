import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { DEFAULT_STALE_TIME_MS, MAX_QUERY_RETRIES, MAX_RETRY_DELAY_MS } from '@/constants/limits'
import { reportError } from '@/utils/reportError'
import { isAbortError, isRetryableError } from './client'

const retryDelay = (attempt: number): number => Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS)

export const shouldRetryQuery = (failureCount: number, error: unknown): boolean =>
  failureCount < MAX_QUERY_RETRIES && isRetryableError(error)

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!isAbortError(error)) reportError(error, { queryKey: query.queryKey })
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        reportError(error, { mutationKey: mutation.options.mutationKey })
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        // Retry transient failures (network / 5xx) only; a 4xx will not fix itself
        retry: shouldRetryQuery,
        retryDelay,
      },
      mutations: {
        // POST is not idempotent: an automatic retry could duplicate a message.
        // Retries are explicit, user-triggered.
        retry: false,
      },
    },
  })
}
