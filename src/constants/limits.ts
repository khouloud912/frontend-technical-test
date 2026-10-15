/** Maximum length of a message body (characters, after trimming). */
export const MAX_MESSAGE_LENGTH = 1000

export const REQUEST_TIMEOUT_MS = 10_000

/** Maximum number of automatic retries for a failing query (network errors / 5xx only). */
export const MAX_QUERY_RETRIES = 3

export const MAX_RETRY_DELAY_MS = 8_000

export const DEFAULT_STALE_TIME_MS = 30_000
