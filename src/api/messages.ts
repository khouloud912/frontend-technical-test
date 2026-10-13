import type { Message } from '@/types/message'
import { ApiError, assertValidId, request } from './client'
import { emptyResponseSchema, messageBodySchema, messageListSchema, messageSchema } from './schemas'

export type NewMessagePayload = Omit<Message, 'id'>

export async function getMessages(
  conversationId: number,
  signal?: AbortSignal,
): Promise<Message[]> {
  assertValidId(conversationId, 'conversationId')
  return request(`/messages/${conversationId}`, messageListSchema, { signal })
}

/**
 * The route is rewritten to /messages?conversationId=… and json-server ignores the
 * query string on POST, so `conversationId` must be in the body too.
 * The body is validated here as well as in the UI (defense in depth).
 */
export async function sendMessage(payload: NewMessagePayload): Promise<Message> {
  assertValidId(payload.conversationId, 'conversationId')
  assertValidId(payload.authorId, 'authorId')
  const body = messageBodySchema.safeParse(payload.body)
  if (!body.success) {
    throw new ApiError(400, body.error.issues[0]?.message ?? 'Invalid message', 'HTTP', body.error)
  }
  return request(`/messages/${payload.conversationId}`, messageSchema, {
    method: 'POST',
    body: { ...payload, body: body.data },
  })
}

export async function deleteMessage(messageId: number): Promise<void> {
  assertValidId(messageId, 'messageId')
  await request(`/message/${messageId}`, emptyResponseSchema, { method: 'DELETE' })
}
