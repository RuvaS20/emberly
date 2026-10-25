import { GITHUB_URL } from '../../config'
import styles from './Footer.module.css'

export function Caveat() {
  return (
    <div>
      <h3 className={styles.heading}>Caveat</h3>
      <p>
        Births figures are modelled estimates from population-level studies, not predictions for any person or clinic.
        Emberly is not medical advice; follow local health guidance.
      </p>
      <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={styles.github}>
        Source code on GitHub ↗
      </a>
    </div>
  )
}
