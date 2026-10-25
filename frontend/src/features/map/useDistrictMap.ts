import type { FeatureCollection } from 'geojson'
import * as maplibregl from 'maplibre-gl'
import type { ExpressionSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { Alert } from '../../api'
import { LEVELS } from '../../levels'
import { token } from '../../styles/tokens'

// maplibre looks for its worker next to its own script, which Vite's bundling moves; point it at the real file
maplibregl.setWorkerUrl(workerUrl)

type Options = {
  container: RefObject<HTMLDivElement | null>
  geo: FeatureCollection
  alert: Alert
  day: number
  selectedId: string | null
  onSelect: (id: string) => void
  tipClass: string
}

const fillColour = (day: number) =>
  ['match', ['get', `level_${day}`], ...LEVELS.flatMap((l) => [l.name, l.colour]), token('--line')] as unknown as ExpressionSpecification

// Draws the districts coloured by the chosen day's level, with a hover popup and a highlighted selection
export function useDistrictMap({ container, geo, alert, day, selectedId, onSelect, tipClass }: Options) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [ready, setReady] = useState(false)
  // Map event handlers are bound once, so they read the latest day and callback from refs
  const dayRef = useRef(day)
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    dayRef.current = day
    onSelectRef.current = onSelect
  })

  // Put every day's level and Tmax on each feature, so the slider only swaps a paint expression
  const data = useMemo(() => {
    const byId = new Map(alert.districts.map((d) => [d.id, d]))
    return {
      ...geo,
      features: geo.features.map((f) => {
        const d = byId.get(String(f.properties?.id))
        const props: Record<string, unknown> = { ...f.properties }
        d?.days.forEach((x, i) => {
          props[`level_${i}`] = x.level
          props[`tmax_${i}`] = x.tmax
        })
        return { ...f, properties: props }
      }),
    }
  }, [geo, alert])

  useEffect(() => {
    const surface = token('--surface')
    const map = new maplibregl.Map({
      container: container.current!,
      style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': surface } }] },
      bounds: [[25.2, -22.5], [33.1, -15.6]],
      fitBoundsOptions: { padding: 16 },
      attributionControl: false,
    })
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: tipClass })

    map.on('load', () => {
      map.addSource('districts', { type: 'geojson', data, promoteId: 'id' })
      map.addLayer({ id: 'fill', type: 'fill', source: 'districts', paint: { 'fill-color': fillColour(dayRef.current), 'fill-opacity': 0.9 } })
      const selected: ExpressionSpecification = ['boolean', ['feature-state', 'selected'], false]
      map.addLayer({
        id: 'line', type: 'line', source: 'districts',
        paint: { 'line-color': ['case', selected, token('--ink'), surface], 'line-width': ['case', selected, 2.5, 0.6] },
      })
      map.once('idle', () => setReady(true))      // the style isn't editable until the GeoJSON has been parsed
    })
    map.on('click', 'fill', (e) => {
      const id = e.features?.[0]?.properties?.id
      if (id) onSelectRef.current(String(id))
    })
    map.on('mousemove', 'fill', (e) => {
      const p = e.features?.[0]?.properties
      if (!p) return
      map.getCanvas().style.cursor = 'pointer'
      const d = dayRef.current
      popup.setLngLat(e.lngLat).setHTML(`<b>${p.name}</b><br>${p[`level_${d}`]} · ${p[`tmax_${d}`]}°C max`).addTo(map)
    })
    map.on('mouseleave', 'fill', () => {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })
    mapRef.current = map
    return () => {
      setReady(false)
      mapRef.current = null
      map.remove()
    }
  }, [container, data, tipClass])

  useEffect(() => {
    if (ready) mapRef.current!.setPaintProperty('fill', 'fill-color', fillColour(day))
  }, [day, ready])

  useEffect(() => {
    if (!ready || !selectedId) return
    const map = mapRef.current!
    map.setFeatureState({ source: 'districts', id: selectedId }, { selected: true })
    return () => {
      map.setFeatureState({ source: 'districts', id: selectedId }, { selected: false })
    }
  }, [selectedId, ready])
}
