import { useEffect, useRef } from 'react'
import { Heart, Star, X } from 'lucide-react'
import type { Guitar } from '../data/guitars'
import { formatPrice } from '../data/guitars'
import styles from './GuitarModal.module.css'

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
      className={styles.backdrop}
      onClick={onClose}
    >
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className={styles.closeBtn}
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className={styles.grid}>
          <div className={styles.imageSide}>
            <img
              src={guitar.image}
              alt={guitar.name}
              loading="lazy"
              className={styles.image}
            />
            <div className={styles.badges}>
              {guitar.badges.map((badge) => (
                <span key={badge} className={styles.badge}>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.body}>
            <div>
              <p className={styles.kicker}>Island Vibes Collection</p>
              <h2 id="guitar-modal-title" className={styles.title}>
                {guitar.name}
              </h2>
              <p className={styles.tagline}>{guitar.tagline}</p>
            </div>

            <div className={styles.rating}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    aria-hidden="true"
                    fill={
                      i < Math.round(guitar.rating) ? 'currentColor' : 'none'
                    }
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <span className={styles.ratingValue}>
                {guitar.rating.toFixed(1)}
              </span>
              <span className={styles.ratingCount}>
                ({guitar.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(guitar.price)}</span>
              <span className={styles.priceStrike}>{formatPrice(399)}</span>
              <span className={styles.saveBadge}>Save $100</span>
            </div>

            <p className={styles.description}>{guitar.description}</p>

            <dl className={styles.specs}>
              <div>
                <dt className={styles.specLabel}>Body</dt>
                <dd className={styles.specValue}>{guitar.bodyShape}</dd>
              </div>
              <div>
                <dt className={styles.specLabel}>Top</dt>
                <dd className={styles.specValue}>{guitar.topWood}</dd>
              </div>
              <div>
                <dt className={styles.specLabel}>Finish</dt>
                <dd className={styles.specValue}>{guitar.finish}</dd>
              </div>
              <div>
                <dt className={styles.specLabel}>Artwork</dt>
                <dd className={styles.specValue}>{guitar.artwork}</dd>
              </div>
            </dl>

            <ul className={styles.highlights}>
              {guitar.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <div className={styles.actions}>
              <button type="button" className={styles.addToCart}>
                Add to Cart · {formatPrice(guitar.price)}
              </button>
              <button
                type="button"
                aria-label="Save to wishlist"
                className={styles.wishlist}
              >
                <Heart size={16} aria-hidden="true" />
                <span className={styles.wishlistLabel}>Wishlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
