import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './Tooltip.module.css'

export type TipPosition = { x: number; y: number }

// Floats beside the pointer, flipping left or up when it would leave the window
export function Tooltip({ at, children }: { at: TipPosition | null; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setSize({ width: r.width, height: r.height })
    }
  }, [children])

  if (!at) return null
  const left = Math.max(8, Math.min(at.x + 14, window.innerWidth - size.width - 8))
  const top = at.y + 16 + size.height > window.innerHeight ? at.y - size.height - 12 : at.y + 16

  return (
    <div ref={ref} className={styles.tip} style={{ left, top }} role="tooltip">
      {children}
    </div>
  )
}
