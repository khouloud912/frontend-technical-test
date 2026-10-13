import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { AuthProvider } from '@/context/AuthContext'
import ConversationPage from '@/pages/conversations/[id]'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))

const conversation = {
  id: 1,
  senderId: 1,
  senderNickname: 'Thibaut',
  recipientId: 2,
  recipientNickname: 'Jeremie',
  lastMessageTimestamp: 1625637849,
}
const existingMessage = {
  id: 1,
  conversationId: 1,
  authorId: 2,
  timestamp: 1625637849,
  body: 'Toujours dispo ?',
}

const json = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data })

// Small in-memory server: POST /messages/1 is driven by each test, and the messages
// it saves are returned by the next GET (like json-server)
let savedMessages: unknown[] = []
const postMessage = jest.fn()
const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
  if (init?.method === 'POST') {
    const response = await postMessage(JSON.parse(String(init.body)))
    if (response.ok) savedMessages.push(await response.json())
    return response
  }
  if (url.endsWith('/conversations/1')) return json([conversation])
  if (url.endsWith('/messages/1')) return json([existingMessage, ...savedMessages])
  return json({}, 404)
})
global.fetch = fetchMock as unknown as typeof fetch

const savedMessage = (body: { body: string; timestamp: number }) =>
  json({ id: 42, conversationId: 1, authorId: 1, ...body })

async function renderThread() {
  jest.mocked(useRouter).mockReturnValue({ query: { id: '1' }, isReady: true } as never)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ConversationPage />
      </AuthProvider>
    </QueryClientProvider>,
  )
  await screen.findByText('Toujours dispo ?')
  return {
    user: userEvent.setup(),
    textbox: screen.getByRole('textbox', { name: 'Votre message' }),
    sendButton: screen.getByRole('button', { name: 'Envoyer le message' }),
  }
}

beforeEach(() => {
  postMessage.mockReset()
  savedMessages = []
})

describe('sending a message', () => {
  it('sends the trimmed message on Enter, shows it at once and keeps focus', async () => {
    let resolvePost: (value: unknown) => void = () => undefined
    postMessage.mockImplementation((body) => {
      return new Promise((resolve) => (resolvePost = () => resolve(savedMessage(body))))
    })
    const { user, textbox } = await renderThread()

    await user.type(textbox, '  Oui, il est dispo  {Enter}')

    // Optimistic: visible before the server answers
    expect(screen.getByText('Oui, il est dispo')).toBeInTheDocument()
    expect(screen.getByText('Envoi…')).toBeInTheDocument()
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 1, authorId: 1, body: 'Oui, il est dispo' }),
    )
    expect(textbox).toHaveValue('')
    expect(textbox).toHaveFocus()

    resolvePost(undefined)
    await waitFor(() => expect(screen.queryByText('Envoi…')).not.toBeInTheDocument())
    expect(screen.getByText('Oui, il est dispo')).toBeInTheDocument()
  })

  it('adds a new line on Shift+Enter instead of sending', async () => {
    const { user, textbox } = await renderThread()

    await user.type(textbox, 'Bonjour{Shift>}{Enter}{/Shift}à demain')

    expect(textbox).toHaveValue('Bonjour\nà demain')
    expect(postMessage).not.toHaveBeenCalled()
  })

  it.each([
    ['an empty', ''],
    ['a whitespace-only', '   '],
  ])('never sends %s message', async (_case, text) => {
    const { user, textbox, sendButton } = await renderThread()

    if (text) await user.type(textbox, text)
    await user.type(textbox, '{Enter}')

    expect(sendButton).toBeDisabled()
    expect(postMessage).not.toHaveBeenCalled()
  })

  it('does not send twice while a message is being sent', async () => {
    postMessage.mockReturnValue(new Promise(() => undefined)) // server never answers
    const { user, textbox, sendButton } = await renderThread()

    await user.type(textbox, 'Premier{Enter}')
    await user.type(textbox, 'Second{Enter}')

    expect(sendButton).toBeDisabled()
    expect(postMessage).toHaveBeenCalledTimes(1)
    // The second message is kept in the field, not lost
    expect(textbox).toHaveValue('Second')
  })

  it('keeps a failed message visible and resends it with Réessayer', async () => {
    postMessage.mockResolvedValueOnce(json({}, 503))
    const { user, textbox } = await renderThread()

    await user.type(textbox, 'Je passe demain{Enter}')

    expect(await screen.findByText('Non envoyé', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Je passe demain')).toBeInTheDocument()

    postMessage.mockImplementationOnce(async (body) => savedMessage(body))
    await user.click(screen.getByRole('button', { name: "Réessayer l'envoi du message" }))

    await waitFor(() =>
      expect(screen.queryByText('Non envoyé', { exact: false })).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Je passe demain')).toBeInTheDocument()
    expect(postMessage).toHaveBeenCalledTimes(2)
  })
})
