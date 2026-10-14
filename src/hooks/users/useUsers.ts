import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/api/queryKeys'
import { getUsers } from '@/api/users'

interface UseUsersOptions {
  /** Only fetch when needed (e.g. once the dialog is opened). */
  enabled?: boolean
}

/** Every user of the platform. Rarely changes: never considered stale during a session. */
export function useUsers({ enabled = true }: UseUsersOptions = {}) {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: ({ signal }) => getUsers(signal),
    staleTime: Infinity,
    enabled,
  })
}
