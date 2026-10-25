import { Card } from '../../ui/Card/Card'
import styles from './VerifyForm.module.css'

type Props = {
  dates: string[]
  date: string
  onDate: (date: string) => void
  file: File | null
  onFile: (file: File | null) => void
  busy: boolean
  onVerify: () => void
}

// Upload an alert file, or pick a published date, then check it against the chain
export function VerifyForm({ dates, date, onDate, file, onFile, busy, onVerify }: Props) {
  return (
    <Card>
      <label className={styles.field}>
        <span className={styles.label}>Upload an alert file (.json)</span>
        <input type="file" accept=".json,application/json" onChange={(e) => onFile(e.target.files?.[0] ?? null)} className={styles.file} />
      </label>
      <label className={styles.field}>
        <span className={styles.label}>…or check a published alert</span>
        <select value={date} disabled={!!file} onChange={(e) => onDate(e.target.value)} className={styles.select}>
          {dates.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      <button onClick={onVerify} disabled={busy || (!file && !date)} className={styles.button}>
        {busy ? 'Checking the blockchain…' : 'Verify'}
      </button>
    </Card>
  )
}
