import { useQuery } from '@tanstack/react-query'
import { getMessages } from '@/api/messages'
import { queryKeys } from '@/api/queryKeys'
import type { Message } from '@/types/message'

/** json-server has no push: poll while the thread is displayed (paused when the tab is hidden). */
export const MESSAGES_POLL_INTERVAL_MS = 5000

const sortChronologically = (messages: Message[]): Message[] =>
  [...messages].sort((a, b) => a.timestamp - b.timestamp || a.id - b.id)

interface UseMessagesOptions {
  /** Only fetch once we know the conversation belongs to the logged user. */
  enabled?: boolean
}

/**
 * Messages of a conversation, oldest first.
 * No `placeholderData: keepPreviousData` on purpose: switching conversation must never
 * show the previous conversation's messages, even for a moment.
 */
export function useMessages(conversationId: number, { enabled = true }: UseMessagesOptions = {}) {
  return useQuery({
    queryKey: queryKeys.messages.byConversation(conversationId),
    queryFn: ({ signal }) => getMessages(conversationId, signal),
    select: sortChronologically,
    enabled,
    refetchInterval: MESSAGES_POLL_INTERVAL_MS,
  })
}
