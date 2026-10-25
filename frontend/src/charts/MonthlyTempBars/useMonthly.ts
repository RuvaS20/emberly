import { max, mean, min, range } from 'd3'
import { useEffect, useState } from 'react'

// Written by backend/pipeline/monthly.py
const URL = `${import.meta.env.BASE_URL}data/monthly_anomaly.json`

type MonthlyFile = {
  districts: number
  source: string
  rows: { year: number; month: number; tmax: number }[]
}

export type Point = { year: number; value: number }

export type Period = {
  name: string
  sub: string
  label: (year: number) => string
  data: Point[]
}

export type MonthlyData = {
  periods: Period[]
  annual: Period
  years: number[]
  lo: number
  hi: number
  districts: number
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Southern Hemisphere seasons; summer spans the new year and is labelled by its January
const SEASONS = [
  { name: 'Summer', note: 'Dec–Feb', months: [12, 1, 2] },
  { name: 'Autumn', note: 'Mar–May', months: [3, 4, 5] },
  { name: 'Winter', note: 'Jun–Aug', months: [6, 7, 8] },
  { name: 'Spring', note: 'Sep–Nov', months: [9, 10, 11] },
]

// Gaussian-weighted average of nearby years; bandwidth is in years
export function smooth(data: Point[], bw = 5): Point[] {
  return data.map(({ year }) => {
    let sumW = 0, sumV = 0
    for (const d of data) {
      const w = Math.exp(-0.5 * ((d.year - year) / bw) ** 2)
      sumW += w
      sumV += w * d.value
    }
    return { year, value: sumV / sumW }
  })
}

function build(file: MonthlyFile): MonthlyData {
  const byKey = new Map(file.rows.map((r) => [`${r.year}-${r.month}`, r.tmax]))
  const years = range(min(file.rows, (r) => r.year)!, max(file.rows, (r) => r.year)! + 1)

  // A period only counts for a year when every month it needs is present
  const avg = (keys: string[]) => (keys.every((k) => byKey.has(k)) ? mean(keys, (k) => byKey.get(k)!)! : null)
  const series = (fn: (year: number) => number | null) =>
    years.map((y) => ({ year: y, value: fn(y) })).filter((d): d is Point => d.value != null)

  const annual: Period = {
    name: 'Annual', sub: 'Jan–Dec', label: (y) => `${y}`,
    data: series((y) => avg(range(1, 13).map((m) => `${y}-${m}`))),
  }

  const periods: Period[] = [
    ...MONTHS.map((name, i) => ({ name, sub: '', label: (y: number) => `${y}`, data: series((y) => avg([`${y}-${i + 1}`])) })),
    annual,
    ...SEASONS.map((s) => ({
      name: s.name,
      sub: s.note,
      label: (y: number) => (s.months[0] === 12 ? `${y - 1}–${String(y).slice(2)}` : `${y}`),
      data: series((y) => avg(s.months.map((m) => `${m === 12 ? y - 1 : y}-${m}`))),
    })),
  ]

  const all = periods.flatMap((p) => p.data.map((d) => d.value))
  return { periods, annual, years, lo: min(all)!, hi: max(all)!, districts: file.districts }
}

export function useMonthly() {
  const [data, setData] = useState<MonthlyData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetch(URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${r.statusText}`))))
      .then((file: MonthlyFile) => live && setData(build(file)))
      .catch((e: Error) => live && setError(e.message))
    return () => { live = false }
  }, [])

  return { data, error }
}
