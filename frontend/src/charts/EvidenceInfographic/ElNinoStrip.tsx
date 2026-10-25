import { EL_NINO_BARS, EL_NINO_SOURCE } from './evidence'
import styles from './EvidenceInfographic.module.css'

const widest = Math.max(...EL_NINO_BARS.map((b) => b.value))

export function ElNinoStrip() {
  return (
    <>
      <div className={styles.nino}>
        <div className={styles.ninoHead}>And a <span className={styles.orange}>record El Niño</span> is building right now</div>
        {EL_NINO_BARS.map((b) => (
          <div key={b.label} className={styles.ninoRow}>
            <div className={styles.ninoLabel}>{b.label}<br /><span className={styles.muted}>{b.sub}</span></div>
            <div
              className={b.tone === 'now' ? `${styles.bar} ${styles.barNow}` : `${styles.bar} ${styles.barPast}`}
              style={{ width: `${(b.value / widest) * 100}%` }}
            >
              +{b.value.toFixed(1)}°C{b.suffix ?? ''}
            </div>
          </div>
        ))}
      </div>
      <p className={styles.sources}><b>source</b> {EL_NINO_SOURCE}</p>
    </>
  )
}
