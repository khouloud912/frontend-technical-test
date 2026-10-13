import { ConversationItem } from '@/components/ConversationItem/ConversationItem'
import { StatusMessage } from '@/components/StatusMessage/StatusMessage'
import { MESSAGES } from '@/constants/messages'
import { useLoggedUserId } from '@/context/AuthContext'
import { useConversations } from '@/hooks/conversations/useConversations'
import styles from './ConversationList.module.scss'

interface ConversationListProps {
  activeConversationId?: number
  /** h1 on the home page, h2 when a thread (with its own h1) is displayed. */
  headingLevel?: 'h1' | 'h2'
}

export function ConversationList({
  activeConversationId,
  headingLevel: Heading = 'h2',
}: ConversationListProps) {
  const loggedUserId = useLoggedUserId()
  const { data: conversations, isPending, isError, refetch } = useConversations()

  const renderContent = () => {
    if (isPending) {
      return <StatusMessage variant="loading" title={MESSAGES.conversations.loading} />
    }
    if (isError) {
      return (
        <StatusMessage
          variant="error"
          title={MESSAGES.conversations.error}
          description={MESSAGES.errors.generic}
          onRetry={() => void refetch()}
        />
      )
    }
    if (conversations.length === 0) {
      return (
        <StatusMessage
          title={MESSAGES.conversations.empty}
          description={MESSAGES.conversations.emptyHint}
        />
      )
    }
    return (
      <ul className={styles['conversation-list__items']}>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            loggedUserId={loggedUserId}
            isActive={conversation.id === activeConversationId}
          />
        ))}
      </ul>
    )
  }

  return (
    <section className={styles['conversation-list']} aria-labelledby="conversation-list-title">
      <Heading id="conversation-list-title" className={styles['conversation-list__title']}>
        {MESSAGES.conversations.title}
        {conversations && conversations.length > 0 && (
          <span className={styles['conversation-list__count']}>
            {conversations.length}
            <span className="visually-hidden"> {MESSAGES.conversations.countLabel}</span>
          </span>
        )}
      </Heading>
      {renderContent()}
    </section>
  )
}
