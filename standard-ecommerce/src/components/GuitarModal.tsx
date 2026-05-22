import { useEffect, useRef } from 'react'
import { Heart, Star, X } from 'lucide-react'
import type { Guitar } from '../data/guitars'
import { formatPrice } from '../data/guitars'

type Props = {
  guitar: Guitar | null
  onClose: () => void
}

export default function GuitarModal({ guitar, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!guitar) return

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [guitar, onClose])

  if (!guitar) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guitar-modal-title"
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-[rgba(10,28,32,0.55)] px-2 py-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-10"
      onClick={onClose}
    >
      <div
        className="modal-card relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_30px_80px_rgba(10,28,32,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.18)] transition hover:-translate-y-0.5"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="grid gap-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="product-canvas-soft relative isolate flex items-center justify-center overflow-hidden p-6 sm:p-8">
            <img
              src={guitar.image}
              alt={guitar.name}
              loading="lazy"
              className="relative z-10 max-h-[360px] w-auto max-w-full object-contain drop-shadow-[0_24px_30px_rgba(10,28,32,0.25)]"
            />
            <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
              {guitar.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--lagoon-deep)] backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <div>
              <p className="island-kicker mb-1">Island Vibes Collection</p>
              <h2
                id="guitar-modal-title"
                className="display-title text-2xl font-bold leading-tight text-[var(--sea-ink)] sm:text-3xl"
              >
                {guitar.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--sea-ink-soft)] sm:text-base">
                {guitar.tagline}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#f5b461]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    aria-hidden="true"
                    fill={i < Math.round(guitar.rating) ? 'currentColor' : 'none'}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[var(--sea-ink)]">
                {guitar.rating.toFixed(1)}
              </span>
              <span className="text-sm text-[var(--sea-ink-soft)]">
                ({guitar.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="display-title text-3xl font-bold text-[var(--sea-ink)]">
                {formatPrice(guitar.price)}
              </span>
              <span className="text-sm text-[var(--sea-ink-soft)] line-through">
                {formatPrice(399)}
              </span>
              <span className="rounded-full bg-[rgba(110,200,154,0.18)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[var(--palm)]">
                Save $100
              </span>
            </div>

            <p className="text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {guitar.description}
            </p>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-2xl border border-[var(--line)] bg-[var(--chip-bg)] p-4 text-sm">
              <div>
                <dt className="island-kicker mb-0.5">Body</dt>
                <dd className="font-semibold text-[var(--sea-ink)]">
                  {guitar.bodyShape}
                </dd>
              </div>
              <div>
                <dt className="island-kicker mb-0.5">Top</dt>
                <dd className="font-semibold text-[var(--sea-ink)]">
                  {guitar.topWood}
                </dd>
              </div>
              <div>
                <dt className="island-kicker mb-0.5">Finish</dt>
                <dd className="font-semibold text-[var(--sea-ink)]">
                  {guitar.finish}
                </dd>
              </div>
              <div>
                <dt className="island-kicker mb-0.5">Artwork</dt>
                <dd className="font-semibold text-[var(--sea-ink)]">
                  {guitar.artwork}
                </dd>
              </div>
            </dl>

            <ul className="m-0 space-y-1.5 pl-5 text-sm text-[var(--sea-ink-soft)] [list-style:disc]">
              {guitar.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#328f97,#56c6be)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(50,143,151,0.35)] transition hover:-translate-y-0.5"
              >
                Add to Cart · {formatPrice(guitar.price)}
              </button>
              <button
                type="button"
                aria-label="Save to wishlist"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--sea-ink)] transition hover:-translate-y-0.5"
              >
                <Heart size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Wishlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
