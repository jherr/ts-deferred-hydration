import { Link } from '@tanstack/react-router'
import clsx from 'clsx'
import { Search, ShoppingBag } from 'lucide-react'
import styles from './Header.module.css'

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
            <span className={styles.brandSub}>React Deferred Hydration</span>
          </span>
        </Link>

        <div className={styles.navLinks}>
          <Link
            to="/"
            className={styles.navLink}
            activeProps={{
              className: clsx(styles.navLink, styles.navLinkActive),
            }}
          >
            Shop
          </Link>
          <a href="#collection" className={styles.navLink}>
            Collection
          </a>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            aria-label="Search Island Vibes (coming soon)"
            title="Search (coming soon)"
            className={styles.searchBtn}
          >
            <Search size={20} aria-hidden="true" />
          </button>

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
