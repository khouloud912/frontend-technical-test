import type { Conversation } from '@/types/conversation'
import type { UserSummary } from '@/types/user'

/** The logged user can be either the sender or the recipient. */
export function getOtherParticipant(conversation: Conversation, loggedUserId: number): UserSummary {
  return conversation.senderId === loggedUserId
    ? { id: conversation.recipientId, nickname: conversation.recipientNickname }
    : { id: conversation.senderId, nickname: conversation.senderNickname }
}
