import type { Verification } from '../../api'
import { FingerprintCompare } from './FingerprintCompare'
import styles from './VerifyResult.module.css'

const RESULT = {
  verified: { title: 'Verified', text: 'This alert matches the fingerprint recorded on the blockchain. It has not been changed.' },
  tampered: { title: 'Does not match', text: 'This file’s fingerprint differs from the one recorded on the blockchain. It has been changed since it was published.' },
  not_anchored: { title: 'Not anchored', text: 'No fingerprint has been recorded on the blockchain for this date yet.' },
}

// Green, red or grey box, depending on whether the fingerprint matches the chain
export function VerifyResult({ result }: { result: Verification }) {
  const r = RESULT[result.status]
  return (
    <div className={`${styles.box} ${styles[result.status]}`}>
      <div>
        <h3 className={styles.title}>{r.title}</h3>
        <p className={styles.text}>{r.text}</p>
        <p className={styles.meta}>
          Alert date {result.date}
          {result.anchored_at && <> · recorded {result.anchored_at.replace('T', ' ').replace('+00:00', ' UTC')}</>}
        </p>
      </div>
      <FingerprintCompare fingerprint={result.fingerprint} onchain={result.onchain_fingerprint} />
      {result.explorer_tx && (
        <a href={result.explorer_tx} target="_blank" rel="noreferrer" className={styles.link}>
          View the transaction on Sepolia Etherscan ↗
        </a>
      )}
    </div>
  )
}
