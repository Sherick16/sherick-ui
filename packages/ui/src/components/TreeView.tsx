"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { ChevronRight } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import { density, material, shape, state, stateLayer, text, tone } from "./ui.common";
import { motionFeedback, motionOrient } from "./ui.motion";
import {
  flattenTree,
  isBranch,
  matchTypeahead,
  nearestVisible,
  typeaheadStep,
  type TreeRow,
  type TreeViewItem,
  type TypeaheadBuffer,
} from "./tree";

export type { TreeViewItem };

export interface TreeViewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  /** The nodes to present. Values are unique across the whole tree. */
  items: TreeViewItem[];
  /** The tree's own accessible name. */
  label: string;
  /** The selected node, when the application owns the selection. */
  value?: string | null;
  /** The node selected at first, for a tree that owns its own selection. */
  defaultValue?: string | null;
  /** The node the user just chose, or `null` — selection never follows focus. */
  onValueChange?: (value: string | null) => void;
  /** The expanded nodes, when the application owns the expansion. */
  expandedValues?: string[];
  /** The nodes expanded at first, for a tree that owns its own expansion. */
  defaultExpandedValues?: string[];
  /** The nodes that should be expanded next. A controlled tree may decline the request. */
  onExpandedValuesChange?: (values: string[]) => void;
  /** Whether the whole tree is unavailable. A disabled node is disabled on its own. */
  disabled?: boolean;
  /**
   * Renders a node's own label content — the part of the row beside its icon. It is labelled
   * content rather than a control: `label` stays the node's accessible name, and what the tree
   * renders here is what a reader sees, not a second place to put an action.
   */
  renderItem?: (item: TreeViewItem) => ReactNode;
}

/* How far one level indents the rows beneath it, and where that stops. A deep tree indents only
   so far, so its labels keep the room they need instead of being pushed out of the row; nesting
   itself is untouched, because only the offset is capped — every level still groups its children
   and still reads to assistive technology as one level deeper. */
const indentSteps = ["ps-2", "ps-5", "ps-8", "ps-11", "ps-14"] as const;

const indent = (depth: number) => indentSteps[Math.min(depth, indentSteps.length - 1)];

/* The shared inset ring, read from the tree item's own visible focus and scoped to the row that
   item draws. A tree item has to be the element that holds focus *and* the element that owns the
   group its branch opens, so the ring cannot live on it without tracing the whole subtree; the
   direct-child relation is what keeps the ring on the row, and it is also what stops an ancestor's
   focus from painting a ring on a nested row. */
const rowFocusRing =
  "[[role=treeitem]:focus-visible>&]:ring-2 [[role=treeitem]:focus-visible>&]:ring-inset [[role=treeitem]:focus-visible>&]:ring-sherick-focus";

/**
 * A tree of nodes the user browses, expands and chooses from.
 *
 * Base UI ships no tree primitive — its composite internals are not a supported interface — so
 * this component owns the APG treeview mechanics itself rather than opening a second headless
 * layer beside Base: one roving tab stop, a visible node order the keyboard walks, a branch-only
 * `aria-expanded`, and a selection that is deliberately independent of focus.
 *
 * Three things follow from that ownership, and they are the parts the API is built around:
 *
 * * **Focus and selection are two facts.** Arrow keys move the keyboard and never choose; Enter
 *   and Space choose and never move. A node a typeahead lands on is not selected by arriving.
 * * **A disabled node is local.** It stays discoverable and focusable so it can be announced as
 *   unavailable, its already-visible children are untouched, and it simply cannot be chosen or
 *   opened. A disabled *tree* dims once, at the root.
 * * **The tree repairs its own focus, and only its own.** If a node leaves the tree — removed by
 *   the application, or hidden by a branch that collapsed — the keyboard moves to the nearest
 *   ancestor still shown, but only when the tree already had it. Focus that is somewhere else on
 *   the page is never taken.
 */
const TreeView = forwardRef<HTMLDivElement, TreeViewProps>(function TreeView(
  {
    items,
    label,
    value,
    defaultValue = null,
    onValueChange,
    expandedValues,
    defaultExpandedValues,
    onExpandedValuesChange,
    disabled = false,
    renderItem,
    className,
    onKeyDown,
    onFocus,
    onBlur,
    ...rootProps
  },
  ref
) {
  const direction = useDirection();

  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<string[]>(
    defaultExpandedValues ?? []
  );
  /* The roving tab stop: the node the keyboard was last on. It is state rather than a DOM read so
     the stop survives the node it points at leaving the tree. */
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const typeahead = useRef<TypeaheadBuffer>({ text: "", time: 0 });
  const focusedValueRef = useRef<string | null>(null);
  const ancestorsRef = useRef<string[]>([]);
  const focusInsideRef = useRef(false);

  const selectedValue = value === undefined ? uncontrolledValue : value;
  const expanded = expandedValues === undefined ? uncontrolledExpanded : expandedValues;

  const rows = useMemo(() => flattenTree(items, new Set(expanded)), [items, expanded]);
  const rowsByValue = useMemo(() => new Map(rows.map((row) => [row.item.value, row])), [rows]);
  const selectedVisible =
    selectedValue !== null && rowsByValue.has(selectedValue) ? selectedValue : null;
  const tabStop =
    focusedValue !== null && rowsByValue.has(focusedValue)
      ? focusedValue
      : selectedVisible ?? rows[0]?.item.value ?? null;

  /* The node an event is about is the DOM's answer rather than a mirrored one, so a key and the
     node it acts on can never be a render apart. */
  const rowFor = (target: EventTarget | null) => {
    const value = target instanceof HTMLElement ? target.dataset.suiTreeValue : undefined;
    return value === undefined ? undefined : rowsByValue.get(value);
  };

  const focusNode = (next: string) => {
    setFocusedValue(next);
    itemRefs.current.get(next)?.focus();
  };

  const toggleNode = (item: TreeViewItem) => {
    if (disabled || item.disabled === true || !isBranch(item)) return;

    const next = expanded.includes(item.value)
      ? expanded.filter((value) => value !== item.value)
      : [...expanded, item.value];

    /* Opening and closing never move the keyboard: a branch is opened where it stands, and a
       controlled tree that declines the request is left exactly as it was. */
    if (expandedValues === undefined) setUncontrolledExpanded(next);
    onExpandedValuesChange?.(next);
  };

  const selectNode = (item: TreeViewItem) => {
    if (disabled || item.disabled === true || item.value === selectedValue) return;

    if (value === undefined) setUncontrolledValue(item.value);
    onValueChange?.(item.value);
  };

  /* A handler the caller passed stays a handler the caller passed: the tree runs its own
     mechanics beside it rather than in place of it. */
  const handleFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
    onFocus?.(event);

    const row = rowFor(event.target);
    if (!row) return;

    focusInsideRef.current = true;
    focusedValueRef.current = row.item.value;
    ancestorsRef.current = row.ancestors;
    setFocusedValue(row.item.value);
  };

  const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    onBlur?.(event);

    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;

    focusInsideRef.current = false;
  };

  /* A node can leave the tree underneath the focus that was on it: the application can remove it,
     or collapse the branch that held it. The tree repairs the focus it owns — and only that one,
     so a controlled change can never pull the keyboard out of whatever the user was doing. */
  useEffect(() => {
    const previous = focusedValueRef.current;
    if (!focusInsideRef.current || previous === null || rowsByValue.has(previous)) return;

    const next =
      nearestVisible(ancestorsRef.current, new Set(rowsByValue.keys())) ??
      rows[0]?.item.value ??
      null;

    focusedValueRef.current = next;
    ancestorsRef.current = next === null ? [] : rowsByValue.get(next)?.ancestors ?? [];
    setFocusedValue(next);
    if (next !== null) itemRefs.current.get(next)?.focus();
  }, [rows, rowsByValue]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    /* A caller that handled the key itself owns it: the tree does not also act on it. */
    if (event.defaultPrevented) return;

    const row = rowFor(event.target);
    if (!row) return;

    const position = rows.indexOf(row);
    /* Forward and backward are logical directions, so they follow the page: on a right-to-left
       document the branch opens toward the start of the line, exactly as a disclosure does. */
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const branch = isBranch(row.item);
    const moveTo = (target: TreeRow | undefined) => {
      if (target) focusNode(target.item.value);
    };

    switch (event.key) {
      case "ArrowDown":
        moveTo(rows[position + 1]);
        break;
      case "ArrowUp":
        moveTo(rows[position - 1]);
        break;
      case "Home":
        moveTo(rows[0]);
        break;
      case "End":
        moveTo(rows[rows.length - 1]);
        break;
      case forward:
        if (branch) {
          if (row.expanded) {
            const first = rows[position + 1];
            moveTo(first?.parent === row.item.value ? first : undefined);
          } else {
            toggleNode(row.item);
          }
        }
        break;
      case backward:
        if (branch && row.expanded) toggleNode(row.item);
        else if (row.parent !== null) moveTo(rowsByValue.get(row.parent));
        break;
      case "Enter":
      case " ":
        selectNode(row.item);
        break;
      default: {
        /* Typeahead. A modified keystroke belongs to the browser or the application and a
           composing one to the input method, so neither is a search. */
        if (
          event.key.length !== 1 ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          event.nativeEvent.isComposing
        ) {
          return;
        }

        const step = typeaheadStep(typeahead.current, event.key, Date.now());
        typeahead.current = step.buffer;
        const match =
          matchTypeahead(rows, step.pattern, row.item.value) ??
          /* A sequence that matches nothing is usually a word typed too quickly: fall back to the
             character that was just typed so the keystroke still lands somewhere. */
          (step.pattern.length > 1
            ? matchTypeahead(rows, event.key, row.item.value)
            : null);

        if (match) focusNode(match.item.value);
        break;
      }
    }

    /* Only a key this component acted on is consumed: Tab, and the browser's own shortcuts, still
       leave the tree. */
    event.preventDefault();
  };

  const renderRow = (row: TreeRow) => {
    const { item, depth } = row;
    const branch = isBranch(item);
    const branchExpanded = branch && row.expanded;
    const selected = selectedValue === item.value;
    const nodeDisabled = item.disabled === true;
    const rowDisabled = disabled || nodeDisabled;
    const active = item.value === tabStop;

    return (
      <div
        key={item.value}
        ref={(element) => {
          if (element) itemRefs.current.set(item.value, element);
          else itemRefs.current.delete(item.value);
        }}
        role="treeitem"
        data-sui-tree-value={item.value}
        tabIndex={active ? 0 : -1}
        aria-expanded={branch ? row.expanded : undefined}
        aria-selected={selected}
        /* `aria-disabled` is inherited down a subtree, and this tree deliberately does not mean
           that: a node beneath an unavailable branch is its own node, so it says so rather than
           inheriting an unavailability it does not have. */
        aria-disabled={rowDisabled ? true : row.ancestorDisabled ? false : undefined}
        /* A tree item is independently named. Its accessible name can only come from an explicit
           one, because the group a branch opens is its own child: a name computed from contents
           would read every descendant of that branch as part of the branch. */
        aria-label={item.label}
        className={cn("flex min-w-0 flex-col gap-0.5 outline-none")}
      >
        {/* The row's own pointer handling lives on the row rather than on the item: a nested
            item is a DOM descendant of every item above it, so a handler on the item would
            answer a click made anywhere beneath it. */}
        <div
          data-disabled={rowDisabled ? "" : undefined}
          data-highlighted={active ? "" : undefined}
          onClick={() => selectNode(item)}
          className={cn(
            "flex min-w-0 items-center gap-2 pe-3",
            indent(depth),
            density.compact,
            shape.row,
            motionFeedback,
            text.high,
            rowFocusRing,
            stateLayer.quiet,
            stateLayer.activeRow,
            selected && tone.selected.primary,
            /* A disabled *tree* dims once, at its root, so its rows carry only the cursor; a
               disabled *node* is the one that takes the opacity step, and only over its own row. */
            disabled ? state.disabledDescendant : cn(state.enabled, state.effectiveDisabled)
          )}
        >
          {branch ? (
            /* One row, two pointer targets: the region at its start opens the branch and the rest
               of the row chooses the node. The region is not a control of its own — a control
               inside every branch would be a second thing to tab to and a second thing to announce
               — so the keys provide the same behaviour without it. */
            <span
              aria-hidden="true"
              onClick={(event) => {
                event.stopPropagation();
                toggleNode(item);
              }}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center",
                !rowDisabled && "cursor-pointer"
              )}
            >
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  "size-4",
                  text.medium,
                  motionOrient,
                  branchExpanded ? "rotate-90" : direction === "rtl" ? "rotate-180" : "rotate-0"
                )}
              />
            </span>
          ) : (
            /* A leaf keeps the affordance's own box, so every label in the tree starts at the same
               place whatever its node can do. */
            <span aria-hidden="true" className={cn("size-6 shrink-0")} />
          )}

          {item.icon ? (
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4"
              )}
            >
              {item.icon}
            </span>
          ) : null}

          <span className={cn("truncate")}>{renderItem ? renderItem(item) : item.label}</span>
        </div>

        {branchExpanded ? (
          <div role="group" className={cn("flex min-w-0 flex-col gap-0.5")}>
            {(item.children ?? []).map((child) => {
              const childRow = rowsByValue.get(child.value);
              return childRow ? renderRow(childRow) : null;
            })}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div
      {...rootProps}
      ref={ref}
      role="tree"
      aria-label={label}
      aria-disabled={disabled ? true : undefined}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "flex min-w-0 flex-col gap-0.5 p-2",
        shape.control,
        material.matteQuiet,
        disabled && state.disabled,
        className
      )}
    >
      {items.map((item) => {
        const row = rowsByValue.get(item.value);
        return row ? renderRow(row) : null;
      })}
    </div>
  );
});

TreeView.displayName = "TreeView";

export default TreeView;
