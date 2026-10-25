import { max, scaleBand, scaleLinear } from 'd3'
import { fmtChange, fmtDays, ordinal } from '../format'
import styles from './DistrictDetail.module.css'
import { NOW, THEN, type DialDistrict } from './useHistory'

const W = 340, H = 230
const M = { top: 16, right: 8, bottom: 24, left: 32 }
const X_TICKS = [1985, 1995, 2005, 2015, 2025]

const colourOf = (d: { change: number }) => (d.change > 0 ? 'var(--chart-hotter)' : 'var(--chart-cooler)')
const inside = ([a, b]: [number, number], year: number) => year >= a && year <= b

type Props = { district: DialDistrict; total: number }

// Name, the two decade averages, and a bar per year with each decade's average drawn over it
export function DistrictDetail({ district: d, total }: Props) {
  const colour = colourOf(d)
  const x = scaleBand(d.years.map((y) => y.year), [M.left, W - M.right]).paddingInner(0.2)
  const y = scaleLinear([0, Math.max(100, max(d.years, (v) => v.days) ?? 0) * 1.12], [H - M.bottom, M.top]).nice()
  const yTicks = y.ticks(5)

  return (
    <>
      <h3 className={styles.name}>{d.name}</h3>
      <p className={styles.province}>{d.province} Province</p>

      <div className={styles.stats}>
        <div>
          <div className={styles.label}>1981–1990 average</div>
          <div className={styles.value}>{fmtDays(d.then)} <span className={styles.unit}>days/yr</span></div>
        </div>
        <div>
          <div className={styles.label}>2016–2025 average</div>
          <div className={styles.value} style={{ color: colour }}>{fmtDays(d.now)} <span className={styles.unit}>days/yr</span></div>
        </div>
      </div>

      <p className={styles.change}>
        <b style={{ color: colour }}>{fmtChange(d.change)} days a year</b> at or above 30°C.{' '}
        {d.change > 0 ? `${ordinal(d.rank)} largest increase` : `${ordinal(total - d.rank + 1)} largest decrease`} of {total} districts.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className={styles.yearly} role="img"
        aria-label={`Days a year at or above 30°C in ${d.name}, ${d.years[0]?.year} to ${d.years.at(-1)?.year}`}>
        <g className={styles.axis}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text x={M.left - 6} y={y(t)} dy="0.32em" textAnchor="end">{t}</text>
            </g>
          ))}
          {X_TICKS.filter((t) => x(t) != null).map((t) => (
            <text key={t} x={x(t)! + x.bandwidth() / 2} y={H - M.bottom} dy="1.3em" textAnchor="middle">{t}</text>
          ))}
        </g>

        {d.years.map((v) => (
          <rect
            key={v.year} x={x(v.year)} width={x.bandwidth()} y={y(v.days)} height={y(0) - y(v.days)}
            fill={inside(THEN, v.year) ? 'var(--chart-then)' : inside(NOW, v.year) ? colour : 'var(--line)'}
          />
        ))}

        {/* Each decade average, drawn across its own decade and labelled with a halo so it reads over the bars */}
        {([[THEN, d.then, 'var(--ink-muted)'], [NOW, d.now, colour]] as const).map(([span, value, labelColour]) => {
          const x0 = x(span[0]), x1 = x(span[1])
          if (x0 == null || x1 == null) return null
          const right = x1 + x.bandwidth()
          return (
            <g key={span[0]}>
              <line x1={x0} x2={right} y1={y(value)} y2={y(value)} stroke="var(--ink)" strokeWidth={2} />
              <text
                x={(x0 + right) / 2} y={y(value) - 6} textAnchor="middle" className={styles.avgLabel}
                fill={labelColour} stroke="var(--surface-muted)" strokeWidth={4} paintOrder="stroke"
              >
                avg {fmtDays(value)}
              </text>
            </g>
          )
        })}
      </svg>

      <p className={styles.hint}>Hover over a district on the dial to see its details.</p>
    </>
  )
}
