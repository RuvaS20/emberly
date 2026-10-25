import type { FeatureCollection } from 'geojson'
import { useEffect, useState } from 'react'
import { API, api, type AlertBundle } from '../api'
import { AlertsScatter } from '../charts/AlertsScatter/AlertsScatter'
import { DistrictDial } from '../charts/DistrictDial/DistrictDial'
import { EvidenceInfographic } from '../charts/EvidenceInfographic/EvidenceInfographic'
import { HeatTileMap } from '../charts/HeatTileMap/HeatTileMap'
import { MonthlyTempBars } from '../charts/MonthlyTempBars/MonthlyTempBars'
import { DistrictPanel } from '../features/district/DistrictPanel'
import { MapPanel } from '../features/map/MapPanel'
import { ErrorBoundary, ErrorNote } from '../ui/ErrorBoundary/ErrorBoundary'
import styles from './DashboardPage.module.css'

type Data = { bundle: AlertBundle; geo: FeatureCollection }

async function loadAll(): Promise<Data> {
  const dates = await api.alerts()
  if (!dates.length) throw new Error('No alerts yet. Run backend/pipeline/forecast.py')
  const [bundle, geo] = await Promise.all([api.alert(dates.at(-1)!), api.districts()])
  return { bundle, geo }
}

// Each chart is boundaried on its own, so one failing chart can't take the others down
function Chart({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={(message) => <ErrorNote>The {name} chart couldn’t be drawn: {message}</ErrorNote>}>
      {children}
    </ErrorBoundary>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [day, setDay] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    loadAll().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <p className={styles.error}>
        Couldn’t load alerts from {API}: {error}. Is the API running? <code>uvicorn backend.api.main:app --reload</code>
      </p>
    )
  }
  if (!data) return <p className={styles.loading}>Loading today’s alerts…</p>

  const district = data.bundle.alert.districts.find((d) => d.id === selectedId) ?? null

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <MapPanel geo={data.geo} alert={data.bundle.alert} day={day} onDay={setDay} selectedId={selectedId} onSelect={setSelectedId} />
        <DistrictPanel district={district} bundle={data.bundle} day={day} />
      </div>

      <div className={styles.charts}>
        <Chart name="district alerts"><AlertsScatter alert={data.bundle.alert} /></Chart>
        <Chart name="heat tile map"><HeatTileMap alert={data.bundle.alert} /></Chart>
        <Chart name="monthly temperature"><MonthlyTempBars /></Chart>
        <Chart name="district dial"><DistrictDial /></Chart>
        <Chart name="evidence"><EvidenceInfographic /></Chart>
      </div>
    </div>
  )
}
