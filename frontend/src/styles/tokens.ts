import './tokens.css'

// Reads a value from tokens.css, for libraries (maplibre, Plot) that need a real colour rather than var(--…)
export const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
