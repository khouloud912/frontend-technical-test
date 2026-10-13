import { renderHook } from '@testing-library/react'
import { AuthProvider, useLoggedUserId } from '@/context/AuthContext'

describe('AuthContext', () => {
  it('provides the logged user id', () => {
    const { result } = renderHook(useLoggedUserId, { wrapper: AuthProvider })

    expect(result.current).toBe(1)
  })

  it('throws when used outside the provider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => renderHook(useLoggedUserId)).toThrow(/within an AuthProvider/)
  })
})
