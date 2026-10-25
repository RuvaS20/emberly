import styles from './Nav.module.css'

const LINKS = [
  { href: '#/', label: 'Dashboard' },
  { href: '#/verify', label: 'Verify an alert' },
]

export function Nav({ route }: { route: string }) {
  return (
    <nav className={styles.nav}>
      {LINKS.map((l) => (
        <a key={l.href} href={l.href} className={styles.link} aria-current={route === l.href ? 'page' : undefined}>
          {l.label}
        </a>
      ))}
    </nav>
  )
}
