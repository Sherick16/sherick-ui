"use client";

import React, { type KeyboardEvent, type ReactNode, useId, useRef, useState } from "react";
import { cn } from "@/libs/utils";
import { bgMap, styleMap } from "./ui.common";
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
  const groupId = useId();
  const [activeTab, setActiveTab] = useState(defaultTabId ?? tabs[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (tabs.length === 0) return null;

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));
  const active = tabs[activeIndex];

  const activate = (index: number) => {
    const normalizedIndex = (index + tabs.length) % tabs.length;
    const next = tabs[normalizedIndex];
    setActiveTab(next.id);
    onTabChange?.(next.id);
    tabRefs.current[normalizedIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      activate(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      activate(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      activate(0);
    } else if (event.key === "End") {
      event.preventDefault();
      activate(tabs.length - 1);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        role="tablist"
        aria-label="Tabs"
        className="relative flex min-w-max rounded-4xl bg-gray-500 bg-opacity-10"
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 transition-transform duration-200 rounded-3xl bg-opacity-30",
            bgMap[variant]
          )}
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {tabs.map((tab, index) => {
          const selected = tab.id === active.id;
          const tabId = `${groupId}-tab-${tab.id}`;
          const panelId = `${groupId}-panel-${tab.id}`;

          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => activate(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative z-10 min-w-28 flex-1 whitespace-nowrap px-8 py-5 text-sm font-medium transition-colors duration-200 rounded-4xl",
                selected
                  ? cn(styleMap[variant], "bg-opacity-0 hover:bg-opacity-0")
                  : cn(styleMap[variant], "bg-opacity-0 hover:bg-opacity-10 text-opacity-80")
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${groupId}-panel-${active.id}`}
        aria-labelledby={`${groupId}-tab-${active.id}`}
        className="mt-4"
      >
        {active.content}
      </div>
    </div>
  );
};
