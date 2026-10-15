import { z } from 'zod'
import { MAX_MESSAGE_LENGTH } from '@/constants/limits'
import type { Conversation } from '@/types/conversation'
import type { Message } from '@/types/message'
import type { UserSummary } from '@/types/user'

const idSchema = z.number().int().positive()

const nicknameSchema = z.string().trim().min(1)

/** UNIX seconds. The swagger says string, the data has integers: accept both. */
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
const userSchema = z.object({
  id: idSchema,
  nickname: nicknameSchema,
}) satisfies z.ZodType<UserSummary>

export const userListSchema = z.array(userSchema)

export const messageBodySchema = z
  .string()
  .trim()
  .min(1, 'Le message ne peut pas être vide.')
  .max(MAX_MESSAGE_LENGTH, `Le message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères.`)
