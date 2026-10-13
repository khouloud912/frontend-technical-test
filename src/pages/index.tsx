import Head from 'next/head'
import { Layout } from '@/components/Layout/Layout'
import { StatusMessage } from '@/components/StatusMessage/StatusMessage'
import { MESSAGES } from '@/constants/messages'

export default function Home() {
  return (
    <>
      <Head>
        <title>{MESSAGES.app.name}</title>
        <meta name="description" content={MESSAGES.app.description} />
      </Head>
      <Layout>
        {/* Only visible on desktop, next to the list */}
        <StatusMessage
          title={MESSAGES.conversations.select}
          description={MESSAGES.conversations.selectHint}
        />
      </Layout>
    </>
  )
}
