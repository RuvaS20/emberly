import { ChartSection } from '../ChartSection'
import { AfricaLollipop } from './AfricaLollipop'
import { ClosingStatement } from './ClosingStatement'
import { ElNinoStrip } from './ElNinoStrip'
import styles from './EvidenceInfographic.module.css'
import { FactorCloud } from './FactorCloud'
import { FieldStudy } from './FieldStudy'
import { OutcomeBubbles } from './OutcomeBubbles'
import { RiskCurve } from './RiskCurve'
import { ABOUT, SOURCES } from './evidence'

// A summary of the published evidence on heat and pregnancy. Every figure here comes
// from the papers in SOURCES, not from the API, so nothing on this page changes daily.
export function EvidenceInfographic() {
  return (
    <ChartSection id="chart-evidence">
      <h2 className={styles.title}>
        <span className={`${styles.tag} ${styles.tagOrange}`}>heat</span> &amp;{' '}
        <span className={`${styles.tag} ${styles.tagBlue}`}>pregnancy</span> — what does the evidence say?
      </h2>

      <OutcomeBubbles />
      <ElNinoStrip />

      <div className={`${styles.section} ${styles.cols}`}>
        <RiskCurve />
        <FieldStudy />
      </div>

      <FactorCloud />

      <div className={`${styles.section} ${styles.cols}`}>
        <AfricaLollipop />
        <ClosingStatement />
      </div>

      <div className={styles.foot}>
        <h4>About this graphic</h4>
        <p className={styles.about}>{ABOUT}</p>
        <h4>Sources</h4>
        <ol className={styles.refs}>
          {SOURCES.map((s) => <li key={s.key}>{s.text}</li>)}
        </ol>
      </div>
    </ChartSection>
  )
}
