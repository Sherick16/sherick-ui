"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { useEdgeFade } from "./edge-fade";
import {
  density,
  elevation,
  focusRingInset,
  heldFill,
  heldLabel,
  iconSlot,
  selectable,
  shape,
  state,
  stateLayer,
  text,
} from "./ui.common";
import { motionRelocateLong, motionTactileWide } from "./ui.motion";
import { Variant } from "./ui.types";

type TabsChangeDetails = Parameters<NonNullable<BaseTabs.Root.Props["onValueChange"]>>[1];

/** The English copy a tab list names itself with. */
export interface TabsLabels {
  /** The tab list's accessible name, when neither `aria-label` nor `aria-labelledby` names it. */
  list: string;
}

const defaultTabsLabels: TabsLabels = {
  list: "Tabs",
};

export interface Tab {
  id: string;
  /** The tab's name. The tab is named by its label, so the label may be any content a row can hold. */
  label: ReactNode;
  /** A mark before the label. It is decorative: the label alone names the tab. */
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  variant?: Variant;
  className?: string;
  value?: string;
  defaultValue?: string;
  /** Base's value-change event details are passed through unchanged. */
  onValueChange?: (tabId: string, eventDetails: TabsChangeDetails) => void;
  /** Names the tab list. Left unset, the list takes the name in `labels`. */
  "aria-label"?: string;
  /** Names the tab list from an element that already labels it. It takes precedence over a name. */
  "aria-labelledby"?: string;
  /** The same name as `aria-label`, kept for callers that already use it. */
  ariaLabel?: string;
  /** The English copy the tab list names itself with. */
  labels?: Partial<TabsLabels>;
}

export const Tabs = ({
  tabs,
  variant = "primary",
  className,
  value,
  defaultValue,
  onValueChange,
  "aria-label": ariaLabelProp,
  "aria-labelledby": ariaLabelledBy,
  ariaLabel,
  labels,
}: TabsProps) => {
  /* Called before the empty check, so the hook order never depends on how many tabs there are. */
  const edge = useEdgeFade<HTMLDivElement>();

  if (tabs.length === 0) return null;

  const fallbackValue = tabs.find((tab) => !tab.disabled)?.id ?? tabs[0].id;
  const uncontrolledDefault = defaultValue ?? fallbackValue;
  const name = ariaLabelProp ?? ariaLabel ?? { ...defaultTabsLabels, ...labels }.list;

  return (
    <BaseTabs.Root
      value={value}
      defaultValue={value === undefined ? uncontrolledDefault : undefined}
      onValueChange={(nextValue, eventDetails) => {
        if (typeof nextValue !== "string") return;
        onValueChange?.(nextValue, eventDetails);
      }}
      className={cn("min-w-0 w-full [overflow-wrap:anywhere]", className)}
    >
      {/* A tab row that cannot fit where it was placed scrolls inside itself rather than widening
         the page. The row is the content that is wider than its container, so owning that overflow
         here is the same thing `Table` does, and it is what keeps a 320px-wide reader from having
         to pan the whole page sideways to reach the third tab — no consumer wrapper to know
         about, and nothing about the shape of the control changes. The scroller wraps the track
         and not the whole control, so the region an application placed the tabs in still owns the
         horizontal axis of everything below it, and the track keeps its own content width so the
         track still scrolls as one object. The edge fade says which side has more tabs behind it. */}
      <div ref={edge.ref} style={edge.mask} className={cn("overflow-x-auto")}>
        <BaseTabs.List
          aria-label={ariaLabelledBy ? undefined : name}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            "relative flex min-w-max p-1",
            shape.prominent,
            selectable.surface,
            selectable.rest
          )}
        >
          {/* Base publishes only the activation direction on the indicator, and that value persists between
              selections, so it cannot tell a selection from a resize. The travel therefore stays on every
              position change; the gap is recorded in DESIGN_LANGUAGE §12. */}
          <BaseTabs.Indicator
            className={cn(
              "absolute left-[var(--active-tab-left)] top-[var(--active-tab-top)] h-[var(--active-tab-height)] w-[var(--active-tab-width)]",
              shape.control,
              heldFill[variant],
              elevation.control,
              motionRelocateLong
            )}
          />

          {tabs.map((tab) => (
            <BaseTabs.Tab
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={({ active, disabled }) =>
                cn(
                  "relative z-10 inline-flex min-w-28 flex-1 items-center justify-center gap-2 whitespace-nowrap px-7 py-3 font-medium",
                  density.normal,
                  shape.control,
                  motionTactileWide,
                  focusRingInset,
                  active ? heldLabel[variant] : disabled ? text.medium : state.quietInk,
                  !disabled && stateLayer.quiet,
                  disabled && state.disabled
                )
              }
            >
              {tab.icon && (
                <span className={cn(iconSlot.normal)} aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </BaseTabs.Tab>
          ))}
        </BaseTabs.List>
      </div>

      {tabs.map((tab) => (
        <BaseTabs.Panel key={tab.id} value={tab.id} className={cn("mt-5")}>
          {tab.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
};
