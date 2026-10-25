import type { FeatureCollection } from 'geojson'
import type { Alert } from '../../api'
import { fmtDay } from '../../levels'
import { Card } from '../../ui/Card/Card'
import { ErrorBoundary, ErrorNote } from '../../ui/ErrorBoundary/ErrorBoundary'
import { SourceNote } from '../../ui/SourceNote/SourceNote'
import { DaySlider } from './DaySlider'
import styles from './MapPanel.module.css'
import { MapView } from './MapView'
import { RiskLegend } from './RiskLegend'

type Props = {
  geo: FeatureCollection
  alert: Alert
  day: number
  onDay: (day: number) => void
  selectedId: string | null
  onSelect: (id: string) => void
}

export function MapPanel({ geo, alert, day, onDay, selectedId, onSelect }: Props) {
  const dates = alert.districts[0].days.map((d) => d.date)
  const hot = alert.districts.filter((d) => d.days[day].level === 'High' || d.days[day].level === 'Extreme').length

  return (
    <Card as="section">
      <div>
        <h2 className={styles.title}>Pregnancy heat risk by district</h2>
        <p className={styles.summary}>
          <span className={styles.count}>{hot} of {alert.districts.length} districts</span> at High or Extreme on {fmtDay(dates[day])}.
          Click a district for details.
        </p>
      </div>

      {/* The map needs WebGL2. Without it maplibre throws, and unguarded that would blank the page. */}
      <ErrorBoundary
        fallback={(message) => (
          <ErrorNote>
            The map can’t be drawn in this browser: {message} The day slider and the district list below still work.
          </ErrorNote>
        )}
      >
        <MapView geo={geo} alert={alert} day={day} selectedId={selectedId} onSelect={onSelect} />
      </ErrorBoundary>
      <DaySlider dates={dates} day={day} onDay={onDay} />
      <RiskLegend />
      <SourceNote>
        Daily max temperature (Tmax) thresholds from Heil et al. 2026 (preterm birth). A district moves up one level when Tmax
        reaches its own 95th percentile (NASA POWER, 1981–present). Forecast: Open-Meteo.
      </SourceNote>
    </Card>
  )
}
