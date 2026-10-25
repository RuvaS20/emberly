// The three mechanism icons from the field-study column, one component each
export type MechanismIcon = 'thermometer' | 'divert' | 'placenta'

const BLUE = 'var(--evidence-blue)'
const ACCENT = 'var(--evidence-orange)'

export function ThermometerIcon() {
  return (
    <svg viewBox="0 0 62 62" aria-hidden="true">
      <circle cx="31" cy="31" r="30" fill={BLUE} />
      <rect x="27" y="12" width="8" height="26" rx="4" fill="#fff" />
      <circle cx="31" cy="42" r="8" fill="#fff" />
      <rect x="29.5" y="22" width="3" height="18" fill={ACCENT} />
      <circle cx="31" cy="42" r="5" fill={ACCENT} />
    </svg>
  )
}

export function DivertIcon() {
  return (
    <svg viewBox="0 0 62 62" aria-hidden="true">
      <rect x="1" y="1" width="60" height="60" rx="6" fill={BLUE} />
      <path d="M14 31h28m-9-9 9 9-9 9" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="31" r="4" fill="#fff" />
    </svg>
  )
}

export function PlacentaIcon() {
  return (
    <svg viewBox="0 0 62 62" aria-hidden="true">
      <path d="M31 54C14 42 6 33 6 22a12 12 0 0 1 25-5 12 12 0 0 1 25 5c0 11-8 20-25 32z" fill={BLUE} />
      <polyline points="12,30 22,30 26,22 31,38 35,28 50,28" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  )
}

export const MECHANISM_ICONS: Record<MechanismIcon, () => React.ReactElement> = {
  thermometer: ThermometerIcon,
  divert: DivertIcon,
  placenta: PlacentaIcon,
}
