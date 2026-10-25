import type { ReactNode } from 'react'
import styles from './Card.module.css'

type Props = { as?: 'section' | 'aside' | 'div'; gap?: 4 | 5; children: ReactNode }

// White, bordered panel whose children stack in a column
export function Card({ as: Tag = 'div', gap = 4, children }: Props) {
  return <Tag className={`${styles.card} ${gap === 5 ? styles.gap5 : styles.gap4}`}>{children}</Tag>
}
