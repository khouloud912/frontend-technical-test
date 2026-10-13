import { createContext, useContext, type ReactNode } from 'react'
import { getLoggedUserId } from '@/utils/getLoggedUserId'

const AuthContext = createContext<number | null>(null)

interface AuthProviderProps {
  children: ReactNode
  /** Defaults to the mocked logged user; overridable in tests. */
  userId?: number
}

/**
 * Authentication is mocked: this provider is the only place to change once a
 * real session (cookie / token) exists.
 */
export function AuthProvider({ children, userId = getLoggedUserId() }: AuthProviderProps) {
  return <AuthContext.Provider value={userId}>{children}</AuthContext.Provider>
}

export function useLoggedUserId(): number {
  const userId = useContext(AuthContext)
  if (userId === null) {
    throw new Error('useLoggedUserId must be used within an AuthProvider')
  }
  return userId
}
