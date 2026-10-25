import styles from './YearRange.module.css'

type Props = {
  min: number
  max: number
  from: number
  to: number
  onChange: (from: number, to: number) => void
}

export const MIN_SPAN = 5      // keep at least this many years in view

// Two sliders that stay at least MIN_SPAN years apart, pushing each other rather than crossing
export function YearRange({ min, max, from, to, onChange }: Props) {
  return (
    <div className={styles.controls}>
      <label>
        From
        <input
          type="range" min={min} max={max} step={1} value={from}
          onChange={(e) => {
            const next = Number(e.target.value)
            onChange(next, Math.max(to, next + MIN_SPAN))
          }}
        />
        <b>{from}</b>
      </label>
      <label>
        To
        <input
          type="range" min={min} max={max} step={1} value={to}
          onChange={(e) => {
            const next = Number(e.target.value)
            onChange(Math.min(from, next - MIN_SPAN), next)
          }}
        />
        <b>{to}</b>
      </label>
    </div>
  )
}
