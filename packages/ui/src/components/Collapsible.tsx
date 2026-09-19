"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import React, { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/libs/utils";
import { disclosure } from "./ui.common";
import { motionOrient } from "./ui.motion";

export interface CollapsibleProps {
  children: ReactNode;
  /** Whether the region is expanded, when the application owns the state. */
  open?: boolean;
  /** Whether the region starts expanded, for a collapsible that owns its own state. */
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BaseCollapsible.Root.Props["onOpenChange"];
  /** Whether the disclosure is inert. */
  disabled?: boolean;
  /** Adds to the disclosure's own column. The row and the panel style themselves. */
  className?: string;
}

export interface CollapsibleTriggerProps {
  children: ReactNode;
  /** Adds to the row. The row's shape, tone and states are the disclosure recipe's. */
  className?: string;
}

export interface CollapsiblePanelProps {
  children: ReactNode;
  /** Adds to the measured region. The region's height and clipping are the recipe's. */
  className?: string;
}

type CollapsibleComponent = ((props: CollapsibleProps) => React.JSX.Element) & {
  Trigger: typeof CollapsibleTrigger;
  Panel: typeof CollapsiblePanel;
};

const CollapsibleTrigger = ({ children, className }: CollapsibleTriggerProps) => (
  <BaseCollapsible.Trigger className={cn(disclosure.trigger, className)}>
    <span className={cn("min-w-0 flex-1")}>{children}</span>
    {/* The same affordance, and the same in-place turn, as an `Accordion` row: the two are one
        object at two scopes. */}
    <ChevronDown
      aria-hidden="true"
      className={cn("size-4 shrink-0", motionOrient, "group-data-[panel-open]:rotate-180")}
    />
  </BaseCollapsible.Trigger>
);

const CollapsiblePanel = ({ children, className }: CollapsiblePanelProps) => (
  <BaseCollapsible.Panel
    className={cn(
      "[--sui-disclose-height:var(--collapsible-panel-height)]",
      disclosure.panel,
      className
    )}
  >
    <div className={cn("px-4 pb-4 pt-1")}>{children}</div>
  </BaseCollapsible.Panel>
);

/**
 * One region that expands where it sits, without belonging to a group. Base UI owns the expanded
 * state and the trigger's `aria-expanded`/`aria-controls` plumbing — including making the
 * trigger's own state reachable, since nothing else in the page holds it; Sherick UI owns the
 * row, the panel's clipping and how the height moves.
 *
 * It is the same object an `Accordion` item is, at the scope of a single disclosure: use a
 * `Collapsible` for one region on its own, and an `Accordion` when several sections belong to
 * one group.
 */
const Collapsible = (({ children, className, ...props }: CollapsibleProps) => {
  return (
    <BaseCollapsible.Root {...props} className={cn("flex min-w-0 flex-col", className)}>
      {children}
    </BaseCollapsible.Root>
  );
}) as CollapsibleComponent;

Collapsible.Trigger = CollapsibleTrigger;
Collapsible.Panel = CollapsiblePanel;

export default Collapsible;
