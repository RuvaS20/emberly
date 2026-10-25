import { mean } from 'd3'
import { useEffect, useState } from 'react'
import { api } from '../../api'

export const THEN: [number, number] = [1981, 1990]
export const NOW: [number, number] = [2016, 2025]

export type DialYear = { year: number; days: number }

export type DialDistrict = {
  id: string
  name: string
  province: string
  years: DialYear[]
  then: number
  now: number
  change: number
  rank: number        // 1 = largest increase
}

export type DialData = {
  districts: DialDistrict[]
  hotter: number      // how many districts now get more hot days
  pct: number
  meanChange: number
}

const avgOver = (years: DialYear[], [a, b]: [number, number]) =>
  mean(years.filter((y) => y.year >= a && y.year <= b), (y) => y.days) ?? 0

// Yearly counts of days at or above 30.05°C per district, with each one's 1980s and 2020s averages
export function useHistory() {
  const [data, setData] = useState<DialData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    api.history().then((history) => {
      if (!live) return
      const districts = Object.entries(history).map(([id, d]) => {
        // Part-years would drag an average down, so only whole ones count
        const years = d.years.filter((y) => !y.partial).map((y) => ({ year: y.year, days: y.days_at_or_above_30 }))
        const then = avgOver(years, THEN)
        const now = avgOver(years, NOW)
        return { id, name: d.name, province: d.province, years, then, now, change: now - then, rank: 0 }
      })
      ;[...districts].sort((a, b) => b.change - a.change).forEach((d, i) => (d.rank = i + 1))

      const hotter = districts.filter((d) => d.change > 0).length
      setData({
        districts,
        hotter,
        pct: Math.round((100 * hotter) / districts.length),
        meanChange: mean(districts, (d) => d.change) ?? 0,
      })
    }).catch((e) => live && setError(e.message))
    return () => { live = false }
  }, [])

  return { data, error }
}
