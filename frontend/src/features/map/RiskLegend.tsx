import { LEVELS } from '../../levels'
import styles from './RiskLegend.module.css'

export function RiskLegend() {
  return (
    <div className={styles.legend}>
      {LEVELS.map((l) => (
        <span key={l.name} className={styles.item}>
          <span className={styles.swatch} style={{ background: l.colour }} />
          <span className={styles.name}>{l.name}</span>
          <span className={styles.range}>{l.range}</span>
        </span>
      ))}
    </div>
  )
}
