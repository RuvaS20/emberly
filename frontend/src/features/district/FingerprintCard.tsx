import type { Anchor } from '../../api'
import styles from './DistrictPanel.module.css'

type Props = { fingerprint: string; anchor: Anchor | null }

// Today's alert fingerprint and where it was recorded on-chain
export function FingerprintCard({ fingerprint, anchor }: Props) {
  return (
    <div>
      <h3 className={styles.subheading}>Alert fingerprint (SHA-256 of today’s national alert file)</h3>
      <p className={styles.hash}>{fingerprint}</p>
      {anchor ? (
        <a href={anchor.explorer_tx} target="_blank" rel="noreferrer" className={styles.anchorLink}>
          Recorded on Ethereum Sepolia, block {anchor.block.toLocaleString()} ↗
        </a>
      ) : (
        <p className={styles.notAnchored}>Not anchored on-chain yet.</p>
      )}
    </div>
  )
}
