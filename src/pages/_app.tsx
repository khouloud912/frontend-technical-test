import { useState } from 'react'
import type { AppProps } from 'next/app'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createQueryClient } from '@/api/queryClient'
import { AuthProvider } from '@/context/AuthContext'
import '@/styles/globals.scss'

export default function App({ Component, pageProps }: AppProps) {
  // One client per app instance (never shared between server requests)
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
      {/* Rendered only in development, tree-shaken from the production bundle */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  )
}
