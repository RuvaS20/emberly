import styles from './FingerprintCompare.module.css'

function FingerprintRow({ label, value, other }: { label: string; value: string; other: string | null }) {
  return (
    <div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        {value.split('').map((ch, i) => {
          const bad = other != null && other[i] !== ch
          const delay = `${i * 18}ms`
          return (
            <span key={i} className={bad ? styles.bad : styles.char} style={{ animationDelay: bad ? `${delay}, ${delay}` : delay }}>
              {ch}
            </span>
          )
        })}
      </p>
    </div>
  )
}

type Props = { fingerprint: string; onchain: string | null }

// The file's fingerprint revealed character by character, with the on-chain one below; mismatches flash red
export function FingerprintCompare({ fingerprint, onchain }: Props) {
  return (
    <>
      <FingerprintRow key={`a${fingerprint}`} label="This file" value={fingerprint} other={onchain} />
      {onchain && <FingerprintRow key={`b${onchain}`} label="On the blockchain" value={onchain} other={fingerprint} />}
    </>
  )
}
