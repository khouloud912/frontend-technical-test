import type { Conversation } from '@/types/conversation'
import { formatDayLabel, formatShortDate } from '@/utils/formatDate'
import { getLoggedUserId } from '@/utils/getLoggedUserId'
import { getOtherParticipant } from '@/utils/getOtherParticipant'

// TZ is forced to UTC in jest.config.js. Timestamps are UNIX seconds, like the API.
const NOW = new Date('2021-07-07T15:00:00Z')
const seconds = (iso: string) => Date.parse(iso) / 1000

describe('formatDayLabel', () => {
  it.each([
    ['2021-07-07T08:00:00Z', "Aujourd'hui"],
    ['2021-07-06T23:59:59Z', 'Hier'],
    ['2021-07-05T12:00:00Z', 'lundi 5 juillet 2021'],
  ])('%s -> %s', (iso, expected) => {
    expect(formatDayLabel(seconds(iso), NOW)).toBe(expected)
  })
})

describe('formatShortDate', () => {
  it.each([
    [seconds('2021-07-07T08:30:00Z'), '08:30'],
    [seconds('2020-03-12T08:30:00Z'), '12 mars 2020'],
    [NaN, ''],
  ])('%p -> "%s"', (timestamp, expected) => {
    expect(formatShortDate(timestamp, NOW)).toBe(expected)
  })
})

describe('getOtherParticipant', () => {
  const conversation: Conversation = {
    id: 1,
    senderId: 1,
    senderNickname: 'Thibaut',
    recipientId: 2,
    recipientNickname: 'Jeremie',
    lastMessageTimestamp: 1625637849,
  }

  it('returns the person the logged user is talking to', () => {
    expect(getOtherParticipant(conversation, 1)).toEqual({ id: 2, nickname: 'Jeremie' })
    expect(getOtherParticipant(conversation, 2)).toEqual({ id: 1, nickname: 'Thibaut' })
  })
})

describe('getLoggedUserId', () => {
  it('should return logged user id', () => {
    expect(getLoggedUserId()).toEqual(1)
  })
})
