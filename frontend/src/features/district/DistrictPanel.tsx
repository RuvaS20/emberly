import type { AlertBundle, District } from '../../api'
import { fmtDay } from '../../levels'
import { Card } from '../../ui/Card/Card'
import { DistrictEmpty } from './DistrictEmpty'
import styles from './DistrictPanel.module.css'
import { FingerprintCard } from './FingerprintCard'
import { PretermEstimate } from './PretermEstimate'
import { RiskBadge } from './RiskBadge'
import { TempForecastChart } from './TempForecastChart'

type Props = { district: District | null; bundle: AlertBundle; day: number }

export function DistrictPanel({ district, bundle, day }: Props) {
  if (!district) return <DistrictEmpty />

  const today = district.days[day]

  return (
    <Card as="aside" gap={5}>
      <div>
        <h2 className={styles.title}>{district.name}</h2>
        <p className={styles.meta}>
          {district.province} Province
          {district.population != null && <> · {district.population.toLocaleString()} people (ZIMSTAT 2022 census)</>}
        </p>
      </div>

      <div className={styles.today}>
        <RiskBadge level={today.level} />
        <span className={styles.todayText}>
          {fmtDay(today.date)}: {today.tmax}°C max, {today.tmin}°C min
        </span>
      </div>
      {today.boosted && (
        <p className={styles.boosted}>
          Unusually hot for this district: at or above its 95th percentile ({district.p95}°C, NASA POWER 1981–present).
        </p>
      )}

      <TempForecastChart district={district} day={day} issuedUtc={bundle.alert.generated_utc} />

      {district.week_extra_preterm != null && (
        <PretermEstimate births={district.week_extra_preterm} upper={district.week_extra_preterm_upper} />
      )}

      <FingerprintCard fingerprint={bundle.fingerprint} anchor={bundle.anchor} />
    </Card>
  )
}
