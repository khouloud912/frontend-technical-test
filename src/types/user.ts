export interface User {
  id: number
  nickname: string
  token: string
}

/** User data exposed to the UI: the token is never kept client-side. */
export type UserSummary = Pick<User, 'id' | 'nickname'>
