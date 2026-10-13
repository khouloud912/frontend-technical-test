import type { z } from 'zod'
import { REQUEST_TIMEOUT_MS } from '@/constants/limits'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005'

export type ApiErrorCode =
  /** No response: offline, DNS failure, CORS, server down. */
  | 'NETWORK'
  /** No response within the timeout. */
  | 'TIMEOUT'
  /** The server answered with a non-2xx status. */
  | 'HTTP'
  /** The server answered 2xx but the body is not what we expect. */
  | 'INVALID_RESPONSE'

/**
 * Every failure of `request` is an ApiError, so the UI can react to the cause
 * (offline vs server crash vs not found). `status` is the HTTP status, or 0 when
 * no response was received.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode

  constructor(status: number, message: string, code: ApiErrorCode = 'HTTP', cause?: unknown) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }

  get isNetworkError(): boolean {
    return this.code === 'NETWORK' || this.code === 'TIMEOUT'
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

/** Only transient failures are worth retrying: never 4xx nor invalid payloads. */
export const isRetryableError = (error: unknown): boolean =>
  isApiError(error) && (error.isNetworkError || error.isServerError)

export const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'AbortError'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  /** Serialized as JSON. */
  body?: unknown
  /** Caller cancellation (React Query passes one to every query). */
  signal?: AbortSignal
  timeoutMs?: number
}

/**
 * Merges the caller's signal with a timeout. Implemented by hand rather than with
 * AbortSignal.any / AbortSignal.timeout, which older Safari versions lack.
 */
function createSignal(timeoutMs: number, external?: AbortSignal) {
  const controller = new AbortController()
  let timedOut = false

  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const onExternalAbort = () => controller.abort(external?.reason)
  if (external?.aborted) onExternalAbort()
  else external?.addEventListener('abort', onExternalAbort, { once: true })

  return {
    signal: controller.signal,
    hasTimedOut: () => timedOut,
    cleanup: () => {
      clearTimeout(timer)
      external?.removeEventListener('abort', onExternalAbort)
    },
  }
}

/**
 * Typed fetch wrapper: timeout, HTTP status check and runtime validation of the
 * response body with a zod schema. Data that does not match the schema is never
 * handed to the UI.
 */
export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  { method = 'GET', body, signal, timeoutMs = REQUEST_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  const { signal: requestSignal, hasTimedOut, cleanup } = createSignal(timeoutMs, signal)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: requestSignal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    cleanup()
    if (hasTimedOut()) {
      throw new ApiError(0, `Request timed out after ${timeoutMs}ms`, 'TIMEOUT', error)
    }
    // Cancelled by the caller: let it propagate untouched (React Query expects it)
    if (signal?.aborted) throw error
    throw new ApiError(0, 'Network error', 'NETWORK', error)
  }
  cleanup()

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with status ${response.status}`)
  }

  let json: unknown
  try {
    json = await response.json()
  } catch (error) {
    throw new ApiError(response.status, 'Response is not valid JSON', 'INVALID_RESPONSE', error)
  }

  const result = schema.safeParse(json)
  if (!result.success) {
    throw new ApiError(
      response.status,
      `Unexpected response shape for ${method} ${path}`,
      'INVALID_RESPONSE',
      result.error,
    )
  }
  return result.data
}

/** Ids are interpolated in URLs: refuse anything that is not a positive integer. */
export function assertValidId(id: number, label = 'id'): void {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `Invalid ${label}: ${String(id)}`)
  }
}
