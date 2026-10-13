import { useQuery } from '@tanstack/react-query'
import { getConversations } from '@/api/conversations'
import { queryKeys } from '@/api/queryKeys'
import { useLoggedUserId } from '@/context/AuthContext'
import type { Conversation } from '@/types/conversation'

// Module-level so React Query can memoize the result between renders
const sortByMostRecent = (conversations: Conversation[]): Conversation[] =>
  [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)

/** Conversations of the logged user, most recent first. */
export function useConversations() {
  const userId = useLoggedUserId()

  return useQuery({
    queryKey: queryKeys.conversations.byUser(userId),
    queryFn: ({ signal }) => getConversations(userId, signal),
    select: sortByMostRecent,
  })
}
