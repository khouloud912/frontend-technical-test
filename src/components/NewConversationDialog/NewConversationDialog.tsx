import { useId, useRef, useState, type MouseEvent } from 'react'
import { useRouter } from 'next/router'
import { Avatar } from '@/components/Avatar/Avatar'
import { StatusMessage } from '@/components/StatusMessage/StatusMessage'
import { MESSAGES } from '@/constants/messages'
import { useLoggedUserId } from '@/context/AuthContext'
import { useConversations } from '@/hooks/conversations/useConversations'
import { useCreateConversation } from '@/hooks/conversations/useCreateConversation'
import { useUsers } from '@/hooks/users/useUsers'
import type { UserSummary } from '@/types/user'
import { getOtherParticipant } from '@/utils/getOtherParticipant'
import styles from './NewConversationDialog.module.scss'

/**
 * "Nouvelle conversation" button + native <dialog>: showModal() gives a focus trap,
 * Esc to close and an inert background for free.
 */
export function NewConversationDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()
  const loggedUserId = useLoggedUserId()
  const users = useUsers({ enabled: isOpen })
  const { data: conversations } = useConversations()
  const createConversation = useCreateConversation()

  const loggedUser = users.data?.find(({ id }) => id === loggedUserId)
  const otherUsers = users.data?.filter(({ id }) => id !== loggedUserId) ?? []
  const findExistingConversation = (userId: number) =>
    conversations?.find(
      (conversation) => getOtherParticipant(conversation, loggedUserId).id === userId,
    )

  const open = () => {
    createConversation.reset()
    setIsOpen(true)
    dialogRef.current?.showModal()
  }

  const close = () => dialogRef.current?.close()

  // Fired by close(), Esc and the backdrop: always give focus back to the button
  const handleClose = () => {
    setIsOpen(false)
    openButtonRef.current?.focus()
  }

  // A click on the backdrop targets the <dialog> itself, not its content
  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && !createConversation.isPending) close()
  }

  const handleSelect = (recipient: UserSummary) => {
    // Never create a duplicate: open the existing conversation instead
    const existing = findExistingConversation(recipient.id)
    if (existing) {
      close()
      void router.push(`/conversations/${existing.id}`)
      return
    }
    if (!loggedUser || createConversation.isPending) return
    createConversation.mutate({ sender: loggedUser, recipient }, { onSuccess: close })
  }

  const renderUsers = () => {
    if (users.isPending) {
      return <StatusMessage variant="loading" title={MESSAGES.newConversation.loading} />
    }
    if (users.isError) {
      return (
        <StatusMessage
          variant="error"
          title={MESSAGES.newConversation.error}
          onRetry={() => void users.refetch()}
        />
      )
    }
    if (otherUsers.length === 0) {
      return <StatusMessage title={MESSAGES.newConversation.empty} />
    }
    return (
      <ul className={styles.dialog__users}>
        {otherUsers.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              className={styles.dialog__user}
              onClick={() => handleSelect(user)}
              disabled={createConversation.isPending}
            >
              <Avatar userId={user.id} name={user.nickname} size="sm" />
              <span className={styles['dialog__user-name']}>{user.nickname}</span>
              {findExistingConversation(user.id) && (
                <span className={styles['dialog__user-badge']}>
                  {MESSAGES.newConversation.existing}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <>
      <button ref={openButtonRef} type="button" className={styles['open-button']} onClick={open}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
        {MESSAGES.newConversation.open}
      </button>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop click is a mouse shortcut; Esc is the keyboard equivalent */}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={handleClose}
        onClick={handleDialogClick}
      >
        <div className={styles.dialog__header}>
          <h2 id={titleId} className={styles.dialog__title}>
            {MESSAGES.newConversation.title}
          </h2>
          <button
            type="button"
            className={styles.dialog__close}
            onClick={close}
            disabled={createConversation.isPending}
            aria-label={MESSAGES.newConversation.close}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <p className={styles.dialog__description}>{MESSAGES.newConversation.description}</p>

        {createConversation.isPending && (
          <p className={styles.dialog__info} role="status">
            {MESSAGES.newConversation.creating}
          </p>
        )}
        {createConversation.isError && (
          <p className={styles.dialog__error} role="alert">
            {MESSAGES.newConversation.createError}
          </p>
        )}

        {isOpen && renderUsers()}
      </dialog>
    </>
  )
}
