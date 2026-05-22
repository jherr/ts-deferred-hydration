import { Link } from '@tanstack/react-router'
import { Search, ShoppingBag } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const cartCount = 0

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <Link
          to="/"
          className="inline-flex flex-shrink-0 items-center gap-2.5 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(135deg,#56c6be,#f5b461)] text-base">
            <span aria-hidden="true">🌴</span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="display-title text-[15px] font-bold tracking-tight text-[var(--sea-ink)] sm:text-base">
              Island Vibes
            </span>
            <span className="island-kicker mt-0.5 hidden text-[0.55rem] sm:block">
              Guitar Co.
            </span>
          </span>
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Shop
          </Link>
          <a href="#collection" className="nav-link">
            Collection
          </a>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Our Story
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Search Island Vibes (coming soon)"
            title="Search (coming soon)"
            className="hidden rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] sm:inline-flex"
          >
            <Search size={20} aria-hidden="true" />
          </button>

          <ThemeToggle />

          <button
            type="button"
            aria-label={`Shopping cart (${cartCount} items)`}
            title="Shopping cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span
              className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-[linear-gradient(135deg,#56c6be,#f5b461)] px-1.5 text-[11px] font-bold leading-none text-white shadow-[0_4px_12px_rgba(245,180,97,0.45)]"
              aria-hidden="true"
            >
              {cartCount}
            </span>
          </button>
        </div>
      </nav>
    </header>
  )
}
