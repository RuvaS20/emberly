import { max } from 'd3'
import { useMemo } from 'react'
import type { Alert } from '../../api'
import { fmtDay } from '../../levels'
import { ChartSection, ChartSource } from '../ChartSection'
import { fmtC } from '../format'
import styles from './HeatTileMap.module.css'
import { tileStats } from './tileStats'

const round1 = (v: number) => v.toFixed(1)
const band = (from: number, to: number | null) => (to == null ? `${round1(from)}+` : `${round1(from)}–${round1(to)}`)

export function HeatTileMap({ alert }: { alert: Alert }) {
  const s = useMemo(() => tileStats(alert), [alert])
  const maxDay = max(s.days, (d) => d.extraPreterm) ?? 1

  return (
    <ChartSection id="chart-heat-tiles">
      <div className={styles.head}>
        <h2 className={styles.title}>Zimbabwe is ripe for a <span className={styles.hot}>health crisis</span></h2>
        <p className={styles.sub}>Estimated extra preterm births per district caused by heat</p>
        <p className={styles.sub2}>
          (forecast week of {fmtDay(s.days[0].date, { day: 'numeric', month: 'short' })}–
          {fmtDay(s.days.at(-1)!.date, { day: 'numeric', month: 'short' })}, {s.districtCount} districts)
        </p>
      </div>

      <div className={styles.legend}>
        extra preterm births this week
        <div className={styles.swatches}>
          {s.bins.map((b, i) => (
            <span key={i} className={`${styles.sw} ${styles[`bin${i}`]}`}>{band(b.from, b.to)}</span>
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.side}>
          <div className={styles.box}>
            <div className={styles.boxTile}>
              <b>~{Math.round(s.baselineWeeklyPreterm).toLocaleString()}</b>
              <span>preterm births</span>
            </div>
            <div className={styles.boxCap}>expected in a normal week anyway</div>
            <p className={styles.boxNote}>Heat adds about {s.upliftPct.toFixed(1)}% on top of this model baseline</p>
          </div>

          <p className={styles.note}>
            Warmest nights: <b>{s.notes.warmestNight.name}</b> stays at <b>{fmtC(s.notes.warmestNight.tmin)}</b> after dark.
          </p>
          <p className={styles.note}>
            Population drives the count as much as heat: <b>{s.notes.biggestCount.name}</b> expects the most extra births
            ({round1(s.notes.biggestCount.extraPreterm)}) while peaking at only <b>{fmtC(s.notes.biggestCount.peakTmax)}</b>.
          </p>
        </div>

        <div className={styles.gridWrap}>
          <div className={styles.grid} role="list">
            {s.tiles.map((t) => (
              <div
                key={t.id} role="listitem" className={`${styles.tile} ${styles[`bin${t.bin}`]}`}
                style={{ gridColumn: t.col + 1, gridRow: t.row + 1 }}
                title={`${t.name}: ${round1(t.extraPreterm)} extra preterm births expected (upper ${round1(t.extraPretermUpper)}); `
                  + `hottest day ${fmtC(t.peakTmax)}; ${t.extremeDays} extreme day${t.extremeDays === 1 ? '' : 's'}`
                  + `${t.population != null ? `; population ${t.population.toLocaleString()}` : ''}`}
              >
                <span className={styles.v}>{round1(t.extraPreterm)}</span>
                <span className={t.small ? `${styles.n} ${styles.nSmall}` : styles.n}>{t.short}</span>
                {t.sub && <span className={styles.s}>{t.sub}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.side}>
          <div className={styles.peak}>
            <div className={styles.k}>peak day · {fmtDay(s.peakDay.date)}</div>
            <div className={styles.big}>{s.peakDay.extremeDistricts}</div>
            <p className={styles.d}>
              districts hit <b>Extreme</b> heat, and {s.peakDay.highOrWorse} of {s.districtCount} are at High or worse
            </p>
          </div>

          <div className={styles.days}>
            <div className={styles.k}>extra preterm births per day</div>
            <div className={styles.bars}>
              {s.days.map((d) => (
                <div key={d.date} className={`${styles.db} ${d.isPeak ? styles.dbPeak : ''}`}>
                  <span className={styles.dv}>{round1(d.extraPreterm)}</span>
                  <i style={{ height: `${(d.extraPreterm / maxDay) * 100}%` }} />
                  <span className={styles.dl}>{fmtDay(d.date, { weekday: 'short' })}<br />{new Date(`${d.date}T00:00:00`).getDate()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.total}>
            <div className={styles.totalK}>total</div>
            <div className={styles.totalBig}>{round1(s.total)}</div>
            <div className={styles.totalU}>extra preterm births</div>
            <p className={styles.totalR}>central estimate (upper bound {Math.round(s.totalUpper)})</p>
          </div>

          <p className={styles.note}>
            Coolest: <b>{s.notes.coolest.name}</b> peaks at <b>{fmtC(s.notes.coolest.peakTmax)}</b>.
          </p>
          <p className={styles.note}>
            Week’s hottest reading: <b>{fmtC(s.notes.hottest.tmax)}</b> in <b>{s.notes.hottest.name}</b> on{' '}
            {fmtDay(s.notes.hottest.date)}.
          </p>
        </div>
      </div>

      <ChartSource>
        <b>Note</b> modelled estimate, not a prediction; a district moves up one level when Tmax passes its own 95th percentile.{' '}
        <b>Method</b> Heil et al. (2026) preterm thresholds of 30.05, 33.34 and 38.64°C. The “normal week” baseline is total
        population × crude birth rate (29.9 per 1,000/yr, World Bank) × preterm share (17%, Blencowe et al. 2012) ÷ 52. Bands are
        quintiles of this week’s estimates, so they move with the forecast. Tile positions are an approximate geographic layout,
        not a projection. <b>Data</b> Open-Meteo forecast, NASA POWER, ZIMSTAT 2022 census, HDX.
      </ChartSource>
    </ChartSection>
  )
}
