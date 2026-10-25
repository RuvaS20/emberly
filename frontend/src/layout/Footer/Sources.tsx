import { SOURCES } from '../../config'
import styles from './Footer.module.css'

export function Sources() {
  return (
    <div>
      <h3 className={styles.heading}>Data sources</h3>
      <ul className={styles.list}>
        {SOURCES.map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noreferrer" className={styles.sourceLink}>{s.name}</a>: {s.what}
          </li>
        ))}
      </ul>
    </div>
  )
}
