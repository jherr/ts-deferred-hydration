import { Suspense, lazy, useState } from 'react'
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
import {
  PRIMARY_GUITAR,
  RELATED_GUITARS,
  formatPrice,
  type Guitar,
} from '../data/guitars'
import styles from './index.module.css'

// Code-split the carousel into its own chunk. React preserves the SSR'd HTML
// while this chunk is in flight, and selective hydration deprioritizes it
// relative to higher-priority work elsewhere on the page.
const RelatedGuitarsCarousel = lazy(
  () => import('../components/RelatedGuitarsCarousel'),
)

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [selectedGuitar, setSelectedGuitar] = useState<Guitar | null>(null)
  const [carouselHydrated, setCarouselHydrated] = useState(false)
  const product = PRIMARY_GUITAR

  return (
    <main className={styles.main}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <a href="/" className={styles.breadcrumbLink}>
          Home
        </a>
        <span aria-hidden="true">/</span>
        <a href="#collection" className={styles.breadcrumbLink}>
          Acoustic Guitars
        </a>
        <span aria-hidden="true">/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      <section className={styles.heroCard}>
        <div className={styles.heroBlobTopLeft} />
        <div className={styles.heroBlobBottomRight} />

        <div className={styles.heroGrid}>
          <div className={styles.heroImagePanel}>
            <img
              src={product.image}
              alt={product.name}
              className={styles.heroImage}
            />

            <div className={styles.heroBadges}>
              {product.badges.map((badge) => (
                <span key={badge} className={styles.heroBadge}>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.heroInfo}>
            <div>
              <p className={styles.heroKicker}>Featured Drop · Summer ’26</p>
              <h1 className={styles.heroTitle}>{product.name}</h1>
              <p className={styles.heroTagline}>{product.tagline}</p>
            </div>

            <div className={styles.ratingRow}>
              <div className={styles.stars}>
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
              <span className={styles.ratingValue}>
                {product.rating.toFixed(1)}
              </span>
              <a href="#reviews" className={styles.reviewsLink}>
                ({product.reviewCount.toLocaleString()} reviews)
              </a>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              <span className={styles.priceStrike}>{formatPrice(399)}</span>
              <span className={styles.saveBadge}>Save $100</span>
            </div>

            <p className={styles.description}>{product.description}</p>

            <ul className={styles.highlights}>
              {product.highlights.map((h) => (
                <li key={h} className={styles.highlight}>
                  <Sparkles
                    size={16}
                    aria-hidden="true"
                    className={styles.highlightIcon}
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              <button type="button" className={styles.addToCart}>
                Add to Cart · {formatPrice(product.price)}
              </button>
              <button type="button" className={styles.wishlist}>
                <Heart size={18} aria-hidden="true" />
                Wishlist
              </button>
            </div>

            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <Truck
                  size={16}
                  aria-hidden="true"
                  className={styles.trustIcon}
                />
                Free shipping
              </div>
              <div className={styles.trustItem}>
                <ShieldCheck
                  size={16}
                  aria-hidden="true"
                  className={styles.trustIcon}
                />
                30-day returns
              </div>
              <div className={styles.trustItem}>
                <Waves
                  size={16}
                  aria-hidden="true"
                  className={styles.trustIcon}
                />
                Set up & tuned
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.specsRow} aria-label="Product specs">
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
            className={styles.specCard}
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <p className={styles.specLabel}>{label}</p>
            <p className={styles.specValue}>{value}</p>
          </article>
        ))}
      </section>

      <section className={styles.carouselWrap} aria-label="Related guitars">
        <p
          className={styles.hydrationChip}
          data-state={carouselHydrated ? 'hydrated' : 'dehydrated'}
        >
          Carousel:{' '}
          {carouselHydrated ? 'hydrated' : 'dehydrated (selective hydration)'}
        </p>

        {/* fallback={null} is intentional: streaming SSR inlines the carousel
            HTML on first load, so users see it immediately. The fallback only
            matters when this boundary first appears after a client nav. */}
        <Suspense fallback={null}>
          <RelatedGuitarsCarousel
            guitars={RELATED_GUITARS}
            onSelect={setSelectedGuitar}
            onHydrated={() => {
              console.log('[react-lazy] RelatedGuitarsCarousel hydrated')
              setCarouselHydrated(true)
            }}
          />
        </Suspense>
      </section>

      <section
        id="reviews"
        className={styles.reviewsSection}
        style={{ animationDelay: '260ms' }}
      >
        <div className={styles.reviewsHeader}>
          <Leaf
            size={18}
            aria-hidden="true"
            className={styles.reviewsHeaderIcon}
          />
          <p className={styles.reviewsHeaderKicker}>Why People Love It</p>
        </div>
        <div className={styles.reviewsGrid}>
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
            <blockquote key={a} className={styles.reviewCard}>
              <p className={styles.reviewQuote}>{q}</p>
              <footer className={styles.reviewAuthor}>{a}</footer>
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
