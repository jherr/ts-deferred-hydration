# Deferred Hydration: TanStack vs. React-only

A single TanStack Start app that demos **three** different ways to hydrate the
same below-the-fold "Customers Also Checked Out" carousel on an e-commerce
product page.

The point of the comparison is to isolate **one variable** — the hydration
primitive — while keeping the UI, styles, data, and component graph identical
across all three variants.

## TL;DR

| Route | Hydration strategy | Carousel JS in initial route bundle? | Carousel hydrated when? |
| --- | --- | --- | --- |
| `/regular` | Eager (default React 19 + TanStack Start) | Yes | Immediately, with the rest of the page |
| `/react-selective` | `React.lazy` + `<Suspense>` + selective hydration | No | Automatically, but at lower priority than other work; bumps to front on click |
| `/tanstack-deferred` | TanStack `<Hydrate when={interaction()} prefetch={visible()} />` | No | Only after pointer/focus/click intent fires inside the boundary |

All three render the same product page with the same hero, specs, related-guitars
carousel, reviews, and modal. The only intentional difference is which hydration
wrapper renders the carousel.

---

## Project layout

```
ts-deferred-hydration/                  project root (single TanStack Start app)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md                            this file
├── public/                              static assets (guitar images, favicon)
└── src/
    ├── carousel/                        the carousel component being deferred
    │   ├── RelatedGuitarsCarousel.tsx
    │   └── RelatedGuitarsCarousel.module.css
    ├── hydration-variants/              one wrapper per hydration strategy
    │   ├── RegularHydration.tsx
    │   ├── ReactSelectiveHydration.tsx
    │   ├── TanStackDeferredHydration.tsx
    │   └── HydrationVariant.module.css
    ├── components/
    │   ├── GuitarModal.tsx
    │   ├── Header.tsx
    │   └── ProductPage.tsx              shared product page; takes a CarouselSlot
    ├── data/
    │   └── guitars.ts                   PRIMARY_GUITAR + RELATED_GUITARS fixtures
    ├── routes/
    │   ├── __root.tsx
    │   ├── index.tsx                    landing page with cards for each variant
    │   ├── regular.tsx                  /regular  → ProductPage + RegularHydration
    │   ├── react-selective.tsx          /react-selective → ProductPage + ReactSelectiveHydration
    │   └── tanstack-deferred.tsx        /tanstack-deferred → ProductPage + TanStackDeferredHydration
    ├── router.tsx
    ├── shared.module.css
    └── styles.css
```

The three hydration-variant files are intentionally tiny — they're just
wrappers around the same `RelatedGuitarsCarousel`, plus a small status chip
that flips from `dehydrated` to `hydrated` so you can see what's happening on
screen.

---

## Quick start

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000/` (or whatever port Vite landed on). The
landing page links into each of the three variant routes:

- `/regular` — baseline eager hydration
- `/react-selective` — `React.lazy` + `<Suspense>` selective hydration
- `/tanstack-deferred` — TanStack `<Hydrate when={interaction()} prefetch={visible()} />`

The header also links to each variant for easy switching.

### Build

```bash
pnpm build
```

Builds the app (Vite + Nitro) into `.output/`.

---

## What's actually being demonstrated

The shared baseline is a product page for the **"Tradewind Sunset Dreadnought"**
acoustic guitar. Below the hero and spec cards, there's a horizontally-scrolling
**"Customers Also Checked Out"** carousel of four related guitars, each
clickable to open a detail modal.

The carousel is the prototypical "below-the-fold, heavy, not-needed-on-first-paint"
component:

- Four product cards with images, ratings, badges, and click handlers.
- `useEffect` + scroll/resize listeners to manage scroll-button enabled state.
- Pulls in `lucide-react` icons (`ChevronLeft`, `ChevronRight`, `Star`).
- Far enough down the page that most users on a standard viewport never see it
  on initial paint.

Each variant shows a **status chip** in the top-right corner of the carousel
section so you can see hydration state on screen:

- **`/regular`** chip: `Carousel: hydrated (eager)` — always
- **`/react-selective`** chip: `Carousel: dehydrated (selective hydration)` → `Carousel: hydrated`
- **`/tanstack-deferred`** chip: `Carousel: dehydrated (waiting for intent)` → `Carousel: hydrated`

Each deferred variant also logs to the browser console when its hydration
callback fires:

- React selective: `[react-lazy] RelatedGuitarsCarousel hydrated`
- TanStack: `[tanstack-hydrate] RelatedGuitarsCarousel hydrated`

---

## The three variants

### 1. `RegularHydration` — baseline (`/regular`)

Vanilla TanStack Start + React 19. The carousel is a static default import
rendered inline:

```tsx
import RelatedGuitarsCarousel from '../carousel/RelatedGuitarsCarousel'

export default function RegularHydration({ guitars, onSelect }) {
  return <RelatedGuitarsCarousel guitars={guitars} onSelect={onSelect} />
}
```

The carousel JS lives in the route bundle and hydrates the moment React picks
up the page. This is the control.

### 2. `ReactSelectiveHydration` — pure React (`/react-selective`)

The React-only equivalent. No TanStack-specific hydration APIs:

```tsx
import { Suspense, lazy } from 'react'

const LazyCarousel = lazy(
  () => import('../carousel/RelatedGuitarsCarousel'),
)

export default function ReactSelectiveHydration({ guitars, onSelect }) {
  return (
    <Suspense fallback={null}>
      <LazyCarousel guitars={guitars} onSelect={onSelect} />
    </Suspense>
  )
}
```

What you're looking at:

- **`React.lazy(() => import(...))`** — Vite/Rollup splits the carousel into
  its own chunk. The route bundle ships without it.
- **`<Suspense fallback={null}>`** — `null` is intentional. TanStack Start's
  streaming SSR inlines the carousel HTML on initial load, so users see the
  server-rendered content immediately. The fallback only matters if this
  boundary first appears after a client-side navigation.
- **Chip state** — flips from `dehydrated (selective hydration)` to
  `hydrated` automatically, on React's own schedule.

**Crucial caveat — selective hydration is about ORDER, not WHETHER.** React
will hydrate this boundary on its own (it doesn't wait for intent). What
"selective hydration" gives you is:

1. The hydration of the lazy boundary is **deprioritized** relative to other
   work React is doing on the page.
2. If the user clicks inside the boundary before React has gotten to it,
   React **bumps that boundary to the front of the hydration queue** and
   handles the click as soon as the chunk is in.

### 3. `TanStackDeferredHydration` — TanStack `<Hydrate>` (`/tanstack-deferred`)

Uses TanStack Start's first-party `<Hydrate>` primitive:

```tsx
import { Hydrate } from '@tanstack/react-start'
import { interaction, visible } from '@tanstack/react-start/hydration'

export default function TanStackDeferredHydration({ guitars, onSelect }) {
  return (
    <Hydrate
      when={interaction({ events: ['focusin', 'pointerenter', 'click'] })}
      prefetch={visible({ rootMargin: '1200px' })}
    >
      <RelatedGuitarsCarousel guitars={guitars} onSelect={onSelect} />
    </Hydrate>
  )
}
```

What you're looking at:

- **`when={interaction(...)}`** — the boundary stays as static SSR'd HTML
  until the user actually interacts with it (hover, focus, or click). React
  does not attach handlers until then.
- **`prefetch={visible({ rootMargin: '1200px' })}`** — as soon as the
  boundary is within ~1200px of the viewport, the chunk and its dependencies
  are fetched in the background so the eventual hydrate is instant.
  Prefetch is separate from hydrate.
- **`onHydrated`** (set on the wrapper) — fires once when the boundary is
  fully hydrated and React owns the DOM.
- **Chip state** — flips from `dehydrated (waiting for intent)` to
  `hydrated` only when intent triggers.

---

## Verifying each variant

Open DevTools, then for each of the three routes:

### 1. SSR is preserved

In the **Elements** tab (or `view-source:`), confirm the carousel HTML is in
the initial document — all four card titles (Lagoon Glow, Island Traveler,
Aloha Classic, Island Wave) should be there before any JS runs. In both
deferred variants the chip should also be present, reading the appropriate
`dehydrated` text.

### 2. The chunk is split

In the **Network** tab, filter by `Carousel`. In both deferred variants you
should see `RelatedGuitarsCarousel` as a separate chunk fetched after the
route bundle. In `/regular` there's no separate carousel chunk — it's
bundled into the route entry.

### 3. The chip flips and the console logs

- **`/tanstack-deferred`**: hover or click anywhere in the carousel area.
  Chip flips to `Carousel: hydrated`. Console logs
  `[tanstack-hydrate] RelatedGuitarsCarousel hydrated`.
- **`/react-selective`**: chip flips to `Carousel: hydrated` on its own
  (usually within a few hundred ms on a fast connection). Console logs
  `[react-lazy] RelatedGuitarsCarousel hydrated`. To see the dehydrated
  state for more than an instant, throttle the network to **Slow 3G**
  before reloading.

### 4. Interactivity restored

After hydration, scroll buttons work, and clicking a card opens the
`GuitarModal` with the product detail view.

---

## Could we do "hydrate on interaction" in pure React?

Short answer: **not with React's own public APIs.** `react-dom` 19 doesn't
expose anything equivalent to `<Hydrate when={interaction()}>`. Selective
hydration is about **order** (React re-prioritizes boundaries the user
clicks on), not **whether** — once the lazy chunk is on the client, React
will hydrate it on its own schedule, and you can't tell it "hold off."

The honest framing for the comparison is: **the React-only story is `lazy`
+ `<Suspense>` + selective hydration**, which gets you smaller bundles and
re-prioritization on click. **The "never until intent" story belongs to
the framework** (TanStack `<Hydrate>`, Astro islands, Qwik resumability,
Marko, Fresh's `client:*` directives).

## Tech stack

- **React 19.2** (`react`, `react-dom`)
- **TanStack Start** (latest) — file-based routing, streaming SSR, Nitro server
- **TanStack Router** (latest) — `@tanstack/react-router` with file-based routing
- **Vite 8** + `@vitejs/plugin-react`
- **Nitro** (nightly) — server runtime
- **CSS Modules** with `composes` for shared utility classes
- `lucide-react` for icons
- `vitest` for tests

The TanStack variant additionally uses `@tanstack/react-start/hydration` for
the `<Hydrate>` primitive and its `interaction()` / `visible()` triggers.

## License

Not specified. Internal demo project for video recording.
