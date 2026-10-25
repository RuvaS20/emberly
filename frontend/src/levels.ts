import type { Level } from './api'
import { token } from './styles/tokens'

// Mirrors backend/pipeline/classify.py (Heil et al. 2026 preterm-birth thresholds, daily Tmax)
export const LEVELS: { name: Level; colour: string; range: string }[] = [
  { name: 'Normal', colour: token('--level-normal'), range: '< 30.05°C' },
  { name: 'Caution', colour: token('--level-caution'), range: '30.05–33.34°C' },
  { name: 'High', colour: token('--level-high'), range: '33.34–38.64°C' },
  { name: 'Extreme', colour: token('--level-extreme'), range: '≥ 38.64°C' },
]

export const CUTS = [
  { value: 30.05, label: 'Caution 30.05°C' },
  { value: 33.34, label: 'High 33.34°C' },
  { value: 38.64, label: 'Extreme 38.64°C' },
]

export const colourOf = Object.fromEntries(LEVELS.map((l) => [l.name, l.colour])) as Record<Level, string>

export const fmtDay = (date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', opts)
