import { line, scaleLinear } from 'd3'
import { RISK_CURVE } from './evidence'
import styles from './EvidenceInfographic.module.css'

const W = 480, H = 340
const PLOT = { top: 60, right: 30, bottom: 40, left: 50 }

export function RiskCurve() {
  const x = scaleLinear([20, 40], [PLOT.left, W - PLOT.right])
  const y = scaleLinear([0, 22], [H - PLOT.bottom, PLOT.top])
  const pts = RISK_CURVE.points
  const path = line<{ tmax: number; pct: number }>().x((d) => x(d.tmax)).y((d) => y(d.pct))

  return (
    <div>
      <h3 className={styles.colH}>
        Risk climbs with every degree, and <span className={styles.yellow}>specific temperatures</span> can be{' '}
        <span className={styles.blue}>mapped</span>
      </h3>
      <div className={styles.chartK}>
        Preterm birth risk by daily max temperature
        <small>pooled thresholds, global meta-analysis</small>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img"
        aria-label="Preterm birth risk rises from no added risk at 24.5 degrees to plus 20 percent at 38.6 degrees">
        <defs>
          <linearGradient id="riskFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--evidence-blue)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--evidence-blue)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className={styles.grid}>
          {[5, 10, 15, 20].map((p) => (
            <g key={p}>
              <line x1={PLOT.left} x2={W - PLOT.right} y1={y(p)} y2={y(p)} />
              <text x={PLOT.left - 8} y={y(p)} dy="0.32em" textAnchor="end">+{p}%</text>
            </g>
          ))}
        </g>
        <text className={styles.axisNote} x={PLOT.left} y={PLOT.top - 18}>↑ extra preterm birth risk</text>

        <line x1={PLOT.left} y1={y(0)} x2={W - PLOT.right} y2={y(0)} stroke="var(--ink-faint)" />
        <g className={styles.grid}>
          {[20, 25, 30, 35, 40].map((t) => (
            <text key={t} x={x(t)} y={y(0)} dy="1.5em" textAnchor="middle">{t}°C</text>
          ))}
        </g>
        <text className={styles.axisNote} x={(PLOT.left + W - PLOT.right) / 2} y={H - 6} textAnchor="middle">
          daily maximum temperature (Tmax)
        </text>

        {/* Where risk starts to rise in 14 lower-middle income countries */}
        <line x1={x(RISK_CURVE.lmicTmax)} y1={y(19)} x2={x(RISK_CURVE.lmicTmax)} y2={y(0)} stroke="var(--evidence-yellow)" strokeWidth={1.5} />
        <circle cx={x(RISK_CURVE.lmicTmax)} cy={y(0)} r={5} fill="var(--surface)" stroke="var(--evidence-yellow)" strokeWidth={1.5} />
        <text className={styles.lmic}>
          {RISK_CURVE.lmicNote.map((lineText, i) => (
            <tspan key={lineText} x={x(RISK_CURVE.lmicTmax) + 8} y={y(18) + i * 15} fontWeight={i === RISK_CURVE.lmicNote.length - 1 ? 500 : 400}>
              {lineText}
            </tspan>
          ))}
        </text>

        {/* Below 24.5°C the pooled estimate shows no added risk */}
        <path d={`${path(pts)!}L${x(pts.at(-1)!.tmax)},${y(0)}L${x(pts[0].tmax)},${y(0)}Z`} fill="url(#riskFill)" />
        <line x1={PLOT.left} y1={y(0)} x2={x(pts[0].tmax)} y2={y(0)} stroke="var(--evidence-blue)" strokeWidth={2} strokeDasharray="4 4" />
        <path d={path(pts)!} fill="none" stroke="var(--evidence-blue)" strokeWidth={2.5} />
        {pts.map((p) => (
          <circle key={p.tmax} cx={x(p.tmax)} cy={y(p.pct)} r={p.pct === 20 ? 6 : 5} fill="var(--surface)" stroke="var(--evidence-blue)" strokeWidth={2} />
        ))}

        {pts.map((p) => {
          if (!p.chip) {
            // Sits just under the curve, on the pale gradient, so it never crosses the line
            return <text key={p.tmax} className={styles.pointLabel} x={x(p.tmax) + 10} y={y(p.pct) + 16}>{p.label}</text>
          }
          // The 24.5°C chip goes left along the flat dashed run; the 38.6°C one above the last point
          const flat = p.pct === 0
          const cx = flat ? (x(20) + x(p.tmax)) / 2 : x(p.tmax) - 12
          const cy = flat ? y(0) - 26 : y(p.pct) - 26
          const w = p.label.length * 6.6 + 14
          return (
            <g key={p.tmax}>
              <rect x={cx - w / 2} y={cy - 14} width={w} height={20} rx={3} fill="var(--evidence-blue-deep)" />
              <text className={styles.chipText} x={cx} y={cy} textAnchor="middle">{p.label}</text>
            </g>
          )
        })}
      </svg>

      <p className={styles.sources}><b>sources</b> {RISK_CURVE.source}</p>
    </div>
  )
}
