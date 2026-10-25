import { PITCH, RESEARCH_GAP, RESEARCH_GAP_NOTE } from './evidence'
import styles from './EvidenceInfographic.module.css'

const TONE: Record<string, string> = {
  deep: styles.gapDeep,
  grey: styles.gapGrey,
  accent: styles.gapAccent,
}

export function ClosingStatement() {
  return (
    <div className={styles.pitch}>
      <h3 className={styles.statement}>
        Health systems<br />cannot <span className={styles.yellow}>respond</span><br />to what they<br />
        <span className={styles.blue}>do not count</span>
      </h3>

      <div className={styles.gapRow} aria-label="Share of heat and pregnancy research by country income">
        {RESEARCH_GAP.map((g) => (
          <div key={g.pct} className={styles.gapItem}>
            <div className={`${styles.gapCircle} ${TONE[g.tone]}`} style={{ width: g.size, height: g.size }}>
              {g.size > 40 ? `${g.pct}%` : ''}
            </div>
            <span className={g.tone === 'accent' ? styles.orange : undefined}>
              {g.tone === 'accent' && <b>{g.pct}% </b>}
              {g.label[0]}<br />{g.label[1]}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.gapNote}>{RESEARCH_GAP_NOTE}</p>

      <p className={styles.pitchK}>Proposed solution</p>
      {PITCH.map((p) => <p key={p.slice(0, 20)} className={styles.pitchP}>{p}</p>)}
    </div>
  )
}
