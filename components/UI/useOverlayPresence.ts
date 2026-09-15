"use client";

import { useEffect, useState } from "react";

/* Mirrors `--sui-duration-overlay-exit` in theme.css. The exit is released on a timer
   rather than on `animationend` because `prefers-reduced-motion` removes the animation,
   and a node that never fires `animationend` would never leave the page. */
const OVERLAY_EXIT_MS = 160;

/* Floating overlay presence.
   The overlay motion family has an entrance and an exit, so an overlay cannot be
   unmounted the moment `open` flips false: it stays on the page for the exit step, then
   leaves. This hook owns that window for every floating overlay in the library (menus,
   tooltips, modals), so entrance and exit read identically everywhere.

   `mounted` keeps the node on the page, `closing` selects the exit step and tells the
   overlay to stop responding to pointers. Reopening inside the exit window cancels the
   exit rather than restarting the entrance. */
export function useOverlayPresence(open: boolean) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(open);

  if (open) {
    if (!mounted) setMounted(true);
    if (closing) setClosing(false);
  } else if (mounted && !closing) {
    setClosing(true);
  }

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setClosing(false);
      setMounted(false);
    }, OVERLAY_EXIT_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  return { mounted, closing };
}
