import { createFileRoute } from '@tanstack/react-router'
import ProductPage from '../components/ProductPage'
import RegularHydration from '../hydration-variants/RegularHydration'

export const Route = createFileRoute('/regular')({ component: RegularRoute })

function RegularRoute() {
  return (
    <ProductPage
      variantKicker="Variant 1 of 3"
      variantTitle="Regular eager hydration"
      variantBlurb="Vanilla TanStack Start + React 19. The carousel ships in the route bundle and hydrates immediately with the rest of the page."
      CarouselSlot={RegularHydration}
    />
  )
}
