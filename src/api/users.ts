import type { UserSummary } from '@/types/user'
import { ApiError, assertValidId, request } from './client'
import { userListSchema } from './schemas'

export async function getUsers(signal?: AbortSignal): Promise<UserSummary[]> {
  return request('/users', userListSchema, { signal })
}

/** GET /user/:id is rewritten to /users?id=… and therefore answers an array. */
export async function getUser(userId: number, signal?: AbortSignal): Promise<UserSummary> {
  assertValidId(userId, 'userId')
  const [user] = await request(`/user/${userId}`, userListSchema, { signal })
  if (!user) throw new ApiError(404, `User ${userId} not found`)
  return user
}
