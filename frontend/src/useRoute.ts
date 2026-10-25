import { useEffect, useState } from 'react'

// The current hash route, e.g. '#/' or '#/verify'
export function useRoute() {
  const [route, setRoute] = useState(location.hash || '#/')
  useEffect(() => {
    const on = () => setRoute(location.hash || '#/')
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}
