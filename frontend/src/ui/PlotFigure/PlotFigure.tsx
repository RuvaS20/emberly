import * as Plot from '@observablehq/plot'
import { useEffect, useRef, useState } from 'react'
import { token } from '../../styles/tokens'
import styles from './PlotFigure.module.css'

// Renders an Observable Plot chart at the container's width. Pass a memoised `make`.
export function PlotFigure({ make }: { make: (width: number) => Plot.PlotOptions }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)))
    ro.observe(ref.current!)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!width) return
    const style = { background: 'transparent', color: token('--ink-body'), fontFamily: token('--font-body'), fontSize: '12px' }
    const chart = Plot.plot({ style, ...make(width), width })
    ref.current!.replaceChildren(chart)
    return () => chart.remove()
  }, [make, width])

  return <div ref={ref} className={styles.figure} />
}
