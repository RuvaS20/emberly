import { scaleLinear } from 'd3'
import { LAG } from './evidence'
import styles from './EvidenceInfographic.module.css'

const W = 440, H = 112
const AXIS = 84
const ROW_TOP = [18, 50]     // one row per outcome, so the two labels never collide
const x = scaleLinear([0, 7], [20, 420])

const colourOf = (tone: string) => (tone === 'blue' ? 'var(--evidence-blue)' : 'var(--evidence-yellow)')

export function LagChart() {
  return (
    <div className={styles.lag}>
      <div className={styles.lagK}>How fast harm follows a hot day</div>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
        aria-label="Preterm birth risk peaks 0 to 1 days after heat, stillbirth 3 to 5 days after">
        {LAG.map((band, i) => (
          <g key={band.name}>
            <text className={styles.lagLabel} x={x(band.from)} y={ROW_TOP[i] - 4} fill={colourOf(band.tone)}>
              {band.name}
            </text>
            <rect x={x(band.from)} y={ROW_TOP[i]} width={x(band.to) - x(band.from)} height={16} fill={colourOf(band.tone)} />
          </g>
        ))}

        <line x1={x(0)} y1={AXIS} x2={x(7)} y2={AXIS} stroke="var(--ink-faint)" />
        <g className={styles.lagTick}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((d) => (
            <text key={d} x={x(d)} y={AXIS + 18} textAnchor="middle">{d === 0 ? 'day 0' : d}</text>
          ))}
        </g>
      </svg>
    </div>
  )
}
