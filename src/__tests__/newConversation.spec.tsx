import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { AuthProvider } from '@/context/AuthContext'
import Home from '@/pages'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))

// jsdom does not implement <dialog> methods
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
}

// Logged user is 1 (Thibaut), already talking with Jeremie (conversation #1)
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
const users = [
  { id: 1, nickname: 'Thibaut', token: 'xxxx' },
  { id: 2, nickname: 'Jeremie', token: 'xxxx' },
  { id: 5, nickname: 'Manon', token: 'xxxx' },
]

const json = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data })

const postConversation = jest.fn()
global.fetch = jest.fn(async (url: string, init?: RequestInit) => {
  if (init?.method === 'POST') return postConversation(JSON.parse(String(init.body)))
  if (url.endsWith('/conversations/1')) return json(conversations)
  if (url.endsWith('/users')) return json(users)
  return json({}, 404)
}) as unknown as typeof fetch

const push = jest.fn()

async function openDialog() {
  jest.mocked(useRouter).mockReturnValue({ query: {}, isReady: true, push } as never)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Home />
      </AuthProvider>
    </QueryClientProvider>,
  )
  const user = userEvent.setup()
  await screen.findByRole('link', { name: /Jeremie/ }) // conversations loaded
  await user.click(screen.getByRole('button', { name: 'Nouvelle conversation' }))
  const dialog = screen.getByRole('dialog', { name: 'Nouvelle conversation' })
  await within(dialog).findByRole('button', { name: /Manon/ }) // users loaded
  return { user, dialog }
}

beforeEach(() => {
  postConversation.mockReset()
  push.mockReset()
})

describe('new conversation', () => {
  it('lists every user except the logged-in user', async () => {
    const { dialog } = await openDialog()

    expect(within(dialog).getByRole('button', { name: /Jeremie/ })).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: /Thibaut/ })).not.toBeInTheDocument()
  })

  it('creates a conversation with a new contact and opens it', async () => {
    postConversation.mockImplementation(async (body) => json({ id: 9, ...body }))
    const { user, dialog } = await openDialog()

    await user.click(within(dialog).getByRole('button', { name: /Manon/ }))

    expect(postConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        senderId: 1,
        senderNickname: 'Thibaut',
        recipientId: 5,
        recipientNickname: 'Manon',
      }),
    )
    expect(push).toHaveBeenCalledWith('/conversations/9')
    expect(dialog).not.toHaveAttribute('open')
  })

  it('opens the existing conversation instead of creating a duplicate', async () => {
    const { user, dialog } = await openDialog()

    await user.click(within(dialog).getByRole('button', { name: /Jeremie/ }))

    expect(push).toHaveBeenCalledWith('/conversations/1')
    expect(postConversation).not.toHaveBeenCalled()
  })

  it('shows an error and keeps the dialog open when the creation fails', async () => {
    postConversation.mockResolvedValue(json({}, 503))
    const { user, dialog } = await openDialog()

    await user.click(within(dialog).getByRole('button', { name: /Manon/ }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      "La conversation n'a pas pu être créée",
    )
    expect(dialog).toHaveAttribute('open')
    expect(push).not.toHaveBeenCalled()
  })
})
