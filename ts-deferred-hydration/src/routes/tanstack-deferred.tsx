import { createFileRoute } from '@tanstack/react-router'
import ProductPage from '../components/ProductPage'
import TanStackDeferredHydration from '../hydration-variants/TanStackDeferredHydration'

export const Route = createFileRoute('/tanstack-deferred')({
  component: TanStackDeferredRoute,
})

function TanStackDeferredRoute() {
  return (
    <ProductPage
      variantKicker="Variant 3 of 3"
      variantTitle="TanStack <Hydrate> (deferred-on-intent)"
      variantBlurb="The carousel stays as static SSR HTML until pointer/focus/click intent fires inside the boundary. Prefetched in the background once visible, so the eventual hydrate is instant."
      CarouselSlot={TanStackDeferredHydration}
    />
  )
}
