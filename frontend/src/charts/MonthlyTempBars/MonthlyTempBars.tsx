import { interpolateRgb, line, piecewise, range, scaleBand, scaleLinear, scaleSequential, curveCatmullRom } from 'd3'
import { useMemo, useState } from 'react'
import { token } from '../../styles/tokens'
import { Tooltip, type TipPosition } from '../../ui/Tooltip/Tooltip'
import tip from '../../ui/Tooltip/Tooltip.module.css'
import { ChartMessage, ChartSection, ChartSource } from '../ChartSection'
import { fmtC, fmtDeltaC } from '../format'
import styles from './MonthlyTempBars.module.css'
import { MIN_SPAN, YearRange } from './YearRange'
import { smooth, useMonthly, type Period, type Point } from './useMonthly'

const W = 1400, H = 560
const M = { top: 64, right: 8, bottom: 28, left: 52 }
const PANEL_GAP = 6

type Hover = { at: TipPosition; period: Period; point: Point }

export function MonthlyTempBars() {
  const { data, error } = useMonthly()
  const [span, setSpan] = useState<[number, number] | null>(null)
  const [hover, setHover] = useState<Hover | null>(null)

  const heatRamp = useMemo(() => [0, 1, 2, 3, 4].map((i) => token(`--heat-${i}`)), [])

  if (error) return <ChartSection id="chart-monthly-temp"><ChartMessage>Couldn’t load monthly temperatures: {error}</ChartMessage></ChartSection>
  if (!data) return <ChartSection id="chart-monthly-temp"><ChartMessage>Loading monthly temperatures…</ChartMessage></ChartSection>

  const firstYear = data.years[0], lastYear = data.years.at(-1)!
  const [from, to] = span ?? [firstYear, lastYear]

  const colour = scaleSequential([data.lo, data.hi], piecewise(interpolateRgb, heatRamp))
  const fx = scaleBand(data.periods.map((p) => p.name), [M.left, W - M.right]).paddingInner(0)
  const y = scaleLinear([0, Math.ceil(data.hi + 2)], [H - M.bottom, M.top])
  const inRange = (d: Point) => d.year >= from && d.year <= to

  const annualTrend = smooth(data.annual.data.filter(inRange))

  return (
    <ChartSection id="chart-monthly-temp">
      <div className={styles.top}>
        <div>
          <h2 className={styles.title}>Zimbabwe’s temperature rising</h2>
          <p className={styles.sub}>
            Average daily maximum temperature by month, year and season, {from}–{to}. The smoothed national annual average went
            from {fmtC(annualTrend[0].value)} to {fmtC(annualTrend.at(-1)!.value)}.
          </p>
        </div>
        <div className={styles.meta}>
          <p>Data source: NASA POWER daily maximum temperature (T2M_MAX) at the centre of each of Zimbabwe’s {data.districts} districts</p>
          <p>Thresholds context: Heil et al. 2026, preterm birth risk rises from 30.05°C daily max</p>
        </div>
      </div>

      <YearRange
        min={firstYear} max={lastYear} from={from} to={to}
        onChange={(a, b) => setSpan([Math.max(firstYear, a), Math.min(lastYear, b)])}
      />

      <div className={styles.scroller}>
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart} onPointerLeave={() => setHover(null)}>
          {/* Grid and °C axis */}
          <g className={styles.axis}>
            {y.ticks(8).map((t) => (
              <g key={t}>
                <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
                <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{t}°C</text>
              </g>
            ))}
          </g>
          <line x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} stroke="var(--ink-faint)" />

          {data.periods.map((p, i) => {
            const bars = p.data.filter(inRange)
            const x0 = fx(p.name)!, pw = fx.bandwidth()
            const x = scaleBand(range(from, to + 1), [x0 + PANEL_GAP / 2, x0 + pw - PANEL_GAP / 2]).paddingInner(0.15)
            const trend = bars.length >= 3 ? smooth(bars) : null
            const centre = (d: Point) => x(d.year)! + x.bandwidth() / 2
            const path = line<Point>().x(centre).y((d) => y(d.value)).curve(curveCatmullRom)
            const change = trend ? trend.at(-1)!.value - trend[0].value : 0

            return (
              <g key={p.name}>
                {i > 0 && <line className={styles.sep} x1={x0} x2={x0} y1={M.top - 44} y2={H - M.bottom} />}
                <text className={styles.panelTitle} x={x0 + pw / 2} y={20} textAnchor="middle">{p.name}</text>
                {p.sub && <text className={styles.panelSub} x={x0 + pw / 2} y={34} textAnchor="middle">{p.sub}</text>}

                {bars.map((d) => (
                  <rect
                    key={d.year} x={x(d.year)} width={Math.max(1, x.bandwidth())}
                    y={y(d.value)} height={y(0) - y(d.value)}
                    fill={hover?.point === d ? 'var(--ink)' : colour(d.value)}
                    onPointerEnter={(e) => setHover({ at: { x: e.clientX, y: e.clientY }, period: p, point: d })}
                    onPointerMove={(e) => setHover((h) => (h?.point === d ? { ...h, at: { x: e.clientX, y: e.clientY } } : h))}
                  />
                ))}

                {trend && (
                  <>
                    {/* White underlay so the trend line stays legible over the bars */}
                    <path d={path(trend)!} fill="none" stroke="var(--surface)" strokeWidth={4} strokeOpacity={0.7} />
                    <path d={path(trend)!} fill="none" stroke="var(--chart-trend)" strokeWidth={1.75} />
                    <text
                      className={styles.change} x={x0 + pw / 2} y={52} textAnchor="middle"
                      fill={change > 0 ? 'var(--accent)' : 'var(--chart-cooler)'}
                    >
                      {fmtDeltaC(change)}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <Tooltip at={hover?.at ?? null}>
        {hover && (
          <>
            <span className={tip.label}>Year:</span> {hover.period.label(hover.point.year)}<br />
            <span className={tip.label}>Period:</span> {hover.period.name}{hover.period.sub && ` (${hover.period.sub})`}<br />
            <span className={tip.label}>Avg daily max:</span> <b>{fmtC(hover.point.value)}</b>
          </>
        )}
      </Tooltip>

      <ChartSource>
        Bars: average of every day’s maximum temperature in that period, averaged across all {data.districts} district centres with
        equal weight. Line: smoothed trend (Gaussian, 5-year bandwidth). Change label: smoothed value at the end minus at the start
        of the selected range. Incomplete months (under 90% of days) and incomplete years or seasons are left out. The sliders keep
        at least {MIN_SPAN} years in view. Source: NASA POWER.
      </ChartSource>
    </ChartSection>
  )
}
