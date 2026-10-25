import * as Plot from '@observablehq/plot'
import { useCallback } from 'react'
import type { District } from '../../api'
import { CUTS, colourOf, fmtDay } from '../../levels'
import { token } from '../../styles/tokens'
import { PlotFigure } from '../../ui/PlotFigure/PlotFigure'
import { SourceNote } from '../../ui/SourceNote/SourceNote'
import styles from './DistrictPanel.module.css'

type Props = { district: District; day: number; issuedUtc: string }

// 7-day Tmax bars in level colours, with the threshold lines; the chosen day is outlined
export function TempForecastChart({ district, day, issuedUtc }: Props) {
  const make = useCallback(
    (width: number): Plot.PlotOptions => {
      const days = district.days.map((d, i) => ({ ...d, label: fmtDay(d.date, { weekday: 'short', day: 'numeric' }), i }))
      const top = Math.max(42, ...days.map((d) => d.tmax + 3))
      const ink = token('--ink')
      return {
        width, height: 220, marginRight: 96, marginLeft: 36,
        x: { domain: days.map((d) => d.label), label: null, padding: 0.25 },
        y: { domain: [15, top], label: '°C', grid: false },
        marks: [
          Plot.barY(days, {
            x: 'label', y1: 15, y2: 'tmax', fill: (d) => colourOf[d.level as keyof typeof colourOf],
            stroke: (d) => (d.i === day ? ink : 'none'), strokeWidth: 2, rx: 3,
          }),
          Plot.text(days, { x: 'label', y: 'tmax', text: (d) => `${d.tmax}°`, dy: -8, fill: ink, fontWeight: 600 }),
          Plot.ruleY(CUTS, { y: 'value', stroke: token('--rule'), strokeDasharray: '3,3' }),
          Plot.text(CUTS, { y: 'value', text: 'label', frameAnchor: 'right', textAnchor: 'start', dx: 6, fill: token('--ink-muted') }),
        ],
      }
    },
    [district, day],
  )

  return (
    <div>
      <h3 className={styles.chartHeading}>7-day maximum temperature (°C)</h3>
      <PlotFigure make={make} />
      <SourceNote>Forecast: Open-Meteo, issued {issuedUtc.replace('T', ' ').replace('Z', ' UTC')}.</SourceNote>
    </div>
  )
}
