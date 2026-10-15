import type { Conversation } from '@/types/conversation'
import { ApiError, assertValidId, request } from './client'
import { conversationListSchema, conversationSchema } from './schemas'

type NewConversationPayload = Omit<Conversation, 'id'>

export async function getConversations(
  userId: number,
  signal?: AbortSignal,
): Promise<Conversation[]> {
  assertValidId(userId, 'userId')
  return request(`/conversations/${userId}`, conversationListSchema, { signal })
}

/** json-server stores the body as-is: every field is required (the swagger only lists recipientId). */
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
