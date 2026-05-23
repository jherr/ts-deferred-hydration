# Deferred Hydration: TanStack vs. React-only

A single TanStack Start app that demos **three** different ways to hydrate the
same "Guitars You Might Also Like" carousel on an e-commerce product page.

The carousel is deliberately placed **above the fold**, directly under the
breadcrumb and above the featured product. That's not a real e-commerce layout
choice — it's so the carousel is the first thing you see on each route, which
makes the hydration timing obvious on camera without scrolling.

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
    │   ├── HydrationChip.tsx            shared display-only status pill
    │   ├── HydrationChip.module.css
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

The chip itself is a shared, display-only `HydrationChip` component in
`src/components/`. Each variant owns the hydration state (the `useState` and
the `onHydrated` callback) and passes the resulting `state` + `detail` into
the chip:

```tsx
<HydrationChip
  state={hydrated ? 'hydrated' : 'dehydrated'}
  detail={hydrated ? undefined : 'waiting for intent'}
/>
```

Renders `Carousel: dehydrated (waiting for intent)` while waiting, then
`Carousel: hydrated` once the chip's state prop flips.

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
acoustic guitar. Directly under the breadcrumb (and intentionally above the
hero, see note above), there's a horizontally-scrolling **"Guitars You Might
Also Like"** carousel of four related guitars, each clickable to open a detail
modal.

The carousel is a stand-in for any "heavy, not-needed-immediately" component
you'd want to defer:

- Four product cards with images, ratings, badges, and click handlers.
- `useEffect` + scroll/resize listeners to manage scroll-button enabled state.
- Pulls in `lucide-react` icons (`ChevronLeft`, `ChevronRight`, `Star`).
- Big enough on its own to ship as its own chunk and show a noticeable
  bundle-size delta between `/regular` and the two deferred variants.

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

## Production gotcha: SSR + CSS Modules + `React.lazy`

There's a real, visible bug in the production build of the
`/react-selective` route. It shows up only in `pnpm build` + `node
.output/server/index.mjs` — dev mode (`pnpm dev`) hides it because Vite's
dev server inlines all CSS modules into a single per-route aggregator.

The carousel is the only component imported via `React.lazy`. In the prod
build, Vite splits it into its own JS chunk **and** its own CSS chunk
(`RelatedGuitarsCarousel-*.css`). The SSR pipeline renders the carousel
HTML into the streamed response using hashed class names from that CSS
module — but does **not** emit a `<link rel="stylesheet">` for the
carousel's CSS chunk in the document `<head>`.

Inspect the SSR `<head>` of each route in production:

| Route | Carousel CSS chunk in `<head>`? | Carousel JS preload? |
| --- | --- | --- |
| `/regular` | ✓ `RelatedGuitarsCarousel-*.css` | ✓ preloaded |
| `/react-selective` | ✗ **missing** | ✗ (deferred — correct) |
| `/tanstack-deferred` | ✓ `RelatedGuitarsCarousel-*.css` (hoisted by `<Hydrate>`) | ✗ (deferred — correct) |

Result on `/react-selective`: the carousel HTML lands in the document with
class names that have no corresponding CSS until the lazy JS chunk loads
and triggers a runtime stylesheet injection. Between SSR paint and lazy
chunk load, the carousel renders **completely unstyled** — no rounded card,
no padding, no grid, no scroll buttons, cards collapsed into a vertical
flow.

You can reproduce it deterministically by disabling JavaScript in DevTools
(so you only see the SSR output, no runtime CSS injection) and comparing
`/regular` vs `/react-selective`. The contrast is dramatic and makes a
great on-camera moment.

### Why this happens

React itself has no built-in way to tell the framework *"the CSS module I
just imported belongs to a chunk that's needed for the HTML I just
rendered, please hoist its `<link>` into the document head."* Frameworks
have to instrument the bundler's CSS manifest themselves to map
server-rendered chunks → their CSS deps.

- Next.js solves it via Webpack/Turbopack flight manifests.
- TanStack Start solves it for `<Hydrate>` boundaries (which is why
  `/tanstack-deferred` ships the carousel CSS even though it withholds the
  JS preload), but **does not** trace CSS deps for vanilla `React.lazy`
  subtrees.

So this is a second tax on the pure-React deferral story, on top of the
"order, not whether" caveat. The React-only path gets you the bundle
split, but in production you also have to either accept a styling cliff
or work around it manually.

### Workarounds

1. **Hoist the CSS import out of the lazy module.** Import
   `RelatedGuitarsCarousel.module.css` from a non-lazy parent (e.g.,
   `ReactSelectiveHydration.tsx` or `ProductPage.tsx`). The CSS ends up in
   the route's eager CSS graph and gets `<link>`-hoisted into the head;
   the lazy chunk's own CSS import becomes a no-op at runtime. Loses some
   of the bundle-trimming purity but it's a one-line fix.
2. **Manually emit a `<link rel="stylesheet">` for the chunk** in
   `__root.tsx` or the variant. Hacky and hardcodes a Vite output hash.
3. **File it as a TanStack Start issue** — the framework arguably should
   trace the CSS deps of any module rendered server-side, not just
   `<Hydrate>` boundaries.

The fix from option 1 is parked **commented-out** at the top of
`src/hydration-variants/ReactSelectiveHydration.tsx`. Uncomment it on
camera, rebuild (`pnpm build && node .output/server/index.mjs`), and
the carousel goes from "unstyled until the lazy chunk lands" to "styled
the moment the SSR HTML paints."

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
