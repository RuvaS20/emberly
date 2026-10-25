import { ascending, groups, max, scaleLinear } from 'd3'
import type { DialDistrict } from './useHistory'

export const SIZE = 1100
export const CENTRE = SIZE / 2
const R_INNER = 175          // centre hole, where the headline figure sits
const R_OUTER = 365          // the 0 → maxDays radial range ends here
export const R_LABEL = R_OUTER + 14
export const R_PROVINCE = 500
const GAP_TOP = 16           // degrees left clear at the top for the ring labels
const PROV_GAP = 1.6         // blank slots between one province and the next

export const rad = (deg: number) => (deg * Math.PI) / 180
export const pointAt = (radius: number, deg: number): [number, number] =>
  [CENTRE + radius * Math.sin(rad(deg)), CENTRE - radius * Math.cos(rad(deg))]

export type Spoke = DialDistrict & { angle: number }
export type ProvinceArc = { name: string; start: number; end: number; mid: number; flip: boolean }

// One spoke per district, grouped into province wedges running clockwise from the top
export function dialLayout(districts: DialDistrict[]) {
  const maxDays = Math.ceil((max(districts, (d) => Math.max(d.then, d.now)) ?? 0) / 50) * 50
  const radius = scaleLinear([0, maxDays], [R_INNER, R_OUTER])

  const byProvince = groups(districts, (d) => d.province).sort((a, b) => ascending(a[0], b[0]))
  byProvince.forEach(([, ds]) => ds.sort((a, b) => b.change - a.change))

  const slots = districts.length + PROV_GAP * (byProvince.length - 1)
  const step = (360 - GAP_TOP) / slots

  const spokes: Spoke[] = []
  const provinces: ProvinceArc[] = []
  let slot = 0
  for (const [name, ds] of byProvince) {
    const first = GAP_TOP / 2 + (slot + 0.5) * step
    for (const d of ds) spokes.push({ ...d, angle: GAP_TOP / 2 + (slot++ + 0.5) * step })
    const last = GAP_TOP / 2 + (slot - 1 + 0.5) * step
    const mid = (first - step / 2 + last + step / 2) / 2
    provinces.push({ name, start: first - step / 2, end: last + step / 2, mid, flip: mid > 90 && mid < 270 })
    slot += PROV_GAP
  }

  return { spokes, provinces, radius, maxDays, step, rInner: R_INNER, rOuter: R_OUTER }
}

// Arc for a curved province label. Bottom-half labels run the other way so they read upright.
export function arcPath(radius: number, a0: number, a1: number, flip: boolean) {
  const [x0, y0] = pointAt(radius, flip ? a1 : a0)
  const [x1, y1] = pointAt(radius, flip ? a0 : a1)
  return `M${x0},${y0} A${radius},${radius} 0 ${a1 - a0 > 180 ? 1 : 0} ${flip ? 0 : 1} ${x1},${y1}`
}
