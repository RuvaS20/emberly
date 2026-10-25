import { FETAL_STRAIN, FIELD_SOURCE, MECHANISM } from './evidence'
import styles from './EvidenceInfographic.module.css'
import { LagChart } from './LagChart'
import { MECHANISM_ICONS } from './icons/MechanismIcons'

export function FieldStudy() {
  return (
    <div>
      <h3 className={styles.colH}>
        Field studies of pregnant farmers in <span className={styles.blue}>The Gambia</span> show{' '}
        <span className={styles.yellow}>how</span> heat reaches the baby
      </h3>

      <div className={styles.icons}>
        {MECHANISM.map((m) => {
          const Icon = MECHANISM_ICONS[m.icon]
          return (
            <div key={m.icon}>
              <Icon />
              {m.text} <span className={styles.blue}>{m.strong}</span>{m.after ? ` ${m.after}` : ''}
            </div>
          )
        })}
      </div>

      <div className={styles.ringsK}>
        SIGNS OF FETAL STRAIN
        <small>observed during working shifts</small>
      </div>
      <div className={styles.rings}>
        {FETAL_STRAIN.map((r) => (
          <div key={r.value} className={styles.ring}>
            <div
              className={r.accent ? `${styles.ringC} ${styles.ringAccent}` : styles.ringC}
              style={{ width: r.size, height: r.size }}
            >
              {r.value}
            </div>
            <div className={styles.ringL}>{r.label[0]}<br />{r.label[1]}</div>
          </div>
        ))}
      </div>

      <LagChart />

      <p className={styles.sources}><b>sources</b> {FIELD_SOURCE}</p>
    </div>
  )
}
