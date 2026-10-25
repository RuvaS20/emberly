import styles from './ScatterFilters.module.css'

export type Filters = { search: string; province: string }

export const NO_FILTERS: Filters = { search: '', province: 'all' }

type Props = {
  provinces: string[]
  value: Filters
  onChange: (next: Filters) => void
  shown: number
  total: number
}

// Search and province sit in one row above the chart; "Show all" clears both
export function ScatterFilters({ provinces, value, onChange, shown, total }: Props) {
  const filtering = value.search !== '' || value.province !== 'all'

  return (
    <div className={styles.row}>
      <label className={styles.field}>
        <span className={styles.srOnly}>Search districts</span>
        <input
          type="search" placeholder="Search districts…" value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          className={styles.search}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Province</span>
        <select
          value={value.province} onChange={(e) => onChange({ ...value, province: e.target.value })}
          className={styles.select}
        >
          <option value="all">All provinces</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>

      <button type="button" className={styles.reset} onClick={() => onChange(NO_FILTERS)} disabled={!filtering}>
        Show all
      </button>

      <span className={styles.count} aria-live="polite">
        {filtering ? `${shown} of ${total} districts` : `${total} districts`}
      </span>
    </div>
  )
}
