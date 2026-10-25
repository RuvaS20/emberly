import { useEffect, useState } from 'react'
import { api, type Verification } from '../api'
import { VerifyForm } from '../features/verify/VerifyForm'
import { VerifyResult } from '../features/verify/VerifyResult'
import styles from './VerifyPage.module.css'

export function VerifyPage() {
  const [dates, setDates] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<Verification | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.alerts().then((d) => {
      setDates(d)
      setDate(d.at(-1) ?? '')
    }).catch((e) => setError(e.message))
  }, [])

  async function run() {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      setResult(file ? await api.verifyUpload(JSON.parse(await file.text())) : await api.verifyDate(date))
    } catch (e) {
      setError(e instanceof SyntaxError ? 'That file isn’t valid JSON.' : (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={styles.page}>
      <div>
        <h2 className={styles.title}>Verify an alert</h2>
        <p className={styles.intro}>
          Every day’s alert file is fingerprinted (SHA-256) and the fingerprint is recorded on Ethereum Sepolia. Change a single
          number in the file and its fingerprint changes completely.
        </p>
      </div>

      <VerifyForm
        dates={dates} date={date} file={file} busy={busy} onVerify={run}
        onDate={(d) => { setDate(d); setResult(null) }}
        onFile={(f) => { setFile(f); setResult(null) }}
      />

      {error && <p className={styles.error}>{error}</p>}
      {result && <VerifyResult result={result} />}
    </section>
  )
}
