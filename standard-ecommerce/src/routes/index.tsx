import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Waves,
} from 'lucide-react'
import GuitarModal from '../components/GuitarModal'
import RelatedGuitarsCarousel from '../components/RelatedGuitarsCarousel'
import {
  PRIMARY_GUITAR,
  RELATED_GUITARS,
  formatPrice,
  type Guitar,
} from '../data/guitars'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [selectedGuitar, setSelectedGuitar] = useState<Guitar | null>(null)
  const product = PRIMARY_GUITAR

  return (
    <main className="page-wrap px-4 pb-12 pt-8 sm:pt-12">
      <nav
        className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--sea-ink-soft)] sm:text-sm"
        aria-label="Breadcrumb"
      >
        <a href="/" className="hover:text-[var(--sea-ink)]">
          Home
        </a>
        <span aria-hidden="true">/</span>
        <a href="#collection" className="hover:text-[var(--sea-ink)]">
          Acoustic Guitars
        </a>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-[var(--sea-ink)]">
          {product.name}
        </span>
      </nav>

      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem]">
        <div className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(245,180,97,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.28),transparent_66%)]" />

        <div className="relative grid gap-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="product-canvas relative flex min-h-[420px] items-stretch justify-center overflow-hidden md:rounded-l-[2rem]">
            <img
              src={product.image}
              alt={product.name}
              className="product-image-blend relative z-[1] h-full max-h-[720px] w-full self-stretch object-contain"
            />

            <div className="absolute left-5 top-5 z-10 flex flex-col gap-1.5 sm:left-6 sm:top-6">
              {product.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lagoon-deep)] shadow-[0_8px_20px_rgba(10,28,32,0.18)] backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 px-6 py-8 sm:px-10 sm:py-12">
            <div>
              <p className="island-kicker mb-2">Featured Drop · Summer ’26</p>
              <h1 className="display-title text-3xl font-bold leading-[1.05] tracking-tight text-[var(--sea-ink)] sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-base text-[var(--sea-ink-soft)] sm:text-lg">
                {product.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-[#f5b461]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    aria-hidden="true"
                    fill={
                      i < Math.round(product.rating) ? 'currentColor' : 'none'
                    }
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[var(--sea-ink)]">
                {product.rating.toFixed(1)}
              </span>
              <a
                href="#reviews"
                className="text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
              >
                ({product.reviewCount.toLocaleString()} reviews)
              </a>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="display-title text-4xl font-bold text-[var(--sea-ink)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-base text-[var(--sea-ink-soft)] line-through">
                {formatPrice(399)}
              </span>
              <span className="rounded-full bg-[rgba(110,200,154,0.18)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--palm)]">
                Save $100
              </span>
            </div>

            <p className="max-w-prose text-sm leading-relaxed text-[var(--sea-ink-soft)] sm:text-base">
              {product.description}
            </p>

            <ul className="m-0 grid gap-2 text-sm text-[var(--sea-ink-soft)] sm:grid-cols-2">
              {product.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2"
                >
                  <Sparkles
                    size={16}
                    aria-hidden="true"
                    className="mt-0.5 flex-shrink-0 text-[var(--lagoon-deep)]"
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#328f97,#56c6be)] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(50,143,151,0.4)] transition hover:-translate-y-0.5 sm:flex-none sm:text-base"
              >
                Add to Cart · {formatPrice(product.price)}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5"
              >
                <Heart size={18} aria-hidden="true" />
                Wishlist
              </button>
            </div>

            <div className="grid gap-2 pt-2 text-xs text-[var(--sea-ink-soft)] sm:grid-cols-3 sm:text-sm">
              <div className="flex items-center gap-2">
                <Truck
                  size={16}
                  aria-hidden="true"
                  className="text-[var(--lagoon-deep)]"
                />
                Free shipping
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  aria-hidden="true"
                  className="text-[var(--lagoon-deep)]"
                />
                30-day returns
              </div>
              <div className="flex items-center gap-2">
                <Waves
                  size={16}
                  aria-hidden="true"
                  className="text-[var(--lagoon-deep)]"
                />
                Set up & tuned
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Product specs"
      >
        {(
          [
            ['Body Shape', product.bodyShape],
            ['Top Material', product.topWood],
            ['Finish', product.finish],
            ['Artwork', product.artwork],
          ] as const
        ).map(([label, value], index) => (
          <article
            key={label}
            className="island-shell feature-card rise-in rounded-2xl p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <p className="island-kicker mb-1.5">{label}</p>
            <p className="m-0 text-sm font-semibold text-[var(--sea-ink)] sm:text-base">
              {value}
            </p>
          </article>
        ))}
      </section>

      <RelatedGuitarsCarousel
        guitars={RELATED_GUITARS}
        onSelect={setSelectedGuitar}
      />

      <section
        id="reviews"
        className="island-shell rise-in mt-10 rounded-2xl p-6 sm:p-8"
        style={{ animationDelay: '260ms' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Leaf
            size={18}
            aria-hidden="true"
            className="text-[var(--lagoon-deep)]"
          />
          <p className="island-kicker">Why People Love It</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              q: '“Hung it on the wall and three guests asked where I got it.”',
              a: 'Mira S. · Verified Buyer',
            },
            {
              q: '“Great first guitar for my kid. Looks insane, sounds fine — totally fair at $299.”',
              a: 'Devon R. · Verified Buyer',
            },
            {
              q: '“Genuine porch-strumming, sunset-watching, drink-in-hand energy.”',
              a: 'Kaipo H. · Verified Buyer',
            },
          ].map(({ q, a }) => (
            <blockquote
              key={a}
              className="m-0 rounded-2xl border border-[var(--line)] bg-[var(--chip-bg)] p-4"
            >
              <p className="display-title m-0 text-[15px] leading-snug text-[var(--sea-ink)]">
                {q}
              </p>
              <footer className="island-kicker mt-2">{a}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <GuitarModal
        guitar={selectedGuitar}
        onClose={() => setSelectedGuitar(null)}
      />
    </main>
  )
}
