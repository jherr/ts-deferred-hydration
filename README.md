# Deferred Hydration: TanStack vs. React-only

A single TanStack Start app that demos **four** different ways to hydrate the
same "Guitars You Might Also Like" carousel on an e-commerce product page.

The carousel is deliberately placed **above the fold**, directly under the
breadcrumb and above the featured product. That's not a real e-commerce layout
choice — it's so the carousel is the first thing you see on each route, which
makes the hydration timing obvious on camera without scrolling.

The point of the comparison is to isolate **one variable** — the hydration
primitive — while keeping the UI, styles, data, and component graph identical
across all four variants.

## TL;DR

| Route | Hydration strategy | Carousel JS in initial route bundle? | Carousel hydrated when? |
| --- | --- | --- | --- |
| `/regular` | Eager (default React 19 + TanStack Start) | Yes | Immediately, with the rest of the page |
| `/react-selective` | `React.lazy` + `<Suspense>` + selective hydration | No | Automatically, but at lower priority than other work; bumps to front on click |
| `/react-conditional` | `React.lazy` + `<Suspense>` + DIY `use(promise)` intent gate | No | Only after pointer/focus/click intent fires inside the boundary (manual) |
| `/tanstack-deferred` | TanStack `<Hydrate when={interaction()} prefetch={visible()} />` | No | Only after pointer/focus/click intent fires inside the boundary |

All four render the same product page with the same hero, specs, related-guitars
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
    │   ├── ReactConditionalHydration.tsx
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
    │   ├── react-conditional.tsx        /react-conditional → ProductPage + ReactConditionalHydration
    │   └── tanstack-deferred.tsx        /tanstack-deferred → ProductPage + TanStackDeferredHydration
    ├── router.tsx
    ├── shared.module.css
    └── styles.css
```

The four hydration-variant files are intentionally tiny — they're just
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
landing page links into each of the four variant routes:

- `/regular` — baseline eager hydration
- `/react-selective` — `React.lazy` + `<Suspense>` selective hydration
- `/react-conditional` — `React.lazy` + `<Suspense>` + DIY `use(promise)` intent gate
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
- **`/react-conditional`** chip: `Carousel: dehydrated (waiting for intent (DIY))` → `Carousel: hydrated`
- **`/tanstack-deferred`** chip: `Carousel: dehydrated (waiting for intent)` → `Carousel: hydrated`

Each deferred variant also logs to the browser console when its hydration
callback fires:

- React selective: `[react-lazy] RelatedGuitarsCarousel hydrated`
- React conditional: `[react-conditional] RelatedGuitarsCarousel hydrated`
- TanStack: `[tanstack-hydrate] RelatedGuitarsCarousel hydrated`

---

## The four variants

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

### 3. `ReactConditionalHydration` — DIY intent gate (`/react-conditional`)

Pure React, but explicitly mimicking what `<Hydrate>` does. The lazy + Suspense
foundation is the same as variant 2, with one extra layer: a hand-rolled
`HydrationGate` that suspends on a promise we control until pointer / focus /
click intent fires on the wrapper.

```tsx
import { Suspense, lazy, use, useEffect, useRef, useState } from 'react'

const LazyCarousel = lazy(() => import('../carousel/RelatedGuitarsCarousel'))

function HydrationGate({ gate, children }) {
  // SSR renders straight through; only the client blocks on the gate.
  if (typeof window !== 'undefined') use(gate)
  return <>{children}</>
}

export default function ReactConditionalHydration({ guitars, onSelect }) {
  const wrapRef = useRef(null)
  const gateRef = useRef(null)
  if (!gateRef.current) {
    let resolve
    const promise = new Promise((r) => (resolve = r))
    gateRef.current = { promise, resolve, resolved: false }
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el || gateRef.current.resolved) return
    const onIntent = () => {
      if (gateRef.current.resolved) return
      gateRef.current.resolved = true
      gateRef.current.resolve()
    }
    const events = ['focusin', 'pointerenter', 'click']
    events.forEach((e) => el.addEventListener(e, onIntent, true))
    return () => events.forEach((e) => el.removeEventListener(e, onIntent, true))
  }, [])

  return (
    <div ref={wrapRef}>
      <Suspense fallback={null}>
        <HydrationGate gate={gateRef.current.promise}>
          <LazyCarousel guitars={guitars} onSelect={onSelect} />
        </HydrationGate>
      </Suspense>
    </div>
  )
}
```

What you're looking at:

- **The wrapper hydrates eagerly** (it's outside the suspended boundary), so
  its `useEffect` runs while the SSR'd carousel HTML inside is still
  un-hydrated. The wrapper attaches `pointerenter` / `focusin` / `click`
  listeners on itself at the capture phase.
- **`use(gate)`** is called only on the client. SSR streams the carousel HTML
  normally; on the client, the gate suspends the boundary, so React preserves
  the SSR DOM and skips attaching handlers to it. (React 19's `use()` is one
  of the few APIs that's *legal* to call conditionally, which is what makes
  this pattern viable.)
- **First matching intent event flips the gate.** `use(gate)` returns,
  `React.lazy` then suspends on the chunk fetch, and once that resolves the
  boundary hydrates against the SSR HTML.

This variant exists to make a specific point: **you absolutely can build
"hydrate on intent" with React's own APIs.** It's just DIY. You're rebuilding
the bookkeeping that `<Hydrate>` does for you (the gate, the listeners on a
wrapper, the SSR-vs-client branch, the chunk split). And it inherits the same
SSR + CSS-modules problem documented below — the carousel renders unstyled
between SSR paint and the lazy chunk landing, because `React.lazy` subtrees
don't get their CSS chunks hoisted into `<head>`.

What's deliberately **not** here, vs. `<Hydrate>`:

- **No event replay.** TanStack's `<Hydrate>` re-dispatches the original
  click after hydration so the user's first click "just works". The DIY gate
  triggers hydration but the original click is lost — the user has to click
  again to actually scroll / open the modal. (On desktop, `pointerenter`
  usually fires before `click`, so this is rarely noticeable; on touch
  devices, the first tap is "wasted" on triggering hydration.)
- **No prefetch-on-visible.** `<Hydrate prefetch={visible()} />` warms the
  chunk in the background; the DIY gate only fetches when the gate resolves,
  so there's a perceptible delay between intent and interactivity if the
  chunk is large or the network is slow.
- **No SSR CSS hoisting.** Same caveat as variant 2.

### 4. `TanStackDeferredHydration` — TanStack `<Hydrate>` (`/tanstack-deferred`)

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
| `/react-conditional` | ✗ **missing** (same `React.lazy` tax) | ✗ (deferred — correct) |
| `/tanstack-deferred` | ✓ `RelatedGuitarsCarousel-*.css` (hoisted by `<Hydrate>`) | ✗ (deferred — correct) |

Result on `/react-selective` (and `/react-conditional`, for the same
reason): the carousel HTML lands in the document with class names that have
no corresponding CSS until the lazy JS chunk loads and triggers a runtime
stylesheet injection. Between SSR paint and lazy chunk load, the carousel
renders **completely unstyled** — no rounded card, no padding, no grid, no
scroll buttons, cards collapsed into a vertical flow.

On `/react-conditional` the effect is even more pronounced because the lazy
chunk is *also* gated on intent: the carousel sits in the document
unstyled, indefinitely, until the user actually hovers / focuses / clicks.

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
  subtrees — and that's exactly what both `/react-selective` and
  `/react-conditional` use under the hood.

So this is a second tax on the pure-React deferral story. The React-only
paths get you the bundle split (and, with the DIY gate, even "hydrate on
intent"), but in production you also have to either accept a styling cliff
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

Open DevTools, then for each of the four routes:

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
- **`/react-conditional`**: same intent UX as `/tanstack-deferred` — hover
  or click and the chip flips to `Carousel: hydrated`. Console logs
  `[react-conditional] RelatedGuitarsCarousel hydrated`. Difference vs.
  TanStack: the first click that triggers hydration is **not** replayed
  against the now-interactive carousel; on touch you'll need a second tap.
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

Short answer: **yes — and `/react-conditional` is the proof.** It's just DIY.

`react-dom` 19 doesn't expose anything equivalent to
`<Hydrate when={interaction()}>` directly, but the building blocks are all
there:

- `React.lazy` to split the chunk out of the route bundle.
- `<Suspense>` to keep the SSR HTML in place while the boundary is
  un-hydrated.
- `use(promise)` — legal to call conditionally, so you can suspend the
  client only — to gate hydration on a promise you own.
- A plain `useEffect` on a wrapper outside the boundary to attach
  pointer / focus / click listeners and resolve that promise.

The `ReactConditionalHydration` variant wires those four pieces together in
~60 lines. So the React-only ceiling isn't actually
"selective hydration only" — it's "selective hydration for free, and
hydrate-on-intent if you're willing to write the gate yourself."

What `<Hydrate>` (or Astro `client:visible`, Qwik resumability, Marko, Fresh
`client:*`, etc.) actually buys you on top of the DIY version is the parts
the demo *omits*:

- **Event replay** — re-dispatching the original click after hydration so
  the user's first tap actually does something.
- **A separate `prefetch` strategy** — warming the chunk in the background
  (`prefetch={visible()}`, `idle()`, etc.) so by the time intent fires the
  chunk is already on disk and hydration is instantaneous.
- **SSR CSS chunk hoisting** for boundaries the framework knows about —
  the missing-`<link>`-tag problem documented above only bites the React
  paths because TanStack doesn't trace CSS deps for vanilla `React.lazy`
  subtrees.
- **Declarative ergonomics** — `<Hydrate when={interaction()} prefetch={visible()}>`
  vs. a `useRef` + `useEffect` + `use(promise)` + manual SSR-vs-client
  branch.

So the more honest framing for the comparison is: **pure React gets you to
deferred-on-intent hydration**, but the framework primitive is the one that
makes it production-grade (replay, prefetch, CSS hoisting) instead of "yes
technically, but you'll regret it under load."

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
