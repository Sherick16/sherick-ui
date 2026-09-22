"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn, cx } from "@/libs/utils";
import { density, elevation, focusRingInset, selectable, shape, state, stateLayer, text, tone } from "./ui.common";
import { motionFeedback, motionInkPress } from "./ui.motion";

export interface PaginationProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children" | "defaultValue" | "onChange"> {
  /** Total number of pages. `0` is a valid pagination with nothing to navigate to. */
  count: number;
  /** The current page, 1-based. Supplying it makes the pagination controlled. */
  value?: number;
  /** The page an uncontrolled pagination starts on. */
  defaultValue?: number;
  /** Reports the page an ordinary activation asked for. */
  onValueChange?: (page: number) => void;
  /** Pages kept on each side of the current one, capped at 5 to keep rendering bounded. */
  siblingCount?: number;
  disabled?: boolean;
  /** Renders every available page as a real anchor to the href this returns. */
  getPageHref?: (page: number) => string;
  /** The accessible name of a page control. Defaults to `Page {page}`. */
  getPageLabel?: (page: number) => string;
  /** Defaults to `Previous page`. */
  previousLabel?: string;
  /** Defaults to `Next page`. */
  nextLabel?: string;
}

/* What the bounded set is built from: a page, or the gap the set leaves where pages are missing. A
   gap is a mark rather than a control — never a target, never focusable, never announced. */
type PaginationGap = "ellipsis-start" | "ellipsis-end";
type PaginationItem = number | PaginationGap;

/* A total floors, and anything a caller cannot have meant falls back to what the prop documents: an
   empty pagination for a count, one sibling for a sibling count, and the first page for a page. A
   sibling count is a distance, so `0` is meaningful; a page total is not, and `0` is the empty case
   rather than an invalid one. */
const normalizeCount = (count: number) =>
  Number.isSafeInteger(Math.floor(count)) && count > 0 ? Math.floor(count) : 0;
const normalizeSiblings = (value: number) =>
  Number.isFinite(value) && value >= 0 ? Math.min(5, Math.floor(value)) : 1;
const normalizePage = (value: number) => (Number.isFinite(value) && value > 0 ? Math.floor(value) : 1);

/* The bounded set. Both ends are always shown, the current page keeps `siblingCount` neighbours on
   each side, and a page that is missing by a single step is shown rather than replaced by a gap,
   because naming it is both clearer and no longer. Everything the set cannot hold becomes one
   ellipsis per gap, so ten thousand pages render the same number of controls as ten: both ends, both
   wings, the current page and at most two gaps. */
const boundedItems = (count: number, current: number, siblings: number): PaginationItem[] => {
  if (count === 0) return [];

  const spaced = siblings * 2 + 5;
  if (count <= spaced) return Array.from({ length: count }, (_, index) => index + 1);

  const first = Math.max(2, current - siblings);
  const last = Math.min(count - 1, current + siblings);
  const items: PaginationItem[] = [1];

  if (first === 3) items.push(2);
  else if (first > 3) items.push("ellipsis-start");

  for (let page = first; page <= last; page += 1) items.push(page);

  if (last === count - 2) items.push(count - 1);
  else if (last < count - 2) items.push("ellipsis-end");

  items.push(count);
  return items;
};

/* Numbered segments share the recessed-track / raised-selection anatomy of ToggleGroup.
   Native navigation still owns behavior; stable targets press only their number or arrow. */
const controlBase = /* @__PURE__ */ cx(
  "inline-flex shrink-0 select-none items-center justify-center text-sm tabular-nums no-underline",
  density.target,
  shape.row,
  focusRingInset,
  motionFeedback,
  stateLayer.quiet,
  text.medium
);

/* Native focus can leave a partly visible target clipped in a scrolling track. Reveal the
   focused page with the platform primitive; tab order and focus remain entirely native. */
const revealPage = (event: FocusEvent<HTMLElement>) =>
  event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });

/* A sequence of destinations, so it is a native `nav` around a native ordered list: the reader can
   count where they are in it, and assistive technology reads it as one numbered set rather than as a
   row of loose buttons.

   A page is either a button or a real anchor. With `getPageHref` the anchor navigates the way every
   anchor on the web does — the component reports the activation and then leaves the browser, and any
   router the consumer owns, to do the navigating — and a modified click stays the browser's own
   gesture: it opens a new tab or window, and the page the reader is on has not changed, so nothing is
   reported. A boundary control and a disabled pagination are never anchors: they have no actionable
   href, and every control in a disabled pagination is a natively disabled button, so the state sits
   on the controls rather than being announced on the landmark around them.

   Which page is current is published rather than implied by colour alone, and exactly one control
   carries it. A zero-page pagination has no current page and no activation at all. */
const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      count,
      value,
      defaultValue = 1,
      onValueChange,
      siblingCount = 1,
      disabled = false,
      getPageHref,
      getPageLabel,
      previousLabel = "Previous page",
      nextLabel = "Next page",
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const [uncontrolledPage, setUncontrolledPage] = useState(() => normalizePage(defaultValue));

    const pageCount = normalizeCount(count);
    const requested = value === undefined ? uncontrolledPage : normalizePage(value);
    /* A controlled page outside the available range is shown clamped rather than rewritten: the
       component reports what a reader asked for, and never corrects the consumer's own state. */
    const current = pageCount === 0 ? null : Math.min(Math.max(requested, 1), pageCount);

    const activate = (page: number) => {
      setUncontrolledPage(page);
      onValueChange?.(page);
    };

    /* An ordinary activation reports the destination and then lets the anchor do its own job: the
       component never calls `preventDefault`, so the browser keeps its navigation and the consumer's
       router still sees the click. A modified click is not an activation here — `meta`/`ctrl` asks for
       a new tab and `shift` for a new window, and this page is still the one being read. */
    const activateFromAnchor = (event: MouseEvent<HTMLAnchorElement>, page: number) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      activate(page);
    };

    /* The disabled step lands once for the whole pagination, so a control inside it carries only the
       cursor. A boundary control that is disabled on its own carries the whole step, because nothing
       above it has dimmed. */
    const controlState = (onBoundary: boolean) =>
      disabled ? state.disabledDescendant : onBoundary ? state.disabled : state.enabled;

    const items =
      current === null ? [] : boundedItems(pageCount, current, normalizeSiblings(siblingCount));
    const previousBoundary = current === null || current <= 1;
    const nextBoundary = current === null || current >= pageCount;
    const previousPage = current === null ? 1 : Math.max(1, current - 1);
    const nextPage = current === null ? 1 : Math.min(pageCount, current + 1);

    const stepHref = (page: number, onBoundary: boolean) =>
      getPageHref && !disabled && !onBoundary ? getPageHref(page) : undefined;

    const step = (page: number, label: string, onBoundary: boolean, icon: ReactNode) => {
      const href = stepHref(page, onBoundary);

      return (
        <li className={cn("flex")}>
          {href !== undefined ? (
            <a
              href={href}
              aria-label={label}
              className={cn(controlBase, "group", controlState(onBoundary))}
              onClick={(event) => activateFromAnchor(event, page)}
              onFocus={revealPage}
            >
              <span className={cn("inline-flex size-5 items-center justify-center [&>svg]:size-5", motionInkPress)}>{icon}</span>
            </a>
          ) : (
            <button
              type="button"
              disabled={onBoundary || disabled}
              aria-label={label}
              className={cn(controlBase, "group", controlState(onBoundary))}
              onClick={() => activate(page)}
              onFocus={revealPage}
            >
              <span className={cn("inline-flex size-5 items-center justify-center [&>svg]:size-5", !disabled && !onBoundary && motionInkPress)}>{icon}</span>
            </button>
          )}
        </li>
      );
    };

    const pageControl = (page: number) => {
      const isCurrent = page === current;
      const label = getPageLabel ? getPageLabel(page) : `Page ${page}`;
      const href = stepHref(page, false);

      return (
        <li key={page} className={cn("flex")}>
          {href !== undefined ? (
            <a
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={label}
              className={cn(
                controlBase,
                "group px-3",
                isCurrent && cn(tone.selected.primary, elevation.control, "font-medium", !disabled && state.recess),
                controlState(false)
              )}
              onClick={(event) => activateFromAnchor(event, page)}
              onFocus={revealPage}
            >
              <span className={cn(motionInkPress)}>{page}</span>
            </a>
          ) : (
            <button
              type="button"
              disabled={disabled}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={label}
              className={cn(
                controlBase,
                "group px-3",
                isCurrent && cn(tone.selected.primary, elevation.control, "font-medium", !disabled && state.recess),
                controlState(false)
              )}
              onClick={() => activate(page)}
              onFocus={revealPage}
            >
              <span className={cn(!disabled && motionInkPress)}>{page}</span>
            </button>
          )}
        </li>
      );
    };

    /* The gap holds the row's rhythm and says nothing: it is the same footprint a page control holds,
       so the numbers around it stay aligned, and it is hidden from assistive technology so a reader
       counts pages rather than controls. */
    const gap = (key: PaginationGap) => (
      <li key={key} aria-hidden="true" className={cn("flex")}>
        <span className={cn("inline-flex items-center justify-center", density.target, text.medium)}>
          …
        </span>
      </li>
    );

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel ?? "Pagination"}
        tabIndex={props.tabIndex ?? (disabled ? 0 : undefined)}
        className={cn(
          "flex min-w-0 max-w-full overflow-x-auto",
          disabled && cn(state.disabled, shape.control, focusRingInset),
          className
        )}
      >
        {/* Like a segmented track, the sequence scrolls locally instead of breaking across rows.
            The explicit list role preserves Safari's semantics after list-style is removed. */}
        <ol
          role="list"
          className={cn("m-0 flex min-w-max list-none items-center gap-1 p-1", shape.control, selectable.surface, selectable.rest)}
        >
          {step(
            previousPage,
            previousLabel,
            previousBoundary,
            <ArrowLeft aria-hidden="true" className={cn("rtl:-scale-x-100")} />
          )}
          {items.map((item) => (typeof item === "number" ? pageControl(item) : gap(item)))}
          {step(
            nextPage,
            nextLabel,
            nextBoundary,
            <ArrowRight aria-hidden="true" className={cn("rtl:-scale-x-100")} />
          )}
        </ol>
      </nav>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
