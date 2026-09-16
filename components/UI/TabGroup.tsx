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
}

export interface TabGroupProps {
  tabs: Tab[];
  variant?: Variant;
  className?: string;
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
}

export const TabGroup = ({
  tabs,
  variant = "primary",
  className,
  defaultTabId,
  onTabChange,
}: TabGroupProps) => {
  if (tabs.length === 0) return null;

  return (
    <Tabs.Root
      defaultValue={defaultTabId ?? tabs[0].id}
      onValueChange={(value) => {
        if (typeof value === "string") onTabChange?.(value);
      }}
      className={cn("w-full", className)}
    >
      <Tabs.List
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
            className={({ active }) =>
              cn(
                "relative z-10 min-h-12 min-w-28 flex-1 whitespace-nowrap px-7 py-3 text-sm font-medium",
                shape.pill,
                motion.release,
                focusRing,
                state.press,
                active
                  ? text.high
                  : cn(text.medium, "hover:text-sherick-ink", stateLayer.quiet)
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
