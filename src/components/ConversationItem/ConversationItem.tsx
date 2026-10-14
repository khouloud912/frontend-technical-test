import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { getMessages } from '@/api/messages'
import { queryKeys } from '@/api/queryKeys'
import { Avatar } from '@/components/Avatar/Avatar'
import type { Conversation } from '@/types/conversation'
import { formatFullDate, formatShortDate, toISODate } from '@/utils/formatDate'
import { getOtherParticipant } from '@/utils/getOtherParticipant'
import styles from './ConversationItem.module.scss'

interface ConversationItemProps {
  conversation: Conversation
  loggedUserId: number
  isActive: boolean
}

export function ConversationItem({ conversation, loggedUserId, isActive }: ConversationItemProps) {
  const queryClient = useQueryClient()
  const participant = getOtherParticipant(conversation, loggedUserId)
  const timestamp = conversation.lastMessageTimestamp

  // Load the messages on hover/focus so the conversation opens instantly.
  // Only when nothing is cached: a cached thread may hold unsent messages to keep.
  const prefetchMessages = () => {
    const queryKey = queryKeys.messages.byConversation(conversation.id)
    if (queryClient.getQueryData(queryKey)) return
    void queryClient.prefetchQuery({
      queryKey,
      queryFn: ({ signal }) => getMessages(conversation.id, signal),
    })
  }

  return (
    <li>
      <Link
        href={`/conversations/${conversation.id}`}
        className={`${styles.item} ${isActive ? styles['item--active'] : ''}`}
        aria-current={isActive ? 'page' : undefined}
        onMouseEnter={prefetchMessages}
        onFocus={prefetchMessages}
      >
        <Avatar userId={participant.id} name={participant.nickname} />
        <span className={styles.item__name}>{participant.nickname}</span>
        <time className={styles.item__date} dateTime={toISODate(timestamp)}>
          <span aria-hidden="true">{formatShortDate(timestamp)}</span>
          <span className="visually-hidden">{formatFullDate(timestamp)}</span>
        </time>
      </Link>
    </li>
  )
}
