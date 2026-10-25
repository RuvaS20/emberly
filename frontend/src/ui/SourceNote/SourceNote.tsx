import type { ReactNode } from 'react'
import styles from './SourceNote.module.css'

// Small grey line naming where a figure's data comes from
export function SourceNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>
}
