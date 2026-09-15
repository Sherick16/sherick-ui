"use client";

import { useEffect, useState, useSyncExternalStore, type AnimationEvent } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/* `matchMedia` is an external store, so the subscription lives at module scope and
   keeps a stable identity, and the server snapshot assumes motion is allowed. */
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
const getReducedMotionOnServer = () => false;

/* The DOM lifetime of an exit is read from the CSS token rather than copied beside
   it, so a theme that retimes `--sui-duration-overlay-exit` retimes the unmount too
   and the two can never drift apart. */
const overlayExitMs = () => {
  const declared = getComputedStyle(document.documentElement)
    .getPropertyValue("--sui-duration-overlay-exit")
    .trim();
  const value = declared.endsWith("ms")
    ? Number.parseFloat(declared)
    : declared.endsWith("s")
      ? Number.parseFloat(declared) * 1000
      : Number.NaN;
  return Number.isFinite(value) ? value : 160;
};

export interface OverlayPresence {
  /** Keeps the node on the page while it enters, and while its exit step plays. */
  mounted: boolean;
  /** Selects the exit step and tells the overlay to stop responding to pointers. */
  closing: boolean;
  /**
   * Attach to the overlay node (and to its scrim): releases the node when the exit
   * step finishes. `animationend` is the primary signal, so the node leaves as soon
   * as the animation is actually over rather than after a guessed delay.
   */
  onExitEnd: (event: AnimationEvent<HTMLElement>) => void;
}

/* Floating overlay presence.
   The overlay motion family has an entrance and an exit, so an overlay cannot be
   unmounted the moment `open` flips false: it stays on the page for the exit step,
   then leaves. This hook owns that window for every floating overlay in the library
   (menus, tooltips, dialogs), so entrance and exit read identically everywhere.

   Reopening inside the exit window cancels the exit rather than restarting the
   entrance. Under `prefers-reduced-motion` there is no exit step to play, so the node
   leaves immediately instead of lingering visibly for the length of an animation that
   will never run. */
export function useOverlayPresence(open: boolean): OverlayPresence {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(open);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionOnServer
  );

  if (open) {
    if (!mounted) setMounted(true);
    if (closing) setClosing(false);
  } else if (mounted && !closing) {
    if (reducedMotion) setMounted(false);
    else setClosing(true);
  }

  useEffect(() => {
    if (!closing) return;
    /* Guard for an exit that never reports completion: a removed animation, a node
       that is hidden, or a consumer styling the overlay out of the animation. */
    const timer = setTimeout(() => {
      setClosing(false);
      setMounted(false);
    }, overlayExitMs() + 120);
    return () => clearTimeout(timer);
  }, [closing]);

  const onExitEnd = (event: AnimationEvent<HTMLElement>) => {
    if (!closing || event.target !== event.currentTarget) return;
    setClosing(false);
    setMounted(false);
  };

  return { mounted, closing, onExitEnd };
}
