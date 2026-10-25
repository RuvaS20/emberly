import { Caveat } from './Caveat'
import styles from './Footer.module.css'
import { Methods } from './Methods'
import { Sources } from './Sources'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <Sources />
        <Methods />
        <Caveat />
      </div>
    </footer>
  )
}
