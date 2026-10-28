"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { useCallback, useEffect, useState, type CSSProperties } from "react";

/* An overflowing track says that more lies beyond its edge (§19). The cue is a mask on the track itself, so
   it costs no layer and no colour, and it is drawn only on an edge that really has more content behind it.
   It is internal and not part of the public barrel. Tabs and ToggleGroup use it directly; SegmentedControl
   scrolls through ToggleGroup, so it carries the same cue without a second copy. */

/* The width of the fade on an edge that carries more. A tab or a segment is 40px or more, so 16px tells a
   reader the track continues without hiding the label at its edge. */
const FADE_WIDTH = "1rem";
/* Sub-pixel scroll offsets and rounding can leave a track a pixel short of its end, which is not overflow. */
const TOLERANCE = 1;

interface EdgeFade {
  start: boolean;
  end: boolean;
}

const NO_EDGES: EdgeFade = { start: false, end: false };

/* The mask fades only the edges that carry more. Its gradient runs from the track's start edge to its
   end edge, so `to left` is the right way round in a right-to-left page. Only the alpha of the stops is
   used: the mask hides content, it paints no colour. */
const edgeMask = ({ start, end }: EdgeFade, rtl: boolean): CSSProperties | undefined => {
  if (!start && !end) return undefined;

  const stops = [
    start ? `transparent 0, black ${FADE_WIDTH}` : "black 0",
    end ? `black calc(100% - ${FADE_WIDTH}), transparent 100%` : "black 100%",
  ];
  const image = `linear-gradient(${rtl ? "to left" : "to right"}, ${stops.join(", ")})`;

  return { maskImage: image, WebkitMaskImage: image };
};

/**
 * Whether a scrolling track overflows on either edge, and the mask that says so. Overflow is read from the
 * track's own scroll position and size, and the track is re-measured when its size or its content changes. A
 * track that fits draws no mask at all.
 */
export const useEdgeFade = <T extends HTMLElement>() => {
  const [track, setTrack] = useState<T | null>(null);
  const [edges, setEdges] = useState<EdgeFade>(NO_EDGES);
  const rtl = useDirection() === "rtl";

  /* Measured after every render, so a track whose children change is measured again without a second
     tracking mechanism. The observers are dropped on each pass, so nothing stays subscribed. */
  useEffect(() => {
    if (track === null) return;

    /* Start is the offset from the origin, which is the left edge in a left-to-right page and the right
       edge in a right-to-left one; `Math.abs` reads both, because scroll offsets run negative in rtl. */
    const measure = () => {
      const offset = Math.abs(track.scrollLeft);
      const remaining = track.scrollWidth - track.clientWidth - offset;
      const next = { start: offset > TOLERANCE, end: remaining > TOLERANCE };
      setEdges((previous) => (previous.start === next.start && previous.end === next.end ? previous : next));
    };

    measure();
    track.addEventListener("scroll", measure, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(track);
    for (const child of Array.from(track.children)) observer?.observe(child);

    return () => {
      track.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  });

  const ref = useCallback((node: T | null) => setTrack(node), []);

  return { ref, mask: edgeMask(edges, rtl) };
};

type StyleProp<State> = CSSProperties | ((state: State) => CSSProperties | undefined) | undefined;

/**
 * Adds the edge mask to a caller's own style, whether that style is an object or a function of the
 * primitive's state. The caller's properties stay; the mask is added beside them.
 */
export const withEdgeFade = <State>(style: StyleProp<State>, mask: CSSProperties | undefined): StyleProp<State> => {
  if (mask === undefined) return style;
  if (typeof style === "function") return (state) => ({ ...style(state), ...mask });
  return { ...style, ...mask };
};
