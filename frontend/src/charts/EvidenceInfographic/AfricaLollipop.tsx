import { scaleLinear } from 'd3'
import { AFRICA_GROUPS, AFRICA_SOURCE } from './evidence'
import styles from './EvidenceInfographic.module.css'

const W = 520, H = 400
const BASE = 330          // the zero rule the stems stand on
const y = scaleLinear([0, 100], [BASE, 55])

// Lay the six lollipops out evenly, with a gap between groups
const SLOT_W = 66
const firstX = 76
const GROUP_GAP = 0.35

type LaidOutItem = { pct: number; label: string[]; accent?: boolean; x: number }
type LaidOutGroup = {
  group: string
  tone: 'blue' | 'yellow'
  items: LaidOutItem[]
  ruleX: number
  top: number
}

// Walk the groups once to turn slot numbers into x positions
const LAID_OUT: LaidOutGroup[] = []
let nextSlot = 0
for (const g of AFRICA_GROUPS) {
  const items: LaidOutItem[] = g.items.map((item, i) => ({ ...item, x: firstX + (nextSlot + i) * SLOT_W }))
  LAID_OUT.push({
    group: g.group,
    tone: g.tone,
    items,
    ruleX: firstX + nextSlot * SLOT_W - 22,
    // Clear of the tallest value label in the group, so the tag never sits on a number
    top: Math.min(...items.map((i) => y(i.pct))) - 44,
  })
  nextSlot += g.items.length + GROUP_GAP
}

export function AfricaLollipop() {
  return (
    <div>
      <h3 className={styles.colH}>
        In <span className={styles.blue}>sub-Saharan Africa</span>, the toll lands{' '}
        <span className={styles.yellow}>hardest around birth</span>
      </h3>
      <div className={styles.chartK}>
        Extra risk of death after extreme heat
        <small>grouped by when the heat strikes</small>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
        aria-label="Lollipop chart of extra death risk in Africa by timing of heat exposure">
        <text className={styles.moreRisk} x={14} y={70}>MORE</text>
        <text className={styles.moreRisk} x={14} y={82}>RISK</text>
        <line x1={22} y1={120} x2={22} y2={92} stroke="var(--ink-faint)" />
        <path d="M18 96 22 89 26 96" fill="none" stroke="var(--ink-faint)" />

        {LAID_OUT.map(({ items, ruleX: start, top, ...g }) => {
          const colour = g.tone === 'blue' ? 'var(--evidence-blue)' : 'var(--evidence-yellow)'
          const chipW = g.group.length * 6 + 12

          return (
            <g key={g.group}>
              <line x1={start} y1={top} x2={start} y2={BASE} stroke={colour} />
              <rect x={start} y={top - 10} width={chipW} height={18} rx={2}
                fill={g.tone === 'blue' ? 'var(--evidence-blue-deep)' : 'var(--evidence-yellow)'} />
              <text className={styles.groupTag} x={start + 6} y={top + 3}
                fill={g.tone === 'blue' ? '#ffffff' : '#241c00'}>{g.group}</text>

              {items.map((item) => (
                <g key={item.label.join()}>
                  <line x1={item.x} y1={BASE} x2={item.x} y2={y(item.pct)} stroke="var(--line-strong)" strokeWidth={2} />
                  <circle cx={item.x} cy={y(item.pct)} r={7} fill="var(--surface)" strokeWidth={2}
                    stroke={item.accent ? 'var(--evidence-orange)' : 'var(--line-strong)'} />
                  <text className={styles.lolliValue} x={item.x} y={y(item.pct) - 15} textAnchor="middle"
                    fill={item.accent ? 'var(--evidence-orange)' : 'var(--ink)'}>+{item.pct}%</text>
                  <text className={styles.lolliLabel} x={item.x} y={BASE} dy="1.5em" textAnchor="middle">{item.label[0]}</text>
                  {item.label[1] && (
                    <text className={styles.lolliLabel} x={item.x} y={BASE} dy="2.6em" textAnchor="middle">{item.label[1]}</text>
                  )}
                </g>
              ))}
            </g>
          )
        })}

        <line x1={40} y1={BASE} x2={W - 20} y2={BASE} stroke="var(--ink-faint)" />
        <text className={styles.axisNote} x={W / 2} y={392} textAnchor="middle">when the heat strikes →</text>
      </svg>

      <p className={styles.sources}><b>sources</b> {AFRICA_SOURCE}</p>
    </div>
  )
}
