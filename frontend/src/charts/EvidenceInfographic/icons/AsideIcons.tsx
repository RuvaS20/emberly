// Small glyphs beside the factor cloud
export function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

export function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="2.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6">
        <line x1="9" y1="1" x2="9" y2="5" />
        <line x1="9" y1="13" x2="9" y2="17" />
        <line x1="1" y1="9" x2="5" y2="9" />
        <line x1="13" y1="9" x2="17" y2="9" />
      </g>
    </svg>
  )
}
