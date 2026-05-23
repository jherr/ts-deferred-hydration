import { Suspense, lazy, useEffect, useState } from 'react'
import HydrationChip from '../components/HydrationChip'
import type { Guitar } from '../data/guitars'
import styles from './HydrationVariant.module.css'

// Code-split the carousel into its own chunk. React preserves the SSR'd HTML
// while this chunk is in flight, and selective hydration deprioritizes it
// relative to higher-priority work elsewhere on the page.
const LazyCarousel = lazy(
  () => import('../carousel/RelatedGuitarsCarousel'),
)

// Sibling of the lazy carousel inside the same Suspense boundary, so its
// effect fires exactly once the lazy chunk has resolved and React has
// hydrated the subtree.
function HydrationSignal({ onHydrated }: { onHydrated: () => void }) {
  useEffect(() => {
    onHydrated()
  }, [onHydrated])
  return null
}

type Props = {
  guitars: Array<Guitar>
  onSelect: (guitar: Guitar) => void
}

export default function ReactSelectiveHydration({ guitars, onSelect }: Props) {
  const [hydrated, setHydrated] = useState(false)

  return (
    <div className={styles.wrap}>
      <HydrationChip
        state={hydrated ? 'hydrated' : 'dehydrated'}
        detail={hydrated ? undefined : 'selective hydration'}
      />

      {/* fallback={null} is intentional: streaming SSR inlines the carousel
          HTML on first load, so users see it immediately. */}
      <Suspense fallback={null}>
        <LazyCarousel guitars={guitars} onSelect={onSelect} />
        <HydrationSignal
          onHydrated={() => {
            console.log('[react-lazy] RelatedGuitarsCarousel hydrated')
            setHydrated(true)
          }}
        />
      </Suspense>
    </div>
  )
}
