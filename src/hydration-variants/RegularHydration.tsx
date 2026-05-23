import RelatedGuitarsCarousel from '../carousel/RelatedGuitarsCarousel'
import HydrationChip from '../components/HydrationChip'
import type { Guitar } from '../data/guitars'
import styles from './HydrationVariant.module.css'

type Props = {
  guitars: Array<Guitar>
  onSelect: (guitar: Guitar) => void
}

/**
 * Baseline: the carousel ships in the route bundle and hydrates eagerly
 * alongside the rest of the page. The chip is rendered server-side as
 * "hydrated" because there is no deferral.
 */
export default function RegularHydration({ guitars, onSelect }: Props) {
  return (
    <div className={styles.wrap}>
      <HydrationChip state="hydrated" detail="eager" />
      <RelatedGuitarsCarousel guitars={guitars} onSelect={onSelect} />
    </div>
  )
}
