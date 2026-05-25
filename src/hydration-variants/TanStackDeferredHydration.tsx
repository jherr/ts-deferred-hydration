import { useState } from "react";
import { Hydrate } from "@tanstack/react-start";
import { interaction, visible } from "@tanstack/react-start/hydration";
import RelatedGuitarsCarousel from "../carousel/RelatedGuitarsCarousel";
import HydrationChip from "../components/HydrationChip";
import type { Guitar } from "../data/guitars";
import styles from "./HydrationVariant.module.css";

type Props = {
  guitars: Array<Guitar>;
  onSelect: (guitar: Guitar) => void;
};

export default function TanStackDeferredHydration({
  guitars,
  onSelect,
}: Props) {
  const [hydrated, setHydrated] = useState(false);

  return (
    <div className={styles.wrap}>
      <HydrationChip
        state={hydrated ? "hydrated" : "dehydrated"}
        detail={hydrated ? undefined : "waiting for intent"}
      />

      <Hydrate
        when={interaction({ events: ["focusin", "pointerenter", "click"] })}
        prefetch={visible({ rootMargin: "1200px" })}
        onHydrated={() => {
          console.log("[tanstack-hydrate] RelatedGuitarsCarousel hydrated");
          setHydrated(true);
        }}
      >
        <RelatedGuitarsCarousel guitars={guitars} onSelect={onSelect} />
      </Hydrate>
    </div>
  );
}
