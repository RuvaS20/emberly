import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

type Props = { children: ReactNode; fallback: (message: string) => ReactNode }
type State = { message: string | null }

// Keeps one failing component from unmounting the rest of the page. React only
// catches render and lifecycle errors this way, so there is no hook equivalent.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null }

  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Component failed:', error, info.componentStack)
  }

  render() {
    return this.state.message == null ? this.props.children : this.props.fallback(this.state.message)
  }
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>
}
