import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import styles from './Header.module.css'

const VARIANT_LINKS = [
  { to: '/regular', label: 'Regular' },
  { to: '/react-selective', label: 'React Selective' },
  { to: '/tanstack-deferred', label: 'TanStack <Hydrate>' },
] as const

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brandPill}>
          <span className={styles.brandIcon}>
            <span aria-hidden="true">🌴</span>
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>Island Vibes</span>
          </span>
        </Link>

        <div className={styles.navLinks}>
          <Link
            to="/"
            className={styles.navLink}
            activeOptions={{ exact: true }}
            activeProps={{
              className: clsx(styles.navLink, styles.navLinkActive),
            }}
          >
            Overview
          </Link>
          {VARIANT_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={styles.navLink}
              activeProps={{
                className: clsx(styles.navLink, styles.navLinkActive),
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
