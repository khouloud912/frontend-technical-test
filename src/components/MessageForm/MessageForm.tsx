import { useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { MAX_MESSAGE_LENGTH } from '@/constants/limits'
import { MESSAGES } from '@/constants/messages'
import styles from './MessageForm.module.scss'

const COUNTER_THRESHOLD = Math.floor(MAX_MESSAGE_LENGTH * 0.8)

interface MessageFormProps {
  /** Returns false when the message was refused (blank, too long, already sending). */
  onSend: (body: string) => boolean
  isPending: boolean
}

export function MessageForm({ onSend, isPending }: MessageFormProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputId = useId()
  const hintId = `${inputId}-hint`
  const counterId = `${inputId}-counter`

  const isBlank = value.trim().length === 0
  const remaining = MAX_MESSAGE_LENGTH - value.length
  const showCounter = value.length >= COUNTER_THRESHOLD

  // Auto-grow: the textarea follows its content (capped by max-height in CSS)
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  const submit = () => {
    if (isBlank || isPending) return
    if (onSend(value)) setValue('')
    // Clicking the button moves focus away: bring it back to keep typing
    textareaRef.current?.focus()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a new line. isComposing: don't send while an
    // IME (e.g. Japanese, Chinese input) is still composing a word
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className="visually-hidden">
        {MESSAGES.composer.label}
      </label>
      <div className={styles.composer__field}>
        <textarea
          ref={textareaRef}
          id={inputId}
          className={styles.composer__input}
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={MESSAGES.composer.placeholder}
          aria-describedby={showCounter ? `${hintId} ${counterId}` : hintId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className={styles.composer__send}
          disabled={isBlank || isPending}
          aria-label={MESSAGES.composer.send}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className={styles.composer__meta}>
        <span id={hintId} className={styles.composer__hint}>
          {MESSAGES.composer.hint}
        </span>
        {showCounter && (
          <span
            id={counterId}
            className={`${styles.composer__counter} ${remaining === 0 ? styles['composer__counter--limit'] : ''}`}
            aria-live="polite"
          >
            {MESSAGES.composer.remaining(remaining)}
          </span>
        )}
      </div>
    </form>
  )
}
