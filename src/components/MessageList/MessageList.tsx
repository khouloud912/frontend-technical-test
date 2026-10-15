import { Fragment, useEffect, useRef } from 'react'
import { MessageItem } from '@/components/MessageItem/MessageItem'
import { MESSAGES } from '@/constants/messages'
import type { ThreadMessage } from '@/types/message'
import { formatDayLabel, fromUnixSeconds, toISODate } from '@/utils/formatDate'
import styles from './MessageList.module.scss'

interface MessageListProps {
  /** Oldest first. */
  messages: ThreadMessage[]
  loggedUserId: number
  participantName: string
  onRetry?: (message: ThreadMessage) => void
}

const dayKey = (seconds: number) => fromUnixSeconds(seconds).toDateString()

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Messages grouped by day (separators) and by consecutive author. */
export function MessageList({
  messages,
  loggedUserId,
  participantName,
  onRetry,
}: MessageListProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const hasScrolledRef = useRef(false)
  const lastMessageId = messages[messages.length - 1]?.id

  // Keep the newest message in view: instantly on open, smoothly when one arrives
  useEffect(() => {
    const smooth = hasScrolledRef.current && !prefersReducedMotion()
    listRef.current?.lastElementChild?.scrollIntoView?.({
      block: 'end',
      behavior: smooth ? 'smooth' : 'auto',
    })
    hasScrolledRef.current = true
  }, [lastMessageId])

  return (
    // Screen readers announce new messages politely (without interrupting)
    <ol ref={listRef} className={styles['message-list']} role="log" aria-live="polite">
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
            <MessageItem
              message={message}
              isMine={isMine}
              authorName={isMine ? MESSAGES.thread.you : participantName}
              isFirstInGroup={isNewDay || previous?.authorId !== message.authorId}
              onRetry={onRetry}
            />
          </Fragment>
        )
      })}
    </ol>
  )
}
