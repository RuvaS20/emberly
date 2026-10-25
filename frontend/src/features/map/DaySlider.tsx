import { fmtDay } from '../../levels'
import styles from './DaySlider.module.css'

type Props = { dates: string[]; day: number; onDay: (day: number) => void }

export function DaySlider({ dates, day, onDay }: Props) {
  return (
    <div>
      <label htmlFor="day" className={styles.label}>
        Forecast day: <span className={styles.current}>{fmtDay(dates[day])}</span>
      </label>
      <input
        id="day" type="range" min={0} max={dates.length - 1} value={day}
        onChange={(e) => onDay(Number(e.target.value))}
        className={styles.range}
      />
      <div className={styles.ticks}>
        {dates.map((d) => <span key={d}>{fmtDay(d, { weekday: 'short' })}</span>)}
      </div>
    </div>
  )
}
