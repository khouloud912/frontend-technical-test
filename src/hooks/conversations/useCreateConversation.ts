import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { createConversation } from '@/api/conversations'
import { queryKeys } from '@/api/queryKeys'
import type { Conversation } from '@/types/conversation'
import type { UserSummary } from '@/types/user'
import { toUnixSeconds } from '@/utils/formatDate'

interface CreateVariables {
  sender: UserSummary
  recipient: UserSummary
}

/** Creates a conversation, adds it to the list and opens it. */
export function useCreateConversation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationKey: ['createConversation'],
    // json-server stores the body as-is: every field must be sent
    mutationFn: ({ sender, recipient }: CreateVariables) =>
      createConversation({
        senderId: sender.id,
        senderNickname: sender.nickname,
        recipientId: recipient.id,
        recipientNickname: recipient.nickname,
        lastMessageTimestamp: toUnixSeconds(),
      }),

    onSuccess: async (conversation, { sender }) => {
      // Add it right away: the conversation page only opens conversations of the list
      queryClient.setQueryData<Conversation[]>(
        queryKeys.conversations.byUser(sender.id),
        (conversations = []) => [
          ...conversations.filter(({ id }) => id !== conversation.id),
          conversation,
        ],
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all })
      await router.push(`/conversations/${conversation.id}`)
    },
  })
}
