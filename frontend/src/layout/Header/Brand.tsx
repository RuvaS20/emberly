import styles from './Header.module.css'

export function Brand() {
  return (
    <div>
      <h1 className={styles.name}>Emberly</h1>
      <p className={styles.mission}>Heat alerts that help health workers protect pregnant women and newborns in Zimbabwe.</p>
    </div>
  )
}
