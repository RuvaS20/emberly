import type { FeatureCollection } from 'geojson'

export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type Level = 'Normal' | 'Caution' | 'High' | 'Extreme'

export type Day = {
  date: string
  tmax: number
  tmin: number
  level: Level
  base_level: Level
  boosted: boolean
  added_risk: number
  extra_preterm: number | null
  extra_preterm_upper: number | null
}

export type District = {
  id: string
  name: string
  province: string
  population: number | null
  p95: number | null
  days: Day[]
  week_extra_preterm: number | null
  week_extra_preterm_upper: number | null
}

export type Alert = {
  date: string
  generated_utc: string
  label: string
  sources: string[]
  districts: District[]
}

export type Anchor = {
  fingerprint: string
  tx_hash: string
  block: number
  explorer_tx: string
  anchored_utc: string
}

export type AlertBundle = { alert: Alert; fingerprint: string; anchor: Anchor | null }

export type Verification = {
  date: string
  status: 'verified' | 'tampered' | 'not_anchored'
  fingerprint: string
  onchain_fingerprint: string | null
  anchored_at: string | null
  explorer_tx: string | null
}

export type HistoryYear = { year: number; days_at_or_above_30: number; days_recorded: number; partial: boolean }
export type History = Record<string, { name: string; province: string; years: HistoryYear[] }>

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API + path, init)
  if (!r.ok) {
    const body = await r.json().catch(() => null)
    throw new Error(body?.detail ?? `${r.status} ${r.statusText}`)
  }
  return r.json()
}

export const api = {
  alerts: () => get<string[]>('/alerts'),
  alert: (date: string) => get<AlertBundle>(`/alerts/${date}`),
  districts: () => get<FeatureCollection>('/districts'),
  history: () => get<History>('/history'),
  verifyDate: (date: string) => get<Verification>(`/verify/${date}`),
  verifyUpload: (file: unknown) =>
    get<Verification>('/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(file),
    }),
}
