import { createFileRoute } from '@tanstack/react-router'
import ProductPage from '../components/ProductPage'
import ReactConditionalHydration from '../hydration-variants/ReactConditionalHydration'

export const Route = createFileRoute('/react-conditional')({
  component: ReactConditionalRoute,
})

function ReactConditionalRoute() {
  return <ProductPage CarouselSlot={ReactConditionalHydration} />
}
