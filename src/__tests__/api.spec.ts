import { z } from 'zod'
import { ApiError, request } from '@/api/client'
import { shouldRetryQuery } from '@/api/queryClient'

// jsdom has no fetch, and tests must never hit the network anyway
const fetchMock = jest.fn()
global.fetch = fetchMock
const respond = (status: number, data: unknown = {}) =>
  fetchMock.mockResolvedValue({ ok: status < 400, status, json: async () => data })

const schema = z.object({ id: z.number() })

describe('request', () => {
  beforeEach(() => fetchMock.mockReset())

  it('returns the validated body on success', async () => {
    respond(200, { id: 1 })

    await expect(request('/things/1', schema)).resolves.toEqual({ id: 1 })
  })

  it('throws an ApiError keeping the HTTP status (404, 503)', async () => {
    respond(404)
    await expect(request('/things/1', schema)).rejects.toMatchObject({ status: 404, code: 'HTTP' })

    respond(503)
    await expect(request('/things/1', schema)).rejects.toMatchObject({ status: 503 })
  })

  it('throws a NETWORK error with status 0 when the server is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(request('/things/1', schema)).rejects.toMatchObject({
      status: 0,
      code: 'NETWORK',
    })
  })

  it('aborts with a TIMEOUT error when the server hangs', async () => {
    jest.useFakeTimers()
    // Never resolves: only settles when the request is aborted
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) =>
          init.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    )

    const promise = request('/things/1', schema, { timeoutMs: 5000 }).catch((e: unknown) => e)
    jest.advanceTimersByTime(5000)

    expect(await promise).toMatchObject({ status: 0, code: 'TIMEOUT' })
    jest.useRealTimers()
  })

  it('rejects a response that does not match the schema', async () => {
    respond(200, { id: 'not-a-number' })

    await expect(request('/things/1', schema)).rejects.toMatchObject({
      code: 'INVALID_RESPONSE',
    })
  })
})

describe('retry policy', () => {
  it('retries network errors and 5xx at most 3 times, never a 4xx', () => {
    expect(shouldRetryQuery(0, new ApiError(0, 'offline', 'NETWORK'))).toBe(true)
    expect(shouldRetryQuery(2, new ApiError(503, 'down'))).toBe(true)
    expect(shouldRetryQuery(3, new ApiError(503, 'down'))).toBe(false)
    expect(shouldRetryQuery(0, new ApiError(404, 'not found'))).toBe(false)
  })
})
