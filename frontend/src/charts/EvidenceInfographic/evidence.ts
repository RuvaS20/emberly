// Published findings shown in the evidence infographic. These come from the papers listed in
// SOURCES below, not from the API, so each figure is kept here with the study it came from.

export type Source = { key: string; text: string }

export const SOURCES: Source[] = [
  { key: 'bonell2022', text: 'Bonell, A., et al. (2022). Environmental heat stress on maternal physiology and fetal blood flow in pregnant subsistence farmers in The Gambia, west Africa: an observational cohort study. The Lancet Planetary Health, 6(12), e968–e976.' },
  { key: 'brimicombe2024', text: 'Brimicombe, C., et al. (2024). Effects of ambient heat exposure on risk of all-cause mortality in children younger than 5 years in Africa: a pooled time-series analysis. The Lancet Planetary Health, 8(9), e640–e646.' },
  { key: 'hanson2024', text: 'Hanson, C., et al. (2024). A time-stratified, case-crossover study of heat exposure and perinatal mortality from 16 hospitals in sub-Saharan Africa. Nature Medicine, 30, 3106–3113.' },
  { key: 'heil2026', text: 'Heil, C. S., et al. (2026). A systematic review and meta-analysis on heat thresholds for maternal health and birth outcomes. Nature Communications, 17(8768).' },
  { key: 'lakhoo2025', text: 'Lakhoo, D. P., et al. (2025). A systematic review and meta-analysis of heat exposure impacts on maternal, fetal and neonatal health. Nature Medicine, 31, 684–694.' },
  { key: 'mcelroy2022', text: 'McElroy, S., et al. (2022). Extreme heat, preterm birth, and stillbirth: A global analysis across 14 lower-middle income countries. Environment International, 158, 106902.' },
  { key: 'wmo2026', text: 'World Meteorological Organization (2026). Global Seasonal Climate Update, October–December 2026.' },
  { key: 'highHorizons', text: 'HIGH Horizons (EU Horizon project 101057843). Periodic report: heat-health indicators and early warning for pregnant and postpartum women, infants and health workers (Sweden, South Africa, Zimbabwe).' },
]

// Circle area is proportional to the percentage, so the radius goes as its square root
export type Outcome = { outcome: string; exposure: string; pct: number; note: string; inside?: string }

export const OUTCOMES: Outcome[] = [
  { outcome: 'Preterm birth', exposure: 'per +1°C', pct: 4, note: 'global' },
  { outcome: 'Preterm birth', exposure: 'high heat', pct: 61, note: 'vs +11% in rich countries', inside: 'low-income countries' },
  { outcome: 'Preterm birth', exposure: 'high heat', pct: 11, note: 'high-income countries' },
  { outcome: 'Preterm birth', exposure: 'heatwaves', pct: 26, note: 'global' },
  { outcome: 'Stillbirth', exposure: 'per +1°C', pct: 14, note: 'global' },
  { outcome: 'Gestational diabetes', exposure: 'high heat', pct: 28, note: 'global' },
  { outcome: 'Low birth weight', exposure: 'high heat', pct: 29, note: 'global' },
  { outcome: 'Birth defects', exposure: 'high heat', pct: 48, note: 'global', inside: 'congenital anomalies' },
]

export const OUTCOMES_SOURCE = 'Lakhoo et al. (2025), Nature Medicine. Circle area = % increase in risk.'

// Niño 3.4 sea-surface temperature anomaly
export const EL_NINO_BARS = [
  { label: '2015–16 record', sub: 'Niño 3.4 anomaly, Nov–Jan', value: 2.6, tone: 'past' as const },
  { label: '2026 forecast', sub: 'Oct–Dec average, peak ~December', value: 3.7, tone: 'now' as const, suffix: ' (highest since records began)' },
]

export const EL_NINO_SOURCE = 'WMO Global Seasonal Climate Update, October 2026'

// Pooled preterm-birth risk against daily maximum temperature
export const RISK_CURVE = {
  points: [
    { tmax: 24.5, pct: 0, label: '24.5°C: no added risk', chip: true },
    { tmax: 30.1, pct: 5, label: '+5% at 30.1°C' },
    { tmax: 33.3, pct: 10, label: '+10% at 33.3°C' },
    { tmax: 38.6, pct: 20, label: '+20% at 38.6°C', chip: true },
  ],
  lmicNote: ['In 14 lower-middle', 'income countries, risk', 'of preterm birth and', 'stillbirth already rises', 'above 20°C'],
  lmicTmax: 20,
  source: 'Heil et al. (2026), Nature Communications; McElroy et al. (2022), Environment International',
}

// Field study of pregnant subsistence farmers in The Gambia
export const MECHANISM = [
  { icon: 'thermometer' as const, text: 'Mother works in heat up to', strong: '51.3°C UTCI' },
  { icon: 'divert' as const, text: 'Blood is', strong: 'diverted to her skin', after: 'to cool her down' },
  { icon: 'placenta' as const, text: 'Leaving', strong: 'less for the placenta', after: 'and the fetus' },
]

export const FETAL_STRAIN = [
  { value: '125→147', label: ['fetal heart rate', '(bpm)'], size: 96 },
  { value: '55%', label: ['of women: higher', 'umbilical resistance'], size: 86 },
  { value: '34%', label: ['of shifts with', 'fetal distress'], size: 68 },
  { value: '+17%', label: ['odds of strain', 'per +1°C UTCI'], size: 48, accent: true },
]

// How many days after a hot day the harm shows up
export const LAG = [
  { name: 'preterm birth (fast: labour triggered)', from: 0, to: 1, tone: 'blue' as const },
  { name: 'stillbirth (slower: placental damage)', from: 3, to: 5, tone: 'yellow' as const },
]

export const FIELD_SOURCE = 'Bonell et al. (2022), Lancet Planetary Health; McElroy et al. (2022)'

// size: 1 is largest. tone picks the colour.
export const FACTORS = [
  { text: 'heat in the week before birth', size: 4, tone: 'yellow-dim' as const },
  { text: 'nights that don’t cool down', size: 3, tone: 'blue' as const },
  { text: 'living in a low-income country', size: 1, tone: 'yellow' as const },
  { text: 'heatwaves', size: 2, tone: 'blue' as const },
  { text: 'outdoor farm work', size: 4, tone: 'yellow-dim' as const },
  { text: 'rural home', size: 2, tone: 'yellow' as const },
  { text: 'lower household income', size: 3, tone: 'blue-dim' as const },
  { text: 'lower education', size: 3, tone: 'yellow-dim' as const },
  { text: 'dehydration', size: 4, tone: 'blue' as const },
  { text: 'malaria', size: 5, tone: 'blue-dim' as const },
  { text: 'HIV', size: 5, tone: 'yellow-dim' as const },
  { text: 'record El Niño', size: 4, tone: 'blue-dim' as const },
  { text: 'day–night swing under 16°C', size: 5, tone: 'blue-dim' as const },
  { text: 'hottest 6 months of the year', size: 5, tone: 'yellow-dim' as const },
]

export const FACTOR_ASIDES = {
  left: { stat: '44%', text: 'of stillbirths in sub-Saharan Africa happen during labour' },
  right: 'no single threshold fits every place: local data is needed',
}

export const UNKNOWNS = [
  'Zimbabwe-specific thresholds',
  'which cooling measures work best',
  'long-term effects on children',
]

export const FACTORS_SOURCE = 'McElroy (2022), Hanson (2024), Brimicombe (2024), Bonell (2022), Lakhoo (2025)'

// Extra risk of death in sub-Saharan Africa, grouped by when the heat strikes
type AfricaGroup = {
  group: string
  tone: 'blue' | 'yellow'
  items: { pct: number; label: string[]; accent?: boolean }[]
}

export const AFRICA_GROUPS: AfricaGroup[] = [
  {
    group: 'hottest 6 months of year',
    tone: 'blue' as const,
    items: [
      { pct: 91, label: ['stillbirth'] },
      { pct: 96, label: ['perinatal', 'death'] },
    ],
  },
  {
    group: 'week before birth',
    tone: 'blue' as const,
    items: [
      { pct: 34, label: ['perinatal', 'death'] },
      { pct: 64, label: ['death', 'during labour'], accent: true },
    ],
  },
  {
    group: 'after birth',
    tone: 'yellow' as const,
    items: [
      { pct: 14, label: ['newborns', '(Ethiopia)'] },
      { pct: 27, label: ['ages 1–4', '(E. Africa)'] },
    ],
  },
]

export const AFRICA_SOURCE = 'Hanson et al. (2024), Nature Medicine, 16 hospitals; Brimicombe et al. (2024), Lancet Planetary Health'

// Share of heat-and-pregnancy research by where it was done
export const RESEARCH_GAP = [
  { pct: 63, label: ['high-income &', 'temperate'], size: 92, tone: 'deep' as const },
  { pct: 34, label: ['middle-', 'income'], size: 68, tone: 'grey' as const },
  { pct: 3, label: ['low-income,', 'most at risk'], size: 22, tone: 'accent' as const },
]

export const RESEARCH_GAP_NOTE = 'share of heat and pregnancy research, by where it was done (Lakhoo 2025)'

export const PITCH = [
  'A web dashboard that alerts Zimbabwe’s district health officers and maternity clinics when forecast heat crosses the peer-reviewed thresholds above, and estimates how many extra preterm births to expect locally so wards can plan staff, fluids and cooling.',
  'Every alert and estimate is anchored on a blockchain, giving an auditable record for ministries, aid agencies and future climate-health financing. It is designed to feed the heat and maternal health indicators that WHO, UNICEF, UNFPA and WMO are developing with partners including the HIGH Horizons project, which already works in Zimbabwe.',
]

export const ABOUT = 'An infographic summarising peer-reviewed evidence on extreme heat and pregnancy, with a focus on sub-Saharan Africa, and a proposed early-warning tool for Zimbabwe.'
