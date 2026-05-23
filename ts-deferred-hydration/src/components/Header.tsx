import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { ShoppingBag } from 'lucide-react'
import styles from './Header.module.css'

const VARIANT_LINKS = [
  { to: '/regular', label: 'Regular' },
  { to: '/react-selective', label: 'React Selective' },
  { to: '/tanstack-deferred', label: 'TanStack <Hydrate>' },
] as const

export default function Header() {
  const cartCount = 0

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.brandPill}>
          <span className={styles.brandIcon}>
            <span aria-hidden="true">🌴</span>
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandTitle}>Island Vibes</span>
            <span className={styles.brandSub}>Deferred Hydration Demo</span>
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

        <div className={styles.actions}>
          <button
            type="button"
            aria-label={`Shopping cart (${cartCount} items)`}
            title="Shopping cart"
            className={styles.cartBtn}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className={styles.cartLabel}>Cart</span>
            <span className={styles.cartBadge} aria-hidden="true">
              {cartCount}
            </span>
          </button>
        </div>
      </nav>
    </header>
  )
}
