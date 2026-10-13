import type { ReactNode } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { AuthProvider } from '@/context/AuthContext'
import Home from '@/pages'
import ConversationPage from '@/pages/conversations/[id]'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))

// Logged user is 1 (Thibaut): sender of #1 and #2, recipient of #3
const conversations = [
  {
    id: 1,
    senderId: 1,
    senderNickname: 'Thibaut',
    recipientId: 2,
    recipientNickname: 'Jeremie',
    lastMessageTimestamp: 1625637849,
  },
  {
    id: 2,
    senderId: 1,
    senderNickname: 'Thibaut',
    recipientId: 3,
    recipientNickname: 'Patrick',
    lastMessageTimestamp: 1620284667,
  },
  {
    id: 3,
    senderId: 4,
    senderNickname: 'Elodie',
    recipientId: 1,
    recipientNickname: 'Thibaut',
    lastMessageTimestamp: 1625648667,
  },
]
const messages = [
  {
    id: 2,
    conversationId: 1,
    authorId: 2,
    timestamp: 1625648667,
    body: 'Bonjour, toujours dispo ?',
  },
  { id: 1, conversationId: 1, authorId: 1, timestamp: 1625637849, body: 'Je vends mon vélo' },
]

const fetchMock = jest.fn()
global.fetch = fetchMock
const json = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data })

function mockApi(routes: Record<string, unknown>) {
  fetchMock.mockImplementation(async (url: string) => {
    const route = Object.keys(routes).find((path) => url.endsWith(path))
    return route ? json(routes[route]) : json({}, 404)
  })
}

function renderPage(page: ReactNode, query: Record<string, string> = {}) {
  jest.mocked(useRouter).mockReturnValue({ query, isReady: true } as never)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>{page}</AuthProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => fetchMock.mockReset())

describe('conversation list', () => {
  it('shows the other participant of each conversation, most recent first', async () => {
    mockApi({ '/conversations/1': conversations })
    renderPage(<Home />)

    const items = await screen.findAllByRole('link', { name: /Elodie|Jeremie|Patrick/ })
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Elodie'),
      expect.stringContaining('Jeremie'),
      expect.stringContaining('Patrick'),
    ])
    expect(items[0]).toHaveAttribute('href', '/conversations/3')
  })

  it('shows an empty state when there is no conversation', async () => {
    mockApi({ '/conversations/1': [] })
    renderPage(<Home />)

    expect(await screen.findByText('Aucune conversation pour le moment.')).toBeInTheDocument()
  })

  it('shows an error with a working Retry button when the server fails', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 503))
    renderPage(<Home />)

    const alert = await screen.findByRole('alert')
    mockApi({ '/conversations/1': conversations })
    await userEvent.click(within(alert).getByRole('button', { name: 'Réessayer' }))

    expect(await screen.findByRole('link', { name: /Jeremie/ })).toBeInTheDocument()
  })
})

describe('conversation thread', () => {
  it('shows the messages of the selected conversation, oldest first', async () => {
    mockApi({ '/conversations/1': conversations, '/messages/1': messages })
    renderPage(<ConversationPage />, { id: '1' })

    expect(await screen.findByRole('heading', { level: 1, name: 'Jeremie' })).toBeInTheDocument()
    const bubbles = await screen.findAllByText(/vélo|dispo/)
    expect(bubbles.map((bubble) => bubble.textContent)).toEqual([
      'Je vends mon vélo',
      'Bonjour, toujours dispo ?',
    ])
    expect(screen.getByRole('link', { name: /Jeremie/ })).toHaveAttribute('aria-current', 'page')
  })

  it.each([
    ['an invalid id', 'abc'],
    ['a conversation of another user', '99'],
  ])('shows "not found" for %s without loading messages', async (_case, id) => {
    mockApi({ '/conversations/1': conversations })
    renderPage(<ConversationPage />, { id })

    expect(await screen.findByText('Conversation introuvable')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('/messages/'),
      expect.anything(),
    )
  })
})
