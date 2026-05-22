import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { Guitar } from '../data/guitars'
import { formatPrice } from '../data/guitars'

type Props = {
  guitars: Array<Guitar>
  onSelect: (guitar: Guitar) => void
}

export default function RelatedGuitarsCarousel({ guitars, onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < maxScroll - 2)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = trackRef.current
    if (!el) return

    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState])

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    const firstCard = el.querySelector<HTMLElement>('[data-card]')
    const cardWidth = firstCard?.offsetWidth ?? 280
    const gap = 16
    el.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: 'smooth',
    })
  }

  return (
    <section
      id="collection"
      className="island-shell rise-in mt-10 rounded-3xl p-5 sm:p-8"
      style={{ animationDelay: '180ms' }}
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="island-kicker mb-1">More From The Collection</p>
          <h2 className="display-title text-2xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-3xl">
            Customers Also Checked Out
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--sea-ink-soft)]">
            Hand-picked island-themed acoustics — all priced to fly off the
            shelves and onto your wall.
          </p>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.1)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.1)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="carousel-track -mx-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-2"
        role="list"
      >
        {guitars.map((g) => (
          <button
            key={g.id}
            data-card
            type="button"
            role="listitem"
            onClick={() => onSelect(g)}
            className="carousel-card group relative flex w-[78%] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] text-left shadow-[0_18px_34px_rgba(30,90,72,0.1),0_4px_14px_rgba(23,58,64,0.06)] transition hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--lagoon-deep)_45%,var(--line))] hover:shadow-[0_24px_44px_rgba(30,90,72,0.18),0_6px_18px_rgba(23,58,64,0.08)] sm:w-[46%] md:w-[31%] lg:w-[23.5%]"
          >
            <div className="product-canvas-card relative aspect-[3/4] w-full overflow-hidden">
              <img
                src={g.image}
                alt={g.name}
                loading="lazy"
                className="relative h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04] drop-shadow-[0_18px_22px_rgba(10,28,32,0.18)]"
              />
              {g.badges[0] && (
                <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lagoon-deep)] backdrop-blur-sm">
                  {g.badges[0]}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="display-title text-base font-bold leading-tight text-[var(--sea-ink)] sm:text-lg">
                {g.name}
              </h3>
              <p className="line-clamp-2 text-xs text-[var(--sea-ink-soft)] sm:text-sm">
                {g.tagline}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-[var(--sea-ink-soft)]">
                <Star
                  size={14}
                  className="text-[#f5b461]"
                  fill="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="font-semibold text-[var(--sea-ink)]">
                  {g.rating.toFixed(1)}
                </span>
                <span>({g.reviewCount.toLocaleString()})</span>
              </div>

              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="display-title text-lg font-bold text-[var(--sea-ink)]">
                  {formatPrice(g.price)}
                </span>
                <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1 text-[11px] font-semibold text-[var(--lagoon-deep)] transition group-hover:bg-[rgba(79,184,178,0.18)]">
                  Quick view →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
