export interface Message {
  id: number
  conversationId: number
  authorId: number
  timestamp: number
  body: string
}

/** Client-only state of a message that is not saved on the server yet. */
export type MessageStatus = 'sending' | 'failed'

/**
 * A message as displayed in a thread. Messages typed by the user get a negative
 * temporary id and a `status` until the server confirms them.
 */
export interface ThreadMessage extends Message {
  status?: MessageStatus
}
