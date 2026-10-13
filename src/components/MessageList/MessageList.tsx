import { Fragment } from 'react'
import { MessageBubble } from '@/components/MessageBubble/MessageBubble'
import { MESSAGES } from '@/constants/messages'
import type { Message } from '@/types/message'
import { formatDayLabel, fromUnixSeconds, toISODate } from '@/utils/formatDate'
import styles from './MessageList.module.scss'

interface MessageListProps {
  /** Oldest first. */
  messages: Message[]
  loggedUserId: number
  participantName: string
}

const dayKey = (seconds: number) => fromUnixSeconds(seconds).toDateString()

/** Messages grouped by day (separators) and by consecutive author. */
export function MessageList({ messages, loggedUserId, participantName }: MessageListProps) {
  return (
    <ol className={styles['message-list']}>
      {messages.map((message, index) => {
        const previous = messages[index - 1]
        const isNewDay = !previous || dayKey(previous.timestamp) !== dayKey(message.timestamp)
        const isMine = message.authorId === loggedUserId

        return (
          <Fragment key={message.id}>
            {isNewDay && (
              <li className={styles['message-list__separator']}>
                <time dateTime={toISODate(message.timestamp)}>
                  {formatDayLabel(message.timestamp)}
                </time>
              </li>
            )}
            <MessageBubble
              message={message}
              isMine={isMine}
              authorName={isMine ? MESSAGES.thread.you : participantName}
              isFirstInGroup={isNewDay || previous?.authorId !== message.authorId}
            />
          </Fragment>
        )
      })}
    </ol>
  )
}
