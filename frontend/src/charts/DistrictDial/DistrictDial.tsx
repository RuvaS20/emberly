import { greatest } from 'd3'
import { useState } from 'react'
import { ChartMessage, ChartSection, ChartSource } from '../ChartSection'
import { Dial } from './Dial'
import styles from './DistrictDial.module.css'
import { DistrictDetail } from './DistrictDetail'
import { useHistory, type DialDistrict } from './useHistory'

export function DistrictDial() {
  const { data, error } = useHistory()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (error) return <ChartSection id="chart-district-dial"><ChartMessage>Couldn’t load district history: {error}</ChartMessage></ChartSection>
  if (!data) return <ChartSection id="chart-district-dial"><ChartMessage>Loading district history…</ChartMessage></ChartSection>

  // Opens on the most-changed district until the reader hovers another
  const selected = data.districts.find((d) => d.id === selectedId)
    ?? greatest(data.districts, (d) => d.change)!

  const onSelect = (d: DialDistrict) => setSelectedId(d.id)

  return (
    <ChartSection id="chart-district-dial">
      <h2 className={styles.title}>
        {data.hotter} of {data.districts.length} Zimbabwe districts now get more pregnancy-risk heat days than they did in the 1980s.
      </h2>
      <p className={styles.sub}>
        Each spoke is one district, grouped by province. Distance from the centre is the number of days a year with a maximum
        temperature at or above 30°C, the level at which preterm-birth risk starts to rise (Heil et al. 2026).
        <span className={styles.key}><span className={`${styles.dot} ${styles.dotThen}`} /> 1981–1990 average</span>
        <span className={styles.key}><span className={`${styles.dot} ${styles.dotHotter}`} /> 2016–2025 average, more hot days</span>
        <span className={styles.key}><span className={`${styles.dot} ${styles.dotCooler}`} /> fewer hot days</span>
      </p>

      <div className={styles.layout}>
        <div className={styles.card}>
          <Dial data={data} selected={selected} onSelect={onSelect} />
        </div>
        <aside className={`${styles.card} ${styles.panel}`}>
          <DistrictDetail district={selected} total={data.districts.length} />
        </aside>
      </div>

      <ChartSource>
        Source: NASA POWER daily maximum temperature (T2M_MAX) at each district’s centre, 1981–2025, from backend/data/history.json.
        A hot day has a maximum of 30.05°C or more (Heil et al. 2026, preterm birth, Caution level). Averages use full calendar years
        only. NASA POWER cells are about 50 km across, so neighbouring districts can share identical values.
      </ChartSource>
    </ChartSection>
  )
}
