import type { Alert, District, Level } from '../../api'

export type AlertPoint = {
  id: string
  name: string
  province: string
  p95: number
  peakTmax: number
  peakDate: string
  level: Level            // level on the district's hottest forecast day
  extraPreterm: number
  extremeDays: number
}

const peakDay = (d: District) => d.days.reduce((a, b) => (b.tmax > a.tmax ? b : a))

// One point per district: its hottest forecast day against its own historical baseline
export function alertPoints(alert: Alert): AlertPoint[] {
  return alert.districts
    .filter((d): d is District & { p95: number } => d.p95 != null)
    .map((d) => {
      const peak = peakDay(d)
      return {
        id: d.id,
        name: d.name,
        province: d.province,
        p95: d.p95,
        peakTmax: peak.tmax,
        peakDate: peak.date,
        level: peak.level,
        extraPreterm: d.week_extra_preterm ?? 0,
        extremeDays: d.days.filter((x) => x.level === 'Extreme').length,
      }
    })
}

export const provincesOf = (points: AlertPoint[]) =>
  [...new Set(points.map((p) => p.province))].sort((a, b) => a.localeCompare(b))
