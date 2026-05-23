import { createFileRoute } from '@tanstack/react-router'
import ProductPage from '../components/ProductPage'
import RegularHydration from '../hydration-variants/RegularHydration'

export const Route = createFileRoute('/regular')({ component: RegularRoute })

function RegularRoute() {
  return <ProductPage CarouselSlot={RegularHydration} />
}
