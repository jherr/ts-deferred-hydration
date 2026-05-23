import { createFileRoute } from '@tanstack/react-router'
import ProductPage from '../components/ProductPage'
import ReactSelectiveHydration from '../hydration-variants/ReactSelectiveHydration'

export const Route = createFileRoute('/react-selective')({
  component: ReactSelectiveRoute,
})

function ReactSelectiveRoute() {
  return (
    <ProductPage
      variantKicker="Variant 2 of 3"
      variantTitle="React.lazy + Suspense (selective hydration)"
      variantBlurb="The carousel chunk is code-split. React preserves the SSR HTML, then hydrates the boundary on its own schedule — bumping it to the front of the queue if the user clicks before hydration."
      CarouselSlot={ReactSelectiveHydration}
    />
  )
}
