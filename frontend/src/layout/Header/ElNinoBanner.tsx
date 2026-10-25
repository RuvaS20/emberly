import { EL_NINO } from '../../config'
import styles from './ElNinoBanner.module.css'

export function ElNinoBanner() {
  return (
    <div className={styles.banner}>
      {EL_NINO.text}
      {EL_NINO.source && (
        <>
          {' '}
          <a className={styles.source} href={EL_NINO.source.url} target="_blank" rel="noreferrer">
            Source: {EL_NINO.source.label}
          </a>
        </>
      )}
    </div>
  )
}
