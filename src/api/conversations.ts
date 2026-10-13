import type { Conversation } from '@/types/conversation'
import { ApiError, assertValidId, request } from './client'
import { conversationListSchema, conversationSchema, emptyResponseSchema } from './schemas'

export type NewConversationPayload = Omit<Conversation, 'id'>

export async function getConversations(
  userId: number,
  signal?: AbortSignal,
): Promise<Conversation[]> {
  assertValidId(userId, 'userId')
  return request(`/conversations/${userId}`, conversationListSchema, { signal })
}

/**
 * json-server stores the body as-is, so it must contain every field of a
 * conversation (the swagger only documents `recipientId`).
 */
export async function createConversation(payload: NewConversationPayload): Promise<Conversation> {
  assertValidId(payload.senderId, 'senderId')
  assertValidId(payload.recipientId, 'recipientId')
  if (payload.senderId === payload.recipientId) {
    throw new ApiError(400, 'Cannot start a conversation with yourself')
  }
  return request(`/conversations/${payload.senderId}`, conversationSchema, {
    method: 'POST',
    body: payload,
  })
}

export async function deleteConversation(conversationId: number): Promise<void> {
  assertValidId(conversationId, 'conversationId')
  await request(`/conversation/${conversationId}`, emptyResponseSchema, { method: 'DELETE' })
}
