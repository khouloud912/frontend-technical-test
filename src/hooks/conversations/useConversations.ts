import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getConversations } from '@/api/conversations'
import { queryKeys } from '@/api/queryKeys'
import { useLoggedUserId } from '@/context/AuthContext'
import type { Conversation } from '@/types/conversation'

// Module-level so React Query can memoize the result between renders
const sortByMostRecent = (conversations: Conversation[]): Conversation[] =>
  [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)

/** The server never updates lastMessageTimestamp (the cache does): never go back in time. */
function keepLatestActivity(fresh: Conversation[], previous: Conversation[] = []): Conversation[] {
  const previousById = new Map(previous.map((conversation) => [conversation.id, conversation]))
  return fresh.map((conversation) => ({
    ...conversation,
    lastMessageTimestamp: Math.max(
      conversation.lastMessageTimestamp,
      previousById.get(conversation.id)?.lastMessageTimestamp ?? 0,
    ),
  }))
}

export function useConversations() {
  const userId = useLoggedUserId()
  const queryClient = useQueryClient()
  const queryKey = queryKeys.conversations.byUser(userId)

  return useQuery({
    queryKey,
    queryFn: async ({ signal }) =>
      keepLatestActivity(
        await getConversations(userId, signal),
        queryClient.getQueryData<Conversation[]>(queryKey),
      ),
    select: sortByMostRecent,
  })
}
