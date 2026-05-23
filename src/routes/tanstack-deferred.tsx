import { createFileRoute } from '@tanstack/react-router'
import ProductPage from '../components/ProductPage'
import TanStackDeferredHydration from '../hydration-variants/TanStackDeferredHydration'

export const Route = createFileRoute('/tanstack-deferred')({
  component: TanStackDeferredRoute,
})

function TanStackDeferredRoute() {
  return <ProductPage CarouselSlot={TanStackDeferredHydration} />
}
