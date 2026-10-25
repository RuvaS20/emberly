import { extent, max, scaleLinear, scaleSqrt } from 'd3'
import { useMemo, useState } from 'react'
import type { Alert } from '../../api'
import { CUTS, colourOf, fmtDay } from '../../levels'
import { RiskLegend } from '../../features/map/RiskLegend'
import { Tooltip, type TipPosition } from '../../ui/Tooltip/Tooltip'
import tip from '../../ui/Tooltip/Tooltip.module.css'
import { ChartSection, ChartSource } from '../ChartSection'
import { fmtC } from '../format'
import styles from './AlertsScatter.module.css'
import { NO_FILTERS, ScatterFilters, type Filters } from './ScatterFilters'
import { alertPoints, provincesOf, type AlertPoint } from './alertPoints'

const W = 1200, H = 620
const M = { top: 40, right: 28, bottom: 64, left: 72 }
const LABELLED = 12          // only the biggest bubbles get a direct label

export function AlertsScatter({ alert }: { alert: Alert }) {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [hover, setHover] = useState<{ at: TipPosition; point: AlertPoint } | null>(null)

  const points = useMemo(() => alertPoints(alert), [alert])
  const provinces = useMemo(() => provincesOf(points), [points])

  const search = filters.search.trim().toLowerCase()
  const shown = points.filter(
    (p) => (filters.province === 'all' || p.province === filters.province) && (!search || p.name.toLowerCase().includes(search)),
  )

  // Scales stay on the full dataset so filtering never moves the axes
  const [xLo, xHi] = extent(points, (p) => p.p95) as [number, number]
  const [yLo, yHi] = extent(points, (p) => p.peakTmax) as [number, number]
  const x = scaleLinear([Math.floor(xLo - 1), Math.ceil(xHi + 1)], [M.left, W - M.right]).nice()
  const y = scaleLinear([Math.floor(yLo - 1), Math.ceil(yHi + 1)], [H - M.bottom, M.top]).nice()
  const r = scaleSqrt([0, max(points, (p) => p.extraPreterm) ?? 1], [3, 34])

  // Label the biggest bubbles among those on screen
  const labelled = new Set([...shown].sort((a, b) => b.extraPreterm - a.extraPreterm).slice(0, LABELLED).map((p) => p.id))

  // The y = x line, clipped to the plot area: above it the forecast beats the district's own baseline
  const dLo = Math.max(x.domain()[0], y.domain()[0])
  const dHi = Math.min(x.domain()[1], y.domain()[1])

  return (
    <ChartSection id="chart-alerts-scatter">
      <h2 className={styles.title}>District heat alerts</h2>
      <p className={styles.sub}>
        Each district’s hottest forecast day against its own historical baseline, for the week from {fmtDay(alert.date)}.
        Bubble size is the estimated extra preterm births that week. Above the diagonal, the forecast beats the district’s
        own 95th percentile.
      </p>

      <div className={styles.legend}><RiskLegend /></div>

      <ScatterFilters
        provinces={provinces} value={filters} onChange={setFilters}
        shown={shown.length} total={points.length}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} onPointerLeave={() => setHover(null)}
        role="img" aria-label={`Scatter plot of ${points.length} districts: historical 95th percentile against forecast peak temperature`}>
        <g className={styles.axis}>
          {y.ticks(6).map((t) => (
            <g key={t}>
              <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
              <text x={M.left - 10} y={y(t)} dy="0.32em" textAnchor="end">{t}°</text>
            </g>
          ))}
          {x.ticks(8).map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={M.top} y2={H - M.bottom} />
              <text x={x(t)} y={H - M.bottom} dy="1.6em" textAnchor="middle">{t}°C</text>
            </g>
          ))}
        </g>

        <text className={styles.axisTitle} x={M.left - 10} y={M.top - 16} textAnchor="start">Forecast peak Tmax (°C)</text>
        <text className={styles.axisTitle} x={(M.left + W - M.right) / 2} y={H - 12} textAnchor="middle">
          District’s historical 95th percentile (NASA POWER)
        </text>

        {/* Threshold lines: these carry meaning, unlike the grid, so they are dashed */}
        {CUTS.filter((c) => c.value >= y.domain()[0] && c.value <= y.domain()[1]).map((c) => (
          <g key={c.value}>
            <line className={styles.threshold} x1={M.left} x2={W - M.right} y1={y(c.value)} y2={y(c.value)} />
            <text className={styles.thresholdLabel} x={M.left + 6} y={y(c.value)} dy="-0.45em">{c.label}</text>
          </g>
        ))}

        <line className={styles.diagonal} x1={x(dLo)} y1={y(dLo)} x2={x(dHi)} y2={y(dHi)} />

        {/* Biggest first, so small bubbles stay clickable on top */}
        {[...shown].sort((a, b) => b.extraPreterm - a.extraPreterm).map((p) => (
          <circle
            key={p.id} cx={x(p.p95)} cy={y(p.peakTmax)} r={r(p.extraPreterm)}
            fill={colourOf[p.level]} fillOpacity={0.8}
            stroke="var(--surface)" strokeWidth={2}
            className={styles.bubble}
            onPointerEnter={(e) => setHover({ at: { x: e.clientX, y: e.clientY }, point: p })}
            onPointerMove={(e) => setHover((h) => (h?.point === p ? { ...h, at: { x: e.clientX, y: e.clientY } } : h))}
          />
        ))}

        {shown.filter((p) => labelled.has(p.id)).map((p) => (
          <text
            key={p.id} className={styles.bubbleLabel} x={x(p.p95)} y={y(p.peakTmax) - r(p.extraPreterm) - 5}
            textAnchor="middle" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke"
          >
            {p.name}
          </text>
        ))}
      </svg>

      <Tooltip at={hover?.at ?? null}>
        {hover && (
          <>
            <b>{hover.point.name}</b><br />
            <span className={tip.label}>Province:</span> {hover.point.province}<br />
            <span className={tip.label}>Peak forecast:</span> {fmtC(hover.point.peakTmax)} on {fmtDay(hover.point.peakDate)}<br />
            <span className={tip.label}>Its 95th pct:</span> {fmtC(hover.point.p95)}<br />
            <span className={tip.label}>Peak risk level:</span> {hover.point.level}<br />
            <span className={tip.label}>Extra preterm:</span> {hover.point.extraPreterm.toFixed(1)} births this week
          </>
        )}
      </Tooltip>

      <ChartSource>
        Baseline: each district’s historical 95th-percentile daily maximum (NASA POWER, 1981–present). Forecast: Open-Meteo, issued{' '}
        {alert.generated_utc.replace('T', ' ').replace('Z', ' UTC')}. Risk levels follow Heil et al. 2026 preterm-birth thresholds.
        Extra preterm births are modelled estimates, not predictions for any person or clinic. Districts without a baseline are
        left out. Only the {LABELLED} largest bubbles are labelled; hover any bubble for its figures.
      </ChartSource>
    </ChartSection>
  )
}
