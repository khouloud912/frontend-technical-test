import { z } from 'zod'
import { MAX_MESSAGE_LENGTH } from '@/constants/limits'
import type { Conversation } from '@/types/conversation'
import type { Message } from '@/types/message'
import type { UserSummary } from '@/types/user'

const idSchema = z.number().int().positive()

const nicknameSchema = z.string().trim().min(1)

/**
 * UNIX timestamp in seconds. The swagger documents Message.timestamp as a string
 * while the data holds integers: accept both, always output a number.
 */
const timestampSchema = z
  .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
  .pipe(z.number().int().nonnegative())

export const conversationSchema = z.object({
  id: idSchema,
  senderId: idSchema,
  senderNickname: nicknameSchema,
  recipientId: idSchema,
  recipientNickname: nicknameSchema,
  lastMessageTimestamp: timestampSchema,
}) satisfies z.ZodType<Conversation>

export const conversationListSchema = z.array(conversationSchema)

export const messageSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  authorId: idSchema,
  timestamp: timestampSchema,
  body: z.string(),
}) satisfies z.ZodType<Message>

export const messageListSchema = z.array(messageSchema)

/** Unknown keys (such as `token`) are stripped by zod: secrets never reach the UI. */
export const userSchema = z.object({
  id: idSchema,
  nickname: nicknameSchema,
}) satisfies z.ZodType<UserSummary>

export const userListSchema = z.array(userSchema)

/** DELETE endpoints answer an empty object: the body is irrelevant. */
export const emptyResponseSchema = z.unknown()

/** User input: what a message must look like before it is sent. */
export const messageBodySchema = z
  .string()
  .trim()
  .min(1, 'Le message ne peut pas être vide.')
  .max(MAX_MESSAGE_LENGTH, `Le message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères.`)
