import type { Level } from '../../api'
import { colourOf } from '../../levels'
import styles from './RiskBadge.module.css'

// The level name on its level colour
export function RiskBadge({ level }: { level: Level }) {
  return <span className={styles.badge} style={{ background: colourOf[level] }}>{level}</span>
}
