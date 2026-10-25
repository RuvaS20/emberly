import { SourceNote } from '../../ui/SourceNote/SourceNote'
import styles from './PretermEstimate.module.css'

type Props = { births: number; upper: number | null }

export function PretermEstimate({ births, upper }: Props) {
  return (
    <div className={styles.box}>
      <p className={styles.line}>
        Estimated extra preterm births this week:{' '}
        <span className={styles.figure}>{births}</span>{' '}
        <span className={styles.unit}>births (modelled)</span>
      </p>
      <div className={styles.note}>
        <SourceNote>
          Up to {upper} births at the upper sensitivity (Lakhoo et al. 2024). Population × birth rate
          (29.9 per 1,000/yr, World Bank) × preterm share (17%, Blencowe et al. 2012) × added risk per level (Heil et al. 2026).
        </SourceNote>
      </div>
    </div>
  )
}
