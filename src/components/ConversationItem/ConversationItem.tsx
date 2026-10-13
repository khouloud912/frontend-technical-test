import Link from 'next/link'
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
  const participant = getOtherParticipant(conversation, loggedUserId)
  const timestamp = conversation.lastMessageTimestamp

  return (
    <li>
      <Link
        href={`/conversations/${conversation.id}`}
        className={`${styles.item} ${isActive ? styles['item--active'] : ''}`}
        aria-current={isActive ? 'page' : undefined}
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
