import { Suspense, lazy, useEffect, useState } from "react";
import HydrationChip from "../components/HydrationChip";
import type { Guitar } from "../data/guitars";
import styles from "./HydrationVariant.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// SSR + CSS-modules workaround (uncomment during the walkthrough).
//
// The carousel below is loaded via React.lazy, so Vite splits its CSS module
// into its own chunk. TanStack Start's SSR pipeline does not trace CSS deps
// for vanilla React.lazy subtrees, so the SSR'd <head> omits the carousel's
// stylesheet — the carousel renders unstyled until the lazy JS chunk loads
// and runtime-injects it.
//
// Eagerly importing the same .module.css file here forces Vite to put it in
// the route's eager CSS graph, which TanStack Start *does* hoist into <head>.
// The lazy chunk's own CSS import becomes a no-op (same module, already
// loaded) and class-name hashes line up because they're keyed on the source
// file path, not the import site.
// ─────────────────────────────────────────────────────────────────────────────
//import "../carousel/RelatedGuitarsCarousel.module.css";

// Code-split the carousel into its own chunk. React preserves the SSR'd HTML
// while this chunk is in flight, and selective hydration deprioritizes it
// relative to higher-priority work elsewhere on the page.
const LazyCarousel = lazy(() => import("../carousel/RelatedGuitarsCarousel"));

// Sibling of the lazy carousel inside the same Suspense boundary, so its
// effect fires exactly once the lazy chunk has resolved and React has
// hydrated the subtree.
function HydrationSignal({ onHydrated }: { onHydrated: () => void }) {
  useEffect(() => {
    onHydrated();
  }, [onHydrated]);
  return null;
}

type Props = {
  guitars: Array<Guitar>;
  onSelect: (guitar: Guitar) => void;
};

export default function ReactSelectiveHydration({ guitars, onSelect }: Props) {
  const [hydrated, setHydrated] = useState(false);

  return (
    <div className={styles.wrap}>
      <HydrationChip
        state={hydrated ? "hydrated" : "dehydrated"}
        detail={hydrated ? undefined : "selective hydration"}
      />

      {/* fallback={null} is intentional: streaming SSR inlines the carousel
          HTML on first load, so users see it immediately. */}
      <Suspense fallback={null}>
        <LazyCarousel guitars={guitars} onSelect={onSelect} />
        <HydrationSignal
          onHydrated={() => {
            console.log("[react-lazy] RelatedGuitarsCarousel hydrated");
            setHydrated(true);
          }}
        />
      </Suspense>
    </div>
  );
}
