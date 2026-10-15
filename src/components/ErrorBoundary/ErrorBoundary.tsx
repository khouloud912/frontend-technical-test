import { Component, type ErrorInfo, type ReactNode } from 'react'
import { StatusMessage } from '@/components/StatusMessage/StatusMessage'
import { MESSAGES } from '@/constants/messages'
import { reportError } from '@/utils/reportError'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/** A class component: React has no hook equivalent of componentDidCatch. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { componentStack: info.componentStack })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main style={{ display: 'flex', minHeight: '100dvh' }}>
        <StatusMessage
          variant="error"
          title={MESSAGES.errors.crash}
          description={MESSAGES.errors.crashHint}
          retryLabel={MESSAGES.errors.reload}
          onRetry={() => window.location.reload()}
        />
      </main>
    )
  }
}
