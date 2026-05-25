import {
  Suspense,
  lazy,
  use,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import HydrationChip from "../components/HydrationChip";
import type { Guitar } from "../data/guitars";
import styles from "./HydrationVariant.module.css";

// Same code-split treatment as ReactSelectiveHydration so the carousel JS
// (and its CSS module) lands in its own chunk. This route has the same
// SSR-doesn't-hoist-lazy-CSS problem documented in the README.
const LazyCarousel = lazy(() => import("../carousel/RelatedGuitarsCarousel"));

const INTENT_EVENTS = ["focusin", "pointerenter", "click"] as const;

// Subtree that suspends on a promise we control. `use()` is intentionally
// only called on the client — on the server we want to render straight
// through so the carousel HTML is streamed into the SSR response.
function HydrationGate({
  gate,
  children,
}: {
  gate: Promise<void>;
  children: ReactNode;
}) {
  if (typeof window !== "undefined") {
    use(gate);
  }
  return <>{children}</>;
}

// Sibling of the gated carousel inside the same boundary, so its effect
// fires exactly once the gate has resolved, the lazy chunk has loaded, and
// React has hydrated the subtree.
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

export default function ReactConditionalHydration({
  guitars,
  onSelect,
}: Props) {
  const [hydrated, setHydrated] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Stable gate that survives re-renders so React's `use()` keeps observing
  // the same promise identity across the suspended → resolved transition.
  const gateRef = useRef<{
    promise: Promise<void>;
    resolve: () => void;
    resolved: boolean;
  } | null>(null);
  if (!gateRef.current) {
    let resolve!: () => void;
    const promise = new Promise<void>((res) => {
      resolve = res;
    });
    gateRef.current = { promise, resolve, resolved: false };
  }

  // The wrapper is OUTSIDE the suspended boundary, so it hydrates
  // immediately. This effect runs while the SSR'd carousel HTML inside is
  // still un-hydrated, and attaches intent listeners on the wrapper at
  // capture phase. First matching event flips the gate.
  useEffect(() => {
    if (gateRef.current?.resolved) return;
    const el = wrapRef.current;
    if (!el) return;

    const onIntent = () => {
      const gate = gateRef.current;
      if (!gate || gate.resolved) return;
      gate.resolved = true;
      gate.resolve();
    };

    INTENT_EVENTS.forEach((event) => {
      el.addEventListener(event, onIntent, true);
    });

    return () => {
      INTENT_EVENTS.forEach((event) => {
        el.removeEventListener(event, onIntent, true);
      });
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <HydrationChip
        state={hydrated ? "hydrated" : "dehydrated"}
        detail={hydrated ? undefined : "waiting for intent (DIY)"}
      />

      {/* fallback={null} is intentional: streaming SSR inlines the carousel
          HTML, and the gate keeps that HTML in place until intent fires. */}
      <Suspense fallback={null}>
        <HydrationGate gate={gateRef.current.promise}>
          <LazyCarousel guitars={guitars} onSelect={onSelect} />
          <HydrationSignal
            onHydrated={() => {
              console.log(
                "[react-conditional] RelatedGuitarsCarousel hydrated",
              );
              setHydrated(true);
            }}
          />
        </HydrationGate>
      </Suspense>
    </div>
  );
}
