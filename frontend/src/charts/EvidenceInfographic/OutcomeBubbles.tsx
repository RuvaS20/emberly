import { OUTCOMES, OUTCOMES_SOURCE } from './evidence'
import styles from './EvidenceInfographic.module.css'

// Circle area is proportional to the percentage increase in risk
const diameter = (pct: number) => 16 * Math.sqrt(pct)

export function OutcomeBubbles() {
  return (
    <>
      <p className={styles.lede}>
        Large meta-analyses find heat raises the risk of <span className={styles.blue}>almost every birth outcome measured</span>,
        and the risk is <span className={styles.yellow}>far higher in poorer countries</span>
      </p>

      <div className={styles.bubbles}>
        {OUTCOMES.map((o, i) => {
          const d = diameter(o.pct)
          return (
            <div key={i} className={styles.bub}>
              <div className={styles.bubTop}>{o.outcome}<br /><span className={styles.muted}>{o.exposure}</span></div>
              <div className={styles.dot} style={{ width: d, height: d }}>
                {o.inside && (
                  <>
                    <span className={styles.dotSub}>{o.inside}</span>
                    <span className={styles.dotNum}>+{o.pct}%</span>
                  </>
                )}
              </div>
              <div className={styles.bubVal}>{o.inside ? ' ' : `+${o.pct}%`}</div>
              <div className={styles.bubBot}>{o.note}</div>
            </div>
          )
        })}
      </div>
      <p className={styles.sources}><b>sources</b> {OUTCOMES_SOURCE}</p>
    </>
  )
}
