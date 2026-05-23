import styles from './HydrationChip.module.css'

export type HydrationChipState = 'hydrated' | 'dehydrated'

type Props = {
  state: HydrationChipState
  /**
   * Optional parenthetical detail shown after the state, e.g.
   * "eager", "waiting for intent", "selective hydration".
   */
  detail?: string
}

export default function HydrationChip({ state, detail }: Props) {
  return (
    <p className={styles.chip} data-state={state}>
      Carousel: {state}
      {detail ? ` (${detail})` : ''}
    </p>
  )
}
