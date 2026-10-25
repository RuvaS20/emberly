import type { ReactNode } from 'react'
import styles from './ChartSection.module.css'

// The bordered panel each dashboard chart sits in, in place of its old iframe
export function ChartSection({ id, children }: { id: string; children: ReactNode }) {
  return <section id={id} className={styles.section}>{children}</section>
}

export function ChartSource({ children }: { children: ReactNode }) {
  return <p className={styles.source}>{children}</p>
}

export function ChartMessage({ children }: { children: ReactNode }) {
  return <p className={styles.message}>{children}</p>
}
