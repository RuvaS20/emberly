import styles from './DistrictPanel.module.css'

export function DistrictEmpty() {
  return (
    <aside className={styles.empty}>
      Click a district on the map to see its 7-day forecast, risk level and estimated impact.
    </aside>
  )
}
