import type { UserSummary } from '@/types/user'
import { request } from './client'
import { userListSchema } from './schemas'

export async function getUsers(signal?: AbortSignal): Promise<UserSummary[]> {
  return request('/users', userListSchema, { signal })
}
