import styles from './App.module.css'
import { Footer } from './layout/Footer/Footer'
import { Header } from './layout/Header/Header'
import { DashboardPage } from './pages/DashboardPage'
import { VerifyPage } from './pages/VerifyPage'
import { useRoute } from './useRoute'

export default function App() {
  const route = useRoute()
  return (
    <div className={styles.app}>
      <Header route={route} />
      <main className={styles.main}>{route === '#/verify' ? <VerifyPage /> : <DashboardPage />}</main>
      <Footer />
    </div>
  )
}
