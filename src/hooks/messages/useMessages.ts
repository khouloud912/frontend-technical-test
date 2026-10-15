import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMessages } from '@/api/messages'
import { queryKeys } from '@/api/queryKeys'
import type { ThreadMessage } from '@/types/message'

/** json-server has no push: poll while the thread is displayed (paused when the tab is hidden). */
const MESSAGES_POLL_INTERVAL_MS = 5000

const sortChronologically = (messages: ThreadMessage[]): ThreadMessage[] =>
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
  const queryClient = useQueryClient()
  const queryKey = queryKeys.messages.byConversation(conversationId)

  return useQuery({
    queryKey,
    queryFn: async ({ signal }): Promise<ThreadMessage[]> => {
      const serverMessages = await getMessages(conversationId, signal)
      // Messages being sent, or that failed, only exist client-side:
      // a refetch (polling) must not make them disappear
      const localMessages =
        queryClient
          .getQueryData<ThreadMessage[]>(queryKey)
          ?.filter((message) => message.status !== undefined) ?? []
      return [...serverMessages, ...localMessages]
    },
    select: sortChronologically,
    enabled,
    refetchInterval: MESSAGES_POLL_INTERVAL_MS,
  })
}
