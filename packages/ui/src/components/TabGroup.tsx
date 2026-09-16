"use client";

import { Tabs } from "@base-ui/react/tabs";
import React, { type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  elevation,
  focusRing,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";
import { Variant } from "./ui.types";

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabGroupProps {
  tabs: Tab[];
  variant?: Variant;
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (tabId: string) => void;
  ariaLabel?: string;
  /** @deprecated Use `defaultValue` instead. */
  defaultTabId?: string;
  /** @deprecated Use `onValueChange` instead. */
  onTabChange?: (tabId: string) => void;
}

export const TabGroup = ({
  tabs,
  variant = "primary",
  className,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = "Tabs",
  defaultTabId,
  onTabChange,
}: TabGroupProps) => {
  if (tabs.length === 0) return null;

  const fallbackValue = tabs.find((tab) => !tab.disabled)?.id ?? tabs[0].id;
  const uncontrolledDefault = defaultValue ?? defaultTabId ?? fallbackValue;

  return (
    <Tabs.Root
      value={value}
      defaultValue={value === undefined ? uncontrolledDefault : undefined}
      onValueChange={(nextValue) => {
        if (typeof nextValue !== "string") return;
        onValueChange?.(nextValue);
        onTabChange?.(nextValue);
      }}
      className={cn("w-full", className)}
    >
      <Tabs.List
        aria-label={ariaLabel}
        className={cn(
          "relative flex min-w-max bg-sherick-surface/[0.72] p-1.5",
          shape.pill,
          elevation.recessed
        )}
      >
        <Tabs.Indicator
          className={cn(
            "absolute left-[var(--active-tab-left)] top-[var(--active-tab-top)] h-[var(--active-tab-height)] w-[var(--active-tab-width)]",
            shape.pill,
            tone.selected[variant],
            elevation.control,
            motion.release
          )}
        />

        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={({ active, disabled }) =>
              cn(
                "relative z-10 min-h-12 min-w-28 flex-1 whitespace-nowrap px-7 py-3 text-sm font-medium",
                shape.pill,
                motion.release,
                focusRing,
                !disabled && state.press,
                active
                  ? text.high
                  : cn(text.medium, !disabled && "hover:text-sherick-ink", !disabled && stateLayer.quiet),
                disabled && state.disabled
              )
            }
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.id} value={tab.id} className="mt-5">
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
};
