import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { queryKeys } from '@/api/queryKeys'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import Home from '@/pages'
import ConversationPage from '@/pages/conversations/[id]'
import { reportError } from '@/utils/reportError'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('@/utils/reportError')

const conversations = [
  {
    id: 1,
    senderId: 1,
    senderNickname: 'Thibaut',
    recipientId: 2,
    recipientNickname: 'Jeremie',
    lastMessageTimestamp: 1625637849,
  },
]
const messages = [
  { id: 1, conversationId: 1, authorId: 2, timestamp: 1625637849, body: 'Toujours dispo ?' },
]

const json = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data })

// Each test decides which endpoints are down
let serverDown: string[] = []
global.fetch = jest.fn(async (url: string) => {
  if (serverDown.some((path) => url.endsWith(path))) return json({}, 503)
  if (url.endsWith('/conversations/1')) return json(conversations)
  if (url.endsWith('/messages/1')) return json(messages)
  return json({}, 404)
}) as unknown as typeof fetch

function renderWithProviders(page: ReactNode, query: Record<string, string> = {}) {
  jest.mocked(useRouter).mockReturnValue({ query, isReady: true, push: jest.fn() } as never)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>{page}</AuthProvider>
    </QueryClientProvider>,
  )
  return client
}

beforeEach(() => {
  serverDown = []
})

describe('server failures', () => {
  it('explains a server error, and Réessayer loads the data once the server is back', async () => {
    serverDown = ['/conversations/1']
    renderWithProviders(<Home />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nos serveurs rencontrent un souci. Réessayez dans un instant.',
    )

    serverDown = []
    await userEvent.click(screen.getByRole('button', { name: 'Réessayer' }))

    expect(await screen.findByRole('link', { name: /Jeremie/ })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps the messages on screen when a refresh fails', async () => {
    const client = renderWithProviders(<ConversationPage />, { id: '1' })
    await screen.findByText('Toujours dispo ?')

    serverDown = ['/messages/1']
    await client.refetchQueries({ queryKey: queryKeys.messages.byConversation(1) })
    await waitFor(() =>
      expect(client.getQueryState(queryKeys.messages.byConversation(1))?.status).toBe('error'),
    )

    expect(screen.getByText('Toujours dispo ?')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Votre message' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a fallback and reports the error when a component crashes', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined) // React logs caught errors
    const Crash = () => {
      throw new Error('boom')
    }

    render(
      <ErrorBoundary>
        <Crash />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Oups, quelque chose s'est mal passé.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recharger la page' })).toBeInTheDocument()
    expect(reportError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }), {
      componentStack: expect.any(String),
    })
  })
})
