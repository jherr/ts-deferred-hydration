import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import type { Guitar } from '../data/guitars'
import { formatPrice } from '../data/guitars'
import styles from './RelatedGuitarsCarousel.module.css'

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
    <section id="collection" className={styles.section}>
      <div className={styles.heading}>
        <div className={styles.headingCopy}>
          <p className={styles.kicker}>More From The Collection</p>
          <h2 className={styles.title}>Customers Also Checked Out</h2>
          <p className={styles.subtitle}>
            Hand-picked island-themed acoustics — all priced to fly off the
            shelves and onto your wall.
          </p>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className={styles.scrollBtn}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className={styles.scrollBtn}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={trackRef} className={styles.track} role="list">
        {guitars.map((g) => (
          <button
            key={g.id}
            data-card
            type="button"
            role="listitem"
            onClick={() => onSelect(g)}
            className={styles.card}
          >
            <div className={styles.imageWrap}>
              <img
                src={g.image}
                alt={g.name}
                loading="lazy"
                className={styles.image}
              />
              {g.badges[0] && (
                <span className={styles.badge}>{g.badges[0]}</span>
              )}
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{g.name}</h3>
              <p className={styles.cardTagline}>{g.tagline}</p>

              <div className={styles.cardRating}>
                <Star
                  size={14}
                  className={styles.cardStar}
                  fill="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className={styles.cardRatingValue}>
                  {g.rating.toFixed(1)}
                </span>
                <span>({g.reviewCount.toLocaleString()})</span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.cardPrice}>{formatPrice(g.price)}</span>
                <span className={styles.quickView}>Quick view →</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
