import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/assets/lbc-logo.webp'
import { ConversationList } from '@/components/ConversationList/ConversationList'
import { MESSAGES } from '@/constants/messages'
import styles from './Layout.module.scss'

interface LayoutProps {
  /** Set on a conversation page: highlights it in the list and, on mobile, shows the thread. */
  activeConversationId?: number
  children: ReactNode
}

export function Layout({ activeConversationId, children }: LayoutProps) {
  const isThreadOpen = activeConversationId !== undefined

  return (
    <div className={`${styles.layout} ${isThreadOpen ? styles['layout--thread-open'] : ''}`}>
      <header className={styles.layout__header}>
        <Link href="/" className={styles.layout__logo}>
          <Image src={logo} alt={MESSAGES.app.logoAlt} width={128} height={40} priority />
        </Link>
        <span className={styles['layout__app-name']}>{MESSAGES.app.section}</span>
      </header>
      <div className={styles.layout__body}>
        <nav className={styles.layout__sidebar} aria-label={MESSAGES.conversations.title}>
          <ConversationList
            activeConversationId={activeConversationId}
            headingLevel={isThreadOpen ? 'h2' : 'h1'}
          />
        </nav>
        <main className={styles.layout__main}>{children}</main>
      </div>
    </div>
  )
}
