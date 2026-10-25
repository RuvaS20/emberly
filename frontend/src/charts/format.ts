// Shared number formatting for the charts. Uses a true minus sign (−) rather than a hyphen.
export const fmtDays = (v: number) => `${Math.round(v)}`

export const fmtChange = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v))}`

export const fmtC = (v: number) => `${v.toFixed(1)}°C`

export const fmtDeltaC = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}°C`

const SUFFIX = ['th', 'st', 'nd', 'rd']

export const ordinal = (n: number) => `${n}${SUFFIX[(n % 100) - 20] ?? SUFFIX[n % 100] ?? SUFFIX[0]}`
