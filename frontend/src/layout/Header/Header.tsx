import { Brand } from './Brand'
import { ElNinoBanner } from './ElNinoBanner'
import styles from './Header.module.css'
import { Nav } from './Nav'

export function Header({ route }: { route: string }) {
  return (
    <header className={styles.header}>
      <ElNinoBanner />
      <div className={styles.row}>
        <Brand />
        <Nav route={route} />
      </div>
    </header>
  )
}
