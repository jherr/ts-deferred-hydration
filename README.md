# Deferred Hydration: TanStack vs. React-only

A side-by-side video demo of three versions of the same e-commerce product page, comparing how each approach hydrates a heavy below-the-fold component (`RelatedGuitarsCarousel`).

The point of the comparison is to isolate **one variable** — the hydration primitive — while keeping the UI, styles, data, and component graph identical across all three apps.

## TL;DR

| App | Hydration strategy | Carousel JS in initial route bundle? | Carousel hydrated when? |
| --- | --- | --- | --- |
| `standard-ecommerce/` | Eager (default React 19 + TanStack Start) | Yes | Immediately, with the rest of the page |
| `ts-deferred-hydration/` | TanStack `<Hydrate when={interaction()} prefetch={visible()} />` | No | Only after pointer/focus/click intent fires inside the boundary |
| `react-deferred-hydration/` | `React.lazy` + `<Suspense>` + selective hydration | No | Automatically, but at lower priority than other work; bumps to front on click |

All three render the same product page with the same hero, specs, related-guitars carousel, reviews, and modal. The only intentional differences are in `src/routes/index.tsx` (where the carousel is mounted) and a small amount of carousel/route CSS (where a one-shot entrance animation has been hoisted out of the deferred subtree to prevent flicker on hydration).

---

## Quick start

```bash
# install deps for all three apps in one go
pnpm install:all

# run all three concurrently
pnpm dev
```

`pnpm dev` uses [`concurrently`](https://www.npmjs.com/package/concurrently) to launch the three Vite dev servers in parallel. Each app's `dev` script hard-codes `--port 3000`, so Vite's "port in use, trying another" behavior cascades them to **3000, 3001, 3002** in whatever order they finish booting. Watch the prefixed log lines or scroll up in the terminal to see which app claimed which port:

```
[standard]   ➜  Local:   http://localhost:3000/
[react]      ➜  Local:   http://localhost:3001/
[ts]         ➜  Local:   http://localhost:3002/
```

(Order is racy across boots — if you need a stable assignment, run them individually.)

### Run one at a time

```bash
pnpm dev:standard   # baseline
pnpm dev:react      # React.lazy + Suspense version
pnpm dev:ts         # TanStack <Hydrate> version
```

Each pinned to `http://localhost:3000/`.

### Build all

```bash
pnpm build
```

Builds all three apps (Vite + Nitro) into their respective `.output/` directories.

---

## What's actually being demonstrated

The shared baseline is a product page for the **"Tradewind Sunset Dreadnought"** acoustic guitar. Below the hero and spec cards, there's a horizontally-scrolling **"Customers Also Checked Out"** carousel of four related guitars, each clickable to open a detail modal.

The carousel is the prototypical "below-the-fold, heavy, not-needed-on-first-paint" component:

- It contains four product cards with images, ratings, badges, and click handlers.
- It uses `useEffect` + scroll/resize listeners to manage scroll-button enabled state.
- It pulls in `lucide-react` icons (`ChevronLeft`, `ChevronRight`, `Star`).
- It's far enough down the page that most users on a standard viewport will never see it on initial paint.

In the baseline app it ships in the route bundle and hydrates with everything else. The two "deferred" apps each demonstrate a different way to take it out of the critical path.

Every version uses a **status chip** in the top-right corner of the carousel section so you can see hydration state on screen:

- **Baseline** has no chip — it's just always hydrated.
- **TanStack** chip: `Carousel: dehydrated (waiting for intent)` → `Carousel: hydrated`
- **React-only** chip: `Carousel: dehydrated (selective hydration)` → `Carousel: hydrated`

And each logs to the browser console when its hydration callback fires:

- TanStack: `[deferred-hydration] RelatedGuitarsCarousel hydrated`
- React-only: `[react-lazy] RelatedGuitarsCarousel hydrated`

---

## The three apps

### 1. `standard-ecommerce/` — baseline

Vanilla TanStack Start + React 19. The carousel is a static default import rendered inline:

```tsx
import RelatedGuitarsCarousel from '../components/RelatedGuitarsCarousel'

// …

<RelatedGuitarsCarousel
  guitars={RELATED_GUITARS}
  onSelect={setSelectedGuitar}
/>
```

The carousel JS lives in the route bundle and hydrates the moment React picks up the page. This is the control. **Do not edit this directory** — it's the reference both deferred-hydration apps started from.

### 2. `ts-deferred-hydration/` — TanStack `<Hydrate>`

Uses TanStack Start's first-party `<Hydrate>` primitive:

```tsx
import { Hydrate } from '@tanstack/react-start'
import { interaction, visible } from '@tanstack/react-start/hydration'

// …

<section className={styles.carouselWrap} aria-label="Related guitars">
  <p className={styles.hydrationChip} data-state={carouselHydrated ? 'hydrated' : 'dehydrated'}>
    Carousel: {carouselHydrated ? 'hydrated' : 'dehydrated (waiting for intent)'}
  </p>

  <Hydrate
    when={interaction({ events: ['focusin', 'pointerenter', 'click'] })}
    prefetch={visible({ rootMargin: '1200px' })}
    onHydrated={() => {
      console.log('[deferred-hydration] RelatedGuitarsCarousel hydrated')
      setCarouselHydrated(true)
    }}
  >
    <RelatedGuitarsCarousel
      guitars={RELATED_GUITARS}
      onSelect={setSelectedGuitar}
    />
  </Hydrate>
</section>
```

What you're looking at:

- **`when={interaction(...)}`** — the boundary stays as static SSR'd HTML until the user actually interacts with it (hover, focus, or click). React does not attach handlers until then.
- **`prefetch={visible({ rootMargin: '1200px' })}`** — as soon as the boundary is within ~1200px of the viewport, the chunk and its dependencies are fetched in the background so the eventual hydrate is instant. Prefetch is separate from hydrate.
- **`onHydrated`** — fires once when the boundary is fully hydrated and React owns the DOM.
- **Chip state** — flips from `dehydrated (waiting for intent)` to `hydrated` when intent triggers.

**Bundle effect:** the carousel chunk is split out of the route bundle automatically by `<Hydrate>`. The route bundle ships smaller; the chunk arrives in the background via the visible() prefetch.

**Where the magic lives:** TanStack Start wires `<Hydrate>` into its streaming SSR pipeline, so the SSR'd HTML of the boundary is preserved verbatim on the client and React only takes ownership when the `when` condition fires. Event replay across the boundary is handled by the framework — if the user clicks before hydration, the click is captured and replayed once React owns the tree.

### 3. `react-deferred-hydration/` — pure React (`lazy` + `Suspense`)

The React-only equivalent. No TanStack-specific hydration APIs:

```tsx
import { Suspense, lazy, useState } from 'react'

const RelatedGuitarsCarousel = lazy(
  () => import('../components/RelatedGuitarsCarousel'),
)

// …

<section className={styles.carouselWrap} aria-label="Related guitars">
  <p className={styles.hydrationChip} data-state={carouselHydrated ? 'hydrated' : 'dehydrated'}>
    Carousel: {carouselHydrated ? 'hydrated' : 'dehydrated (selective hydration)'}
  </p>

  <Suspense fallback={null}>
    <RelatedGuitarsCarousel
      guitars={RELATED_GUITARS}
      onSelect={setSelectedGuitar}
      onHydrated={() => {
        console.log('[react-lazy] RelatedGuitarsCarousel hydrated')
        setCarouselHydrated(true)
      }}
    />
  </Suspense>
</section>
```

What you're looking at:

- **`React.lazy(() => import(...))`** — Vite/Rollup splits the carousel into its own chunk. The route bundle ships without it.
- **`<Suspense fallback={null}>`** — `null` is intentional. TanStack Start's streaming SSR inlines the carousel HTML on initial load, so users see the server-rendered content immediately. The fallback only matters if this boundary first appears after a client-side navigation.
- **`onHydrated` prop** — added to `RelatedGuitarsCarousel` and called from a one-shot `useEffect(() => { onHydrated?.() }, [])`. This is the cleanest signal that "the lazy chunk has resolved and the boundary is hydrated."
- **Chip state** — flips from `dehydrated (selective hydration)` to `hydrated` automatically, on React's own schedule.

**Bundle effect:** same outcome as the TanStack version — the carousel is its own chunk and ships out of the route bundle.

**Crucial caveat — selective hydration is about ORDER, not WHETHER.** React will hydrate this boundary on its own (it doesn't wait for intent). What "selective hydration" gives you is:

1. The hydration of the lazy boundary is **deprioritized** relative to other work React is doing on the page.
2. If the user clicks inside the boundary before React has gotten to it, React **bumps that boundary to the front of the hydration queue** and handles the click as soon as the chunk is in.

That's a meaningfully different guarantee than TanStack's `interaction()`, which **never hydrates until intent fires**. See the "Could we do `interaction()` in pure React?" section below.

### Why we hoisted the entrance animation

Both deferred apps share one small CSS fix that the baseline doesn't need.

The carousel's `.section` class composed a `riseIn` keyframe (a one-shot fade-up entrance animation). When the lazy/deferred boundary first mounts on the client, React renders the subtree fresh and the keyframe replays → visible flicker.

The fix in both deferred apps: move `composes: riseIn` from the inner `.section` (inside the deferred boundary) to an outer `.carouselWrap` (outside the boundary, always mounted at SSR). The animation now runs exactly once, at page load, and the carousel content fades in with the rest of the page — independent of when hydration happens.

```css
/* src/routes/index.module.css (both deferred apps) */
.carouselWrap {
  composes: riseIn from "../shared.module.css";
  position: relative;
}

/* src/components/RelatedGuitarsCarousel.module.css (both deferred apps) */
.section {
  composes: islandShell from "../shared.module.css";
  /* no `composes: riseIn` here */
}
```

You can verify the fix by opening DevTools and running `document.querySelector('#collection').getAnimations()` — it should return `[]` both before and after hydration.

---

## Verifying each app

Open DevTools, then for each of the three apps:

### 1. SSR is preserved

In the **Elements** tab (or `view-source:`), confirm the carousel HTML is in the initial document — all four card titles (Lagoon Glow, Island Traveler, Aloha Classic, Island Wave) should be there before any JS runs. In both deferred apps the chip should also be present, reading the appropriate `dehydrated` text.

### 2. The chunk is split

In the **Network** tab, filter by `Carousel`. In both deferred apps you should see `RelatedGuitarsCarousel` as a separate chunk fetched after the route bundle. In the baseline app there's no separate carousel chunk — it's bundled into the route entry.

### 3. The chip flips and the console logs

- **TanStack version**: hover or click anywhere in the carousel area. Chip flips to `Carousel: hydrated`. Console logs `[deferred-hydration] RelatedGuitarsCarousel hydrated`.
- **React version**: chip flips to `Carousel: hydrated` on its own (usually within a few hundred ms on a fast connection). Console logs `[react-lazy] RelatedGuitarsCarousel hydrated`. To see the dehydrated state for more than an instant, throttle the network to **Slow 3G** before reloading.

### 4. No flicker

Run `document.querySelector('#collection').getAnimations()` in the console before and after the chip flips. Both should return `[]` — the entrance animation has already run on the outer `.carouselWrap` and does not replay when the inner subtree hydrates.

### 5. Interactivity restored

After hydration, scroll buttons work, and clicking a card opens the `GuitarModal` with the product detail view.

---

## Could we do "hydrate on interaction" in pure React?

Short answer: **not with React's own public APIs.** `react-dom` 19 doesn't expose anything equivalent to `<Hydrate when={interaction()}>`. Selective hydration is about **order** (React re-prioritizes boundaries the user clicks on), not **whether** — once the lazy chunk is on the client, React will hydrate it on its own schedule, and you can't tell it "hold off."

You can fake it in userland, but you end up rebuilding ~80% of what TanStack's `<Hydrate>` already gives you. The pattern that actually works is the **"React islands"** approach:

1. SSR renders the boundary's HTML normally.
2. On the client, render a placeholder `<div>` with `suppressHydrationWarning` + `dangerouslySetInnerHTML` containing the same SSR markup. React leaves the existing DOM untouched.
3. Attach native event listeners (`pointerenter`, `focusin`, `click`) to that container.
4. On intent: `import()` the component chunk, then `ReactDOM.hydrateRoot(container, <Component {...props} />)` into the placeholder. Detach the listeners.

A pseudo-sketch (not used in this repo):

```tsx
function HydrateOnInteraction({ id, ssrHTML, importer, ...props }) {
  const ref = useRef<HTMLDivElement>(null)
  const hydratedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hydratedRef.current) return

    const events = ['pointerenter', 'focusin', 'click']
    const arm = async () => {
      if (hydratedRef.current) return
      hydratedRef.current = true
      events.forEach((e) => el.removeEventListener(e, arm))

      const { default: Component } = await importer()
      const { hydrateRoot } = await import('react-dom/client')
      hydrateRoot(el, <Component {...props} />)
    }
    events.forEach((e) => el.addEventListener(e, arm, { passive: true }))
    return () => events.forEach((e) => el.removeEventListener(e, arm))
  }, [])

  return (
    <div
      id={id}
      ref={ref}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: ssrHTML }}
    />
  )
}
```

That's the cleaned-up shape. Getting it actually correct in a streaming-SSR app means solving the rest of the iceberg:

- **Capturing `ssrHTML`.** During SSR you need the parent to render the component into a string *and* hand the same string down to the placeholder. TanStack's `<Hydrate>` does this transparently because it owns both sides of the render; in raw React you have to wire it yourself (a second `renderToString` pass, or a serialized data island in the document).
- **Props/state serialization.** Closures over server-only data have to be serialized into the document and rehydrated when `hydrateRoot` runs. Same problem RSC and Astro solve with a serializer.
- **Event triggering inside the dehydrated zone.** A user click on a card *inside* the carousel needs to both (a) trigger hydration and (b) be replayed once React owns the DOM, otherwise the first click is lost. TanStack's `<Hydrate>` uses a delegated listener at the boundary that replays events into the hydrated tree.
- **Concurrent rendering & React owning the parent tree.** The placeholder lives inside React's reconciler. If the parent re-renders for unrelated reasons (theme change, route param change), React may clobber the live sub-root. You need refs + `useMemo` gates to keep React's hands off.
- **Strict Mode** in dev double-invokes effects, which can try to mount-unmount the sub-root twice. Guard for it.

### Existing libraries that package this up

If you want to skip writing it yourself, the ones in the wild are:

- [`react-lazy-hydration`](https://github.com/hadeeb/react-lazy-hydration) — implements the placeholder + `suppressHydrationWarning` + intersection/event trigger pattern. Not actively maintained, but the source is a good reference (~150 lines).
- [`react-hydration-on-demand`](https://github.com/algolia/react-hydration-on-demand) — same idea with a different API.
- [`@builder.io/qwik-react`](https://qwik.dev/docs/integrations/react/) — different architecture entirely; you swap the shell to Qwik to get genuine resumability for React components.

All three predate React 19's streaming SSR, so they have rough edges around `<Suspense>` and concurrent rendering — read the issues before adopting.

### Why TanStack built `<Hydrate>`

It's the same pattern as the userland sketch above, but wired into the framework's SSR pipeline, router, and concurrent renderer, which solves all the bullets above for you:

- Cooperates with TanStack Start's streaming SSR to capture the boundary's HTML without a second render pass.
- Provides a composable DSL — `interaction()`, `visible()`, `media()`, `idle()` — chained with `&&` / `||`.
- Handles event replay across the boundary.
- Is router-aware, so client navigations into the route behave correctly.

The honest framing for the comparison is: **the React-only story is `lazy` + `<Suspense>` + selective hydration**, which gets you smaller bundles and re-prioritization on click. **The "never until intent" story belongs to the framework** (TanStack `<Hydrate>`, Astro islands, Qwik resumability, Marko, Fresh's `client:*` directives).

---

## Project layout

```
ts-deferred-hydration/                  workspace root
├── package.json                         root scripts (concurrently runs all three)
├── README.md                            this file
├── REACT-PROMPT.md                      original spec for the React-only port
├── standard-ecommerce/                  baseline — do not edit
│   └── src/routes/index.tsx             eager carousel mount
├── ts-deferred-hydration/               TanStack <Hydrate> version
│   └── src/routes/index.tsx             carousel wrapped in <Hydrate when={interaction()} prefetch={visible()} />
└── react-deferred-hydration/            React.lazy + Suspense version
    └── src/routes/index.tsx             carousel behind React.lazy + <Suspense>
```

Inside each app, the structure is identical:

```
src/
├── components/
│   ├── Footer.tsx
│   ├── GuitarModal.tsx                  product detail modal
│   ├── Header.tsx
│   ├── RelatedGuitarsCarousel.tsx       the component we're deferring
│   └── ThemeToggle.tsx
├── data/
│   └── guitars.ts                       PRIMARY_GUITAR + RELATED_GUITARS fixtures
├── routes/
│   ├── __root.tsx
│   ├── about.tsx
│   └── index.tsx                        product page — this is where the apps differ
├── router.tsx
├── shared.module.css                    riseIn, islandShell, displayTitle, etc.
└── styles.css
```

The carousel component itself is byte-identical across the two deferred apps except for one detail: the React-only version threads an `onHydrated?: () => void` prop so the route can flip its chip from the inside (since there's no framework-level `onHydrated` to hook into). The TanStack version's carousel is the same as the baseline's because `<Hydrate onHydrated>` handles that signal externally.

## Tech stack

All three apps share:

- **React 19.2** (`react`, `react-dom`)
- **TanStack Start** (latest) — file-based routing, streaming SSR, Nitro server
- **TanStack Router** (latest) — `@tanstack/react-router` with file-based routing
- **Vite 8** + `@vitejs/plugin-react`
- **Nitro** (nightly) — server runtime
- **CSS Modules** with `composes` for shared utility classes
- `lucide-react` for icons
- `vitest` for tests

The TanStack version additionally uses `@tanstack/react-start/hydration` for the `<Hydrate>` primitive and its `interaction()` / `visible()` triggers.

## Reading order

If you're recording the video and want a recommended order:

1. **Show `standard-ecommerce/`** — baseline, normal page, point at the network tab and note carousel JS is in the route bundle.
2. **Show `react-deferred-hydration/`** — same page, note the smaller route bundle and the separate carousel chunk. Throttle network, reload, watch the chip read `dehydrated (selective hydration)` for a beat before flipping. Click a card and emphasize that React was going to hydrate it on its own anyway — the click just deprioritized other work.
3. **Show `ts-deferred-hydration/`** — same page, same bundle split, but now sit on the page without interacting. The chip stays `dehydrated (waiting for intent)` indefinitely. Hover the carousel and watch it flip. Note the `prefetch={visible()}` separately preloads the chunk so the eventual hydrate is instant.
4. **Compare**: the React-only version is the right answer for "this isn't critical, defer it"; the TanStack version is the right answer for "this should never run unless the user actually wants it."

## License

Not specified. Internal demo project for video recording.
