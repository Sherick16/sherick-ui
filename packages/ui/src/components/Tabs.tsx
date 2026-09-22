"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  elevation,
  focusRingInset,
  selectable,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { motionRelocate, motionTactile } from "./ui.motion";
import { Variant } from "./ui.types";

type TabsChangeDetails = Parameters<NonNullable<BaseTabs.Root.Props["onValueChange"]>>[1];

export interface Tab {
  id: string;
  label: string;
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
  ariaLabel?: string;
}

export const Tabs = ({
  tabs,
  variant = "primary",
  className,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "Tabs",
}: TabsProps) => {
  if (tabs.length === 0) return null;

  const fallbackValue = tabs.find((tab) => !tab.disabled)?.id ?? tabs[0].id;
  const uncontrolledDefault = defaultValue ?? fallbackValue;

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
         track still scrolls as one object. */}
      <div className={cn("overflow-x-auto")}>
        <BaseTabs.List
          aria-label={ariaLabel}
          className={cn(
            "relative flex min-w-max p-1",
            shape.prominent,
            selectable.surface,
            selectable.rest
          )}
        >
          <BaseTabs.Indicator
            className={cn(
              "absolute left-[var(--active-tab-left)] top-[var(--active-tab-top)] h-[var(--active-tab-height)] w-[var(--active-tab-width)]",
              shape.control,
              tone.selected[variant],
              elevation.control,
              motionRelocate
            )}
          />

          {tabs.map((tab) => (
            <BaseTabs.Tab
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={({ active, disabled }) =>
                cn(
                  "relative z-10 min-w-28 flex-1 whitespace-nowrap px-7 py-3 font-medium",
                  density.normal,
                  shape.control,
                  motionTactile,
                  focusRingInset,
                  active ? text.high : cn(text.medium, !disabled && "hover:text-sherick-ink"),
                  !disabled && stateLayer.quiet,
                  disabled && state.disabled
                )
              }
            >
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
