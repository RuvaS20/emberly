import type { FeatureCollection } from 'geojson'
import { useRef } from 'react'
import type { Alert } from '../../api'
import styles from './MapView.module.css'
import { useDistrictMap } from './useDistrictMap'

type Props = {
  geo: FeatureCollection
  alert: Alert
  day: number
  selectedId: string | null
  onSelect: (id: string) => void
}

export function MapView(props: Props) {
  const container = useRef<HTMLDivElement>(null)
  useDistrictMap({ container, tipClass: styles.tip, ...props })
  return <div ref={container} className={styles.map} />
}
