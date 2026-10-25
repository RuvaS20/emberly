import { FACTORS, FACTORS_SOURCE, FACTOR_ASIDES, UNKNOWNS } from './evidence'
import styles from './EvidenceInfographic.module.css'
import { ClockIcon, PinIcon } from './icons/AsideIcons'

const TONE: Record<string, string> = {
  blue: styles.cb,
  'blue-dim': styles.cb2,
  yellow: styles.cy,
  'yellow-dim': styles.cy2,
}

export function FactorCloud() {
  return (
    <div className={styles.section}>
      <h3 className={styles.cloudH}>
        Heat in pregnancy is made worse by many<br />
        <span className={styles.blue}>environmental</span> &amp; <span className={styles.yellow}>social</span> factors
      </h3>
      <p className={styles.cloudSub}>size = how strongly the cited studies link it to harm (indicative, not a risk score)</p>

      <div className={styles.cloudWrap}>
        <div className={styles.aside}>
          <div className={styles.asideIcon}><ClockIcon /></div>
          <span className={styles.blue}>{FACTOR_ASIDES.left.stat}</span> {FACTOR_ASIDES.left.text}
        </div>

        <p className={styles.cloud}>
          {FACTORS.map((f) => (
            <span key={f.text} className={`${styles[`w${f.size}`]} ${TONE[f.tone]}`}>{f.text}</span>
          ))}
        </p>

        <div className={`${styles.aside} ${styles.asideRight}`}>
          <div className={styles.asideIcon}><PinIcon /></div>
          {FACTOR_ASIDES.right}
        </div>
      </div>

      <div className={styles.unknown}>
        <div className={styles.unknownLine}>WHAT WE STILL DON’T KNOW</div>
        <div className={styles.unknownItems}>
          {UNKNOWNS.map((u, i) => (
            <span key={u} className={i === 1 ? styles.unknownStrong : undefined}>{u}</span>
          ))}
        </div>
      </div>

      <p className={styles.sources}><b>sources</b> {FACTORS_SOURCE}</p>
    </div>
  )
}
