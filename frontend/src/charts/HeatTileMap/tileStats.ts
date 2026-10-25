import { quantile, sum } from 'd3'
import type { Alert, District, Level } from '../../api'
import { TILE_PLACES, type TilePlace } from './tilePlaces'

// Same constants the backend estimate uses; see backend/pipeline/estimate.py
const BIRTH_RATE_PER_1000 = 29.9     // crude birth rate per year, World Bank
const PRETERM_SHARE = 0.17           // Blencowe et al. 2012
const WEEKS_PER_YEAR = 52

export type Tile = TilePlace & {
  id: string
  name: string
  province: string
  extraPreterm: number
  extraPretermUpper: number
  peakTmax: number
  extremeDays: number
  population: number | null
  bin: number                        // 0 = coolest band, 4 = hottest
}

export type DayTotal = { date: string; extraPreterm: number; isPeak: boolean }

export type TileStats = {
  tiles: Tile[]
  bins: { from: number; to: number | null }[]
  days: DayTotal[]
  peakDay: { date: string; extremeDistricts: number; highOrWorse: number }
  total: number
  totalUpper: number
  baselineWeeklyPreterm: number
  upliftPct: number
  districtCount: number
  notes: {
    warmestNight: { name: string; tmin: number }
    biggestCount: { name: string; extraPreterm: number; peakTmax: number }
    coolest: { name: string; peakTmax: number }
    hottest: { name: string; tmax: number; date: string }
  }
}

const peakOf = (d: District) => d.days.reduce((a, b) => (b.tmax > a.tmax ? b : a))
const worseThan: Level[] = ['High', 'Extreme']

export function tileStats(alert: Alert): TileStats {
  const districts = alert.districts.filter((d) => TILE_PLACES[d.id])
  const values = districts.map((d) => d.week_extra_preterm ?? 0)

  // Five bands from the data itself, so the legend stays true as the forecast changes
  const cuts = [0.2, 0.4, 0.6, 0.8].map((q) => quantile([...values].sort((a, b) => a - b), q) ?? 0)
  const binOf = (v: number) => cuts.filter((c) => v > c).length
  const bins = [0, 1, 2, 3, 4].map((i) => ({
    from: i === 0 ? Math.min(...values) : cuts[i - 1],
    to: i === 4 ? null : cuts[i],
  }))

  const tiles: Tile[] = districts.map((d) => {
    const peak = peakOf(d)
    const extra = d.week_extra_preterm ?? 0
    return {
      ...TILE_PLACES[d.id],
      id: d.id,
      name: d.name,
      province: d.province,
      extraPreterm: extra,
      extraPretermUpper: d.week_extra_preterm_upper ?? 0,
      peakTmax: peak.tmax,
      extremeDays: d.days.filter((x) => x.level === 'Extreme').length,
      population: d.population,
      bin: binOf(extra),
    }
  })

  // Totals per forecast day
  const dates = districts[0].days.map((x) => x.date)
  const perDay = dates.map((date, i) => ({
    date,
    extraPreterm: sum(districts, (d) => d.days[i].extra_preterm ?? 0),
    extremeDistricts: districts.filter((d) => d.days[i].level === 'Extreme').length,
    highOrWorse: districts.filter((d) => worseThan.includes(d.days[i].level)).length,
  }))
  const peak = perDay.reduce((a, b) => (b.extraPreterm > a.extraPreterm ? b : a))

  // What a normal week would see anyway, from population alone
  const population = sum(districts, (d) => d.population ?? 0)
  const baselineWeeklyPreterm = (population * (BIRTH_RATE_PER_1000 / 1000) * PRETERM_SHARE) / WEEKS_PER_YEAR
  const total = sum(tiles, (t) => t.extraPreterm)

  const pick = <T>(items: T[], score: (t: T) => number) => items.reduce((a, b) => (score(b) > score(a) ? b : a))
  const warmestNightDistrict = pick(districts, (d) => Math.max(...d.days.map((x) => x.tmin)))
  const hottestDistrict = pick(districts, (d) => peakOf(d).tmax)
  const coolestTile = tiles.reduce((a, b) => (b.peakTmax < a.peakTmax ? b : a))
  const biggestTile = pick(tiles, (t) => t.extraPreterm)

  return {
    tiles,
    bins,
    days: perDay.map((d) => ({ date: d.date, extraPreterm: d.extraPreterm, isPeak: d.date === peak.date })),
    peakDay: { date: peak.date, extremeDistricts: peak.extremeDistricts, highOrWorse: peak.highOrWorse },
    total,
    totalUpper: sum(tiles, (t) => t.extraPretermUpper),
    baselineWeeklyPreterm,
    upliftPct: (100 * total) / baselineWeeklyPreterm,
    districtCount: districts.length,
    notes: {
      warmestNight: { name: warmestNightDistrict.name, tmin: Math.max(...warmestNightDistrict.days.map((x) => x.tmin)) },
      biggestCount: { name: biggestTile.name, extraPreterm: biggestTile.extraPreterm, peakTmax: biggestTile.peakTmax },
      coolest: { name: coolestTile.name, peakTmax: coolestTile.peakTmax },
      hottest: { name: hottestDistrict.name, tmax: peakOf(hottestDistrict).tmax, date: peakOf(hottestDistrict).date },
    },
  }
}
