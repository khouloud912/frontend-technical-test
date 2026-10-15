import styles from './Avatar.module.scss'

/** Must match the length of $avatar-colors in _variables.scss */
const AVATAR_COLOR_COUNT = 8

interface AvatarProps {
  userId: number
  name: string
  size?: 'sm' | 'md'
}

/** Same user, same color. Decorative: the name is always shown next to it. */
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
