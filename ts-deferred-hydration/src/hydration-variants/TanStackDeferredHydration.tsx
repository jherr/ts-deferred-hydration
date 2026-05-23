import { useState } from 'react'
import { Hydrate } from '@tanstack/react-start'
import { interaction, visible } from '@tanstack/react-start/hydration'
import RelatedGuitarsCarousel from '../carousel/RelatedGuitarsCarousel'
import type { Guitar } from '../data/guitars'
import styles from './HydrationVariant.module.css'

type Props = {
  guitars: Array<Guitar>
  onSelect: (guitar: Guitar) => void
}

export default function TanStackDeferredHydration({
  guitars,
  onSelect,
}: Props) {
  const [hydrated, setHydrated] = useState(false)

  return (
    <div className={styles.wrap}>
      <p
        className={styles.chip}
        data-state={hydrated ? 'hydrated' : 'dehydrated'}
      >
        Carousel:{' '}
        {hydrated ? 'hydrated' : 'dehydrated (waiting for intent)'}
      </p>

      <Hydrate
        when={interaction({ events: ['focusin', 'pointerenter', 'click'] })}
        prefetch={visible({ rootMargin: '1200px' })}
        onHydrated={() => {
          console.log('[tanstack-hydrate] RelatedGuitarsCarousel hydrated')
          setHydrated(true)
        }}
      >
        <RelatedGuitarsCarousel guitars={guitars} onSelect={onSelect} />
      </Hydrate>
    </div>
  )
}
