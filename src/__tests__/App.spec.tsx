import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import App from '../pages'

global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] })

describe('App', () => {
  it('should render correctly App', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Messages' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'leboncoin' })).toBeInTheDocument()
    expect(await screen.findByText('Aucune conversation pour le moment.')).toBeInTheDocument()
  })
})
