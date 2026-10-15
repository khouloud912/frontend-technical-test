/** Hierarchical so a whole family can be invalidated at once (e.g. messages.all). */
export const queryKeys = {
  conversations: {
    all: ['conversations'] as const,
    byUser: (userId: number) => ['conversations', userId] as const,
  },
  messages: {
    all: ['messages'] as const,
    byConversation: (conversationId: number) => ['messages', conversationId] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (userId: number) => ['users', userId] as const,
  },
}
