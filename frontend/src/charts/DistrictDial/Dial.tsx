import { arc, range } from 'd3'
import { useState } from 'react'
import { fmtChange } from '../format'
import styles from './Dial.module.css'
import { CENTRE, R_LABEL, R_PROVINCE, SIZE, arcPath, dialLayout, pointAt, rad } from './dialLayout'
import type { DialData, DialDistrict } from './useHistory'

type Props = {
  data: DialData
  selected: DialDistrict
  onSelect: (d: DialDistrict) => void
}

const colourOf = (d: { change: number }) => (d.change > 0 ? 'var(--chart-hotter)' : 'var(--chart-cooler)')
const trim = (name: string) => (name.length > 18 ? `${name.slice(0, 17)}…` : name)

export function Dial({ data, selected, onSelect }: Props) {
  const { spokes, provinces, radius, maxDays, step, rInner, rOuter } = dialLayout(data.districts)
  const ticks = range(50, maxDays + 1, 50)
  const wedge = arc<{ startAngle: number; endAngle: number }>().innerRadius(rInner - 10).outerRadius(R_PROVINCE - 22)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.dial} onPointerLeave={() => setHovered(null)}>
      {/* Scale rings, labelled in the gap at the top */}
      <g>
        {ticks.map((t) => (
          <circle key={t} cx={CENTRE} cy={CENTRE} r={radius(t)} fill="none" stroke="var(--line)" strokeDasharray="2,4" />
        ))}
        {ticks.map((t, i) => (
          <text key={t} className={styles.ringLabel} x={CENTRE} y={CENTRE - radius(t) + 3} textAnchor="middle">
            {i === ticks.length - 1 ? `${t} days/yr` : t}
          </text>
        ))}
      </g>

      {/* Province arcs with curved labels */}
      <g>
        {provinces.map((p, i) => (
          <g key={p.name}>
            <path d={arcPath(R_PROVINCE - 14, p.start, p.end, false)} fill="none" stroke="var(--rule)" strokeWidth={3} />
            {/* Label path runs wider than the arc so short province names still fit */}
            <path id={`dial-prov-${i}`} fill="none" d={arcPath(p.flip ? R_PROVINCE + 2 : R_PROVINCE - 4, p.mid - 25, p.mid + 25, p.flip)} />
            <text className={styles.province}>
              <textPath href={`#dial-prov-${i}`} startOffset="50%" textAnchor="middle">{p.name}</textPath>
            </text>
          </g>
        ))}
      </g>

      {/* Spokes: the 1980s dot, the 2020s dot and the gap between them */}
      <g>
        {spokes.map((d) => {
          const dim = hovered != null && hovered !== d.id
          const [tx, ty] = pointAt(R_LABEL, d.angle)
          return (
            <g key={d.id} opacity={dim ? 0.35 : 1}>
              <line
                x1={pointAt(rInner, d.angle)[0]} y1={pointAt(rInner, d.angle)[1]}
                x2={pointAt(rOuter, d.angle)[0]} y2={pointAt(rOuter, d.angle)[1]}
                stroke="var(--line)"
              />
              <line
                x1={pointAt(radius(d.then), d.angle)[0]} y1={pointAt(radius(d.then), d.angle)[1]}
                x2={pointAt(radius(d.now), d.angle)[0]} y2={pointAt(radius(d.now), d.angle)[1]}
                stroke="var(--ink-muted)" strokeWidth={1.25} strokeDasharray="1.5,2.5"
              />
              <circle
                cx={pointAt(radius(d.then), d.angle)[0]} cy={pointAt(radius(d.then), d.angle)[1]}
                r={3.5} fill="var(--surface)" stroke="var(--chart-then)" strokeWidth={1.5}
              />
              <circle
                cx={pointAt(radius(d.now), d.angle)[0]} cy={pointAt(radius(d.now), d.angle)[1]}
                r={5} fill={colourOf(d)} stroke="var(--surface)" strokeWidth={1.5}
              />
              <text
                className={d.id === selected.id ? `${styles.district} ${styles.active}` : styles.district}
                transform={`translate(${tx},${ty}) rotate(${d.angle < 180 ? d.angle - 90 : d.angle + 90})`}
                textAnchor={d.angle < 180 ? 'start' : 'end'} dy="0.35em"
              >
                {trim(d.name)}
              </text>
              {/* A wedge from the centre hole out to the labels, so the whole sector is hoverable */}
              <path
                transform={`translate(${CENTRE},${CENTRE})`} fill="transparent"
                d={wedge({ startAngle: rad(d.angle - step / 2), endAngle: rad(d.angle + step / 2) }) ?? undefined}
                onPointerEnter={() => { setHovered(d.id); onSelect(d) }}
              >
                <title>{`${d.name}: ${fmtChange(d.change)} days a year`}</title>
              </path>
            </g>
          )
        })}
      </g>

      {/* Centre */}
      <text x={CENTRE} y={CENTRE - 18} textAnchor="middle" className={styles.bigPct}>{data.pct}%</text>
      {['of districts now have more', 'pregnancy-risk heat days', 'than in the 1980s'].map((line, i) => (
        <text key={line} x={CENTRE} y={CENTRE + 18 + i * 19} textAnchor="middle" className={styles.centreLine}>{line}</text>
      ))}
      <text x={CENTRE} y={CENTRE + 90} textAnchor="middle" className={styles.centreChange}>
        {fmtChange(data.meanChange)} days a year on average
      </text>
    </svg>
  )
}
