"use client";

import { createElement, forwardRef, useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { focusRing } from "./ui.common";

export interface ScrollRegionProps extends HTMLAttributes<HTMLElement> {
  /** The region's accessible name. A scrolling box with no name is not a landmark anyone can find. */
  label: string;
  /** `pre` keeps a code well's preformatted text; every other region is a `div`. */
  as?: "div" | "pre";
}

/*
 * A box that scrolls its own content, and that a keyboard can reach only when there is something to
 * scroll. A scrollable box with no focusable content is a scroll position no keyboard user can get
 * to (axe `scrollable-region-focusable`), but a box that fits has no business being a tab stop, so
 * it is not one. Overflow is measured rather than assumed: the same table is wide on a phone and
 * narrow on a desktop, and both the box and its content can change size while the page is open.
 * The `as` prop is typed with the div's ref, because a code well is never handed a ref.
 */
const ScrollRegion = forwardRef<HTMLDivElement, ScrollRegionProps>(({ label, as = "div", className, children, ...props }, ref) => {
  const element = useRef<HTMLElement | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  const setElement = (node: HTMLElement | null) => {
    element.current = node;
    if (typeof ref === "function") ref(node as HTMLDivElement | null);
    else if (ref) ref.current = node as HTMLDivElement | null;
  };

  /* No dependency list: the box and its children can change size on any render, so the observer is
     re-attached with each one. A measurement that has not changed does not re-render. */
  useEffect(() => {
    const node = element.current;
    if (!node) return;

    const measure = () =>
      setOverflowing(node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight);
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    /* A table grows inside a box that keeps its size, so the box alone would never see the change. */
    Array.from(node.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  });

  return createElement(
    as,
    {
      ...props,
      ref: setElement,
      role: "region",
      "aria-label": label,
      tabIndex: overflowing ? 0 : undefined,
      className: cn("overflow-auto", focusRing, className),
    },
    children
  );
});

ScrollRegion.displayName = "ScrollRegion";

export default ScrollRegion;
