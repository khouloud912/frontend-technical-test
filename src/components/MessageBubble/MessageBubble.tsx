import type { Message } from '@/types/message'
import { formatFullDate, formatTime, toISODate } from '@/utils/formatDate'
import styles from './MessageBubble.module.scss'

interface MessageBubbleProps {
  message: Message
  isMine: boolean
  authorName: string
  /** First message of a run by the same author: shows the author's name. */
  isFirstInGroup: boolean
}

/** The body is rendered as plain React text: user content is never parsed as HTML. */
export function MessageBubble({ message, isMine, authorName, isFirstInGroup }: MessageBubbleProps) {
  const showAuthor = !isMine && isFirstInGroup

  return (
    <li
      className={[
        styles.message,
        styles[isMine ? 'message--mine' : 'message--theirs'],
        isFirstInGroup ? styles['message--first'] : '',
      ].join(' ')}
    >
      {showAuthor ? (
        <span className={styles.message__author}>{authorName}</span>
      ) : (
        <span className="visually-hidden">{authorName}</span>
      )}
      <div className={styles.message__bubble}>
        <p className={styles.message__body}>{message.body}</p>
        <time
          className={styles.message__time}
          dateTime={toISODate(message.timestamp)}
          title={formatFullDate(message.timestamp)}
        >
          {formatTime(message.timestamp)}
        </time>
      </div>
    </li>
  )
}
