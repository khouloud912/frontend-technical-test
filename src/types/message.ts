export interface Message {
  id: number
  conversationId: number
  authorId: number
  timestamp: number
  body: string
}

/** Client-only state of a message that is not saved on the server yet. */
type MessageStatus = 'sending' | 'failed'

/** Typed messages get a negative temporary id and a status until the server confirms them. */
export interface ThreadMessage extends Message {
  status?: MessageStatus
}
