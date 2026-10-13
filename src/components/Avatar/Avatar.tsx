import styles from './Avatar.module.scss'

/** Must match the length of $avatar-colors in _variables.scss */
const AVATAR_COLOR_COUNT = 8

interface AvatarProps {
  userId: number
  name: string
  size?: 'sm' | 'md'
}

/**
 * Initial on a color derived from the user id: the same person always gets the
 * same color. Decorative (the name is always displayed next to it).
 */
export function Avatar({ userId, name, size = 'md' }: AvatarProps) {
  const colorIndex = Math.abs(userId) % AVATAR_COLOR_COUNT
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <span
      className={`${styles.avatar} ${styles[`avatar--${size}`]} ${styles[`avatar--color-${colorIndex}`]}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
