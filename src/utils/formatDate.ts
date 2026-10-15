import { MESSAGES } from '@/constants/messages'

const LOCALE = 'fr-FR'

// Intl formatters are costly to create: build them once per module
const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' })
const shortDateWithYearFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const fullDateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'full', timeStyle: 'short' })

/** The API uses UNIX timestamps in seconds; Date expects milliseconds. */
export const fromUnixSeconds = (seconds: number): Date => new Date(seconds * 1000)

export const toUnixSeconds = (date: Date = new Date()): number => Math.floor(date.getTime() / 1000)

const isValidTimestamp = (seconds: number): boolean => Number.isFinite(seconds) && seconds >= 0

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/** Calendar-day difference (DST safe): 0 = same day, 1 = yesterday… */
const daysBetween = (date: Date, now: Date): number =>
  Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)

/** "14:05" */
export function formatTime(seconds: number): string {
  if (!isValidTimestamp(seconds)) return ''
  return timeFormatter.format(fromUnixSeconds(seconds))
}

/** Day separators in a thread: "Aujourd'hui", "Hier" or "mercredi 7 juillet 2021". */
export function formatDayLabel(seconds: number, now: Date = new Date()): string {
  if (!isValidTimestamp(seconds)) return ''
  const date = fromUnixSeconds(seconds)
  const days = daysBetween(date, now)
  if (days === 0) return MESSAGES.date.today
  if (days === 1) return MESSAGES.date.yesterday
  return dayFormatter.format(date)
}

/** Compact date for the conversation list: "14:05", "Hier", "7 juil." or "7 juil. 2021". */
export function formatShortDate(seconds: number, now: Date = new Date()): string {
  if (!isValidTimestamp(seconds)) return ''
  const date = fromUnixSeconds(seconds)
  const days = daysBetween(date, now)
  if (days === 0) return timeFormatter.format(date)
  if (days === 1) return MESSAGES.date.yesterday
  return date.getFullYear() === now.getFullYear()
    ? shortDateFormatter.format(date)
    : shortDateWithYearFormatter.format(date)
}

/** Inline sentence ending: "aujourd'hui à 14:05", "hier à 14:05" or "le lundi 5 juillet 2021 à 14:05". */
export function formatRelativeDateTime(seconds: number, now: Date = new Date()): string {
  if (!isValidTimestamp(seconds)) return ''
  const days = daysBetween(fromUnixSeconds(seconds), now)
  const day = formatDayLabel(seconds, now)
  const prefix = days === 0 || days === 1 ? day.toLowerCase() : `le ${day}`
  return `${prefix} à ${formatTime(seconds)}`
}

/** "mercredi 7 juillet 2021 à 05:44" (screen readers, tooltips) */
export function formatFullDate(seconds: number): string {
  if (!isValidTimestamp(seconds)) return ''
  return fullDateFormatter.format(fromUnixSeconds(seconds))
}

/** Machine-readable value for <time dateTime>. */
export function toISODate(seconds: number): string {
  if (!isValidTimestamp(seconds)) return ''
  return fromUnixSeconds(seconds).toISOString()
}
