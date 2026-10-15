import { MESSAGES } from '@/constants/messages'
import type { ThreadMessage } from '@/types/message'
import { formatFullDate, formatTime, toISODate } from '@/utils/formatDate'
import styles from './MessageItem.module.scss'

interface MessageItemProps {
  message: ThreadMessage
  isMine: boolean
  authorName: string
  /** First message of a run by the same author: shows the author's name. */
  isFirstInGroup: boolean
  onRetry?: (message: ThreadMessage) => void
}

/** The body is rendered as plain React text: user content is never parsed as HTML. */
export function MessageItem({
  message,
  isMine,
  authorName,
  isFirstInGroup,
  onRetry,
}: MessageItemProps) {
  const showAuthor = !isMine && isFirstInGroup

  return (
    <li
      className={[
        styles.message,
        styles[isMine ? 'message--mine' : 'message--theirs'],
        isFirstInGroup ? styles['message--first'] : '',
        message.status ? styles[`message--${message.status}`] : '',
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
      {message.status === 'sending' && (
        <span className={styles.message__status}>{MESSAGES.thread.sending}</span>
      )}
      {message.status === 'failed' && (
        <span className={`${styles.message__status} ${styles['message__status--failed']}`}>
          {MESSAGES.thread.failed} ·{' '}
          <button
            type="button"
            className={styles.message__retry}
            onClick={() => onRetry?.(message)}
            aria-label={MESSAGES.thread.retrySend}
          >
            {MESSAGES.errors.retry}
          </button>
        </span>
      )}
    </li>
  )
}
