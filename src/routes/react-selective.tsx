import { createFileRoute } from '@tanstack/react-router'
import ProductPage from '../components/ProductPage'
import ReactSelectiveHydration from '../hydration-variants/ReactSelectiveHydration'

export const Route = createFileRoute('/react-selective')({
  component: ReactSelectiveRoute,
})

function ReactSelectiveRoute() {
  return <ProductPage CarouselSlot={ReactSelectiveHydration} />
}
