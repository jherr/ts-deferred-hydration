import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, MousePointerClick, Sparkles, Zap } from 'lucide-react'
import styles from './index.module.css'

export const Route = createFileRoute('/')({ component: HomeRoute })

type Variant = {
  to: '/regular' | '/react-selective' | '/tanstack-deferred'
  kicker: string
  title: string
  summary: string
  bullets: Array<string>
  icon: typeof Zap
  chipText: string
}

const VARIANTS: Array<Variant> = [
  {
    to: '/regular',
    kicker: 'Variant 1 of 3',
    title: 'Regular eager hydration',
    summary:
      'The baseline. Carousel JS lives in the route bundle and hydrates the moment React picks up the page.',
    bullets: [
      'Carousel chunk in initial route bundle',
      'Hydrates immediately with the rest of the page',
      'Reference implementation — what you get out of the box',
    ],
    icon: Zap,
    chipText: 'No deferral',
  },
  {
    to: '/react-selective',
    kicker: 'Variant 2 of 3',
    title: 'React.lazy + Suspense (selective hydration)',
    summary:
      'Code-split carousel. React preserves the SSR HTML and hydrates on its own schedule — clicks bump the boundary to the front of the queue.',
    bullets: [
      'Separate carousel chunk fetched after the route bundle',
      'Deprioritized hydration, but always eventually hydrated',
      'Pure React — no framework-specific APIs',
    ],
    icon: Sparkles,
    chipText: 'About ORDER, not WHETHER',
  },
  {
    to: '/tanstack-deferred',
    kicker: 'Variant 3 of 3',
    title: 'TanStack <Hydrate> (deferred-on-intent)',
    summary:
      'Carousel stays as static SSR HTML until pointer / focus / click intent fires. Prefetched in the background once visible.',
    bullets: [
      'Carousel chunk split out of the route bundle',
      'Hydrates only after user intent inside the boundary',
      'Prefetched when within 1200px of the viewport',
    ],
    icon: MousePointerClick,
    chipText: 'Never until intent',
  },
]

function HomeRoute() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Deferred Hydration Demo</p>
        <h1 className={styles.title}>
          Three ways to hydrate the same carousel
        </h1>
        <p className={styles.lede}>
          Each variant renders the same product page with the same below-the-fold
          “Customers Also Checked Out” carousel — the only thing that changes is
          how (and when) that carousel hydrates on the client.
        </p>
        <p className={styles.lede}>
          Open one, watch the status chip in the top-right of the carousel, and
          throttle your network in DevTools to make the difference obvious.
        </p>
      </section>

      <section className={styles.grid} aria-label="Hydration variants">
        {VARIANTS.map((v) => {
          const Icon = v.icon
          return (
            <Link key={v.to} to={v.to} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={styles.cardKicker}>{v.kicker}</span>
              </div>

              <h2 className={styles.cardTitle}>{v.title}</h2>
              <p className={styles.cardSummary}>{v.summary}</p>

              <ul className={styles.cardBullets}>
                {v.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className={styles.cardFooter}>
                <span className={styles.cardChip}>{v.chipText}</span>
                <span className={styles.cardCta}>
                  Open <ArrowRight size={14} aria-hidden="true" />
                </span>
              </div>
            </Link>
          )
        })}
      </section>
    </main>
  )
}
