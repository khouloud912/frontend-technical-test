import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Avatar } from '@/components/Avatar/Avatar'
import { Layout } from '@/components/Layout/Layout'
import { MessageComposer } from '@/components/MessageComposer/MessageComposer'
import { MessageList } from '@/components/MessageList/MessageList'
import { StatusMessage } from '@/components/StatusMessage/StatusMessage'
import { MESSAGES } from '@/constants/messages'
import { useLoggedUserId } from '@/context/AuthContext'
import { useConversations } from '@/hooks/conversations/useConversations'
import { useMessages } from '@/hooks/messages/useMessages'
import { useSendMessage } from '@/hooks/messages/useSendMessage'
import styles from '@/styles/ConversationPage.module.scss'
import { formatRelativeDateTime, toISODate } from '@/utils/formatDate'
import { getOtherParticipant } from '@/utils/getOtherParticipant'

/** The id comes from the URL: anything but a positive integer is rejected. */
function parseConversationId(value: string | string[] | undefined): number | null {
  return typeof value === 'string' && /^[1-9]\d{0,9}$/.test(value) ? Number(value) : null
}

export default function ConversationPage() {
  const router = useRouter()
  const loggedUserId = useLoggedUserId()
  const conversationId = parseConversationId(router.query.id)

  const conversations = useConversations()
  const conversation = conversations.data?.find(({ id }) => id === conversationId)
  // Only load messages of a conversation the logged user takes part in
  const messages = useMessages(conversationId ?? 0, { enabled: conversation !== undefined })
  const { send, retry, isPending } = useSendMessage(conversationId ?? 0)

  const renderMessages = (participantName: string) => {
    if (messages.isPending) {
      return <StatusMessage variant="loading" title={MESSAGES.thread.loading} />
    }
    if (messages.isError) {
      return (
        <StatusMessage
          variant="error"
          title={MESSAGES.thread.error}
          description={MESSAGES.errors.generic}
          onRetry={() => void messages.refetch()}
        />
      )
    }
    if (messages.data.length === 0) {
      return <StatusMessage title={MESSAGES.thread.empty} />
    }
    return (
      <MessageList
        messages={messages.data}
        loggedUserId={loggedUserId}
        participantName={participantName}
        onRetry={retry}
      />
    )
  }

  const renderThread = () => {
    if (!router.isReady || conversations.isPending) {
      return <StatusMessage variant="loading" title={MESSAGES.thread.loading} />
    }
    if (conversations.isError) {
      return (
        <StatusMessage
          variant="error"
          title={MESSAGES.thread.error}
          description={MESSAGES.errors.generic}
          onRetry={() => void conversations.refetch()}
        />
      )
    }
    if (!conversation) {
      return (
        <StatusMessage
          variant="error"
          title={MESSAGES.thread.notFound}
          description={MESSAGES.thread.notFoundHint}
          action={
            <Link href="/" className={styles['conversation-page__link']}>
              {MESSAGES.thread.backToList}
            </Link>
          }
        />
      )
    }

    const participant = getOtherParticipant(conversation, loggedUserId)
    // Posting a message does not update lastMessageTimestamp server-side.
    // Messages not saved yet (sending / failed) do not count.
    const lastSavedMessage = messages.data?.filter((message) => !message.status).pop()
    const lastTimestamp = Math.max(
      conversation.lastMessageTimestamp,
      lastSavedMessage?.timestamp ?? 0,
    )

    return (
      <>
        <Head>
          <title>{`${participant.nickname} – ${MESSAGES.app.name}`}</title>
        </Head>
        <header className={styles['conversation-page__header']}>
          <Link href="/" className={styles['conversation-page__back']}>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="visually-hidden">{MESSAGES.thread.back}</span>
          </Link>
          <Avatar userId={participant.id} name={participant.nickname} size="sm" />
          <div className={styles['conversation-page__heading']}>
            <h1 className={styles['conversation-page__title']}>{participant.nickname}</h1>
            <p className={styles['conversation-page__subtitle']}>
              {MESSAGES.thread.lastMessage}{' '}
              <time dateTime={toISODate(lastTimestamp)}>
                {formatRelativeDateTime(lastTimestamp)}
              </time>
            </p>
          </div>
        </header>
        <div className={styles['conversation-page__messages']}>
          {renderMessages(participant.nickname)}
        </div>
        {/* Only once the thread is loaded, so the optimistic message lands in a ready cache.
            The key resets the draft when switching conversation. */}
        {messages.isSuccess && (
          <MessageComposer key={conversation.id} onSend={send} isPending={isPending} />
        )}
      </>
    )
  }

  return (
    <Layout activeConversationId={conversationId ?? undefined}>
      <div className={styles['conversation-page']}>{renderThread()}</div>
    </Layout>
  )
}
