import type { ReactNode } from 'react'
import { MESSAGES } from '@/constants/messages'
import styles from './StatusMessage.module.scss'

interface StatusMessageProps {
  title: string
  description?: string
  variant?: 'info' | 'loading' | 'error'
  /** Displays a "Réessayer" button. */
  onRetry?: () => void
  /** Extra action, e.g. a link back to the list. */
  action?: ReactNode
}

/** Loading, empty, error and placeholder states share one component. */
export function StatusMessage({
  title,
  description,
  variant = 'info',
  onRetry,
  action,
}: StatusMessageProps) {
  return (
    <div
      className={`${styles.status} ${styles[`status--${variant}`]}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {variant === 'loading' && <span className={styles.status__spinner} aria-hidden="true" />}
      {variant === 'info' && (
        <span className={styles.status__icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="32" height="32" focusable="false">
            <path
              d="M4 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
              fill="currentColor"
            />
            <path
              d="M20 9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5L15.5 18H11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      <p className={styles.status__title}>{title}</p>
      {description && <p className={styles.status__description}>{description}</p>}
      {(onRetry || action) && (
        <div className={styles.status__actions}>
          {onRetry && (
            <button type="button" className={styles.status__button} onClick={onRetry}>
              {MESSAGES.errors.retry}
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}
