"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import React, { createContext, useContext, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/libs/utils";
import { disclosure, edgeTone, iconStroke } from "./ui.common";
import { motionOrient } from "./ui.motion";

/** A heading level for the groups of an `Accordion`. Base renders a heading around every panel
 *  trigger, because that is what makes the group navigable as a set of sections; which level it
 *  is depends on where the accordion sits in the document. */
export type AccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface AccordionProps {
  children: ReactNode;
  /**
   * Whether more than one panel can be open at once. A group that answers a question is single:
   * opening one section closes the one before it.
   */
  multiple?: boolean;
  /** The item(s) that are expanded, when the application owns the state. */
  value?: BaseAccordion.Root.Props["value"];
  /** The item(s) that start expanded, for an accordion that owns its own state. */
  defaultValue?: BaseAccordion.Root.Props["defaultValue"];
  /** Base's own value-change callback, event details included. */
  onValueChange?: BaseAccordion.Root.Props["onValueChange"];
  /** Whether the whole group is inert. */
  disabled?: boolean;
  /** The heading level the group labels its sections with. */
  headingLevel?: AccordionHeadingLevel;
  /** Adds to the group's own column. The rows and panels style themselves. */
  className?: string;
}

export interface AccordionItemProps {
  children: ReactNode;
  /**
   * Identifies the item. A controlled accordion expands its items by value, so an item without
   * one can still be opened but not addressed from outside.
   */
  value?: BaseAccordion.Item.Props["value"];
  /** Whether this item alone is inert. */
  disabled?: boolean;
  /** Adds to the item's own column. */
  className?: string;
}

export interface AccordionTriggerProps {
  children: ReactNode;
  /** Adds to the row. The row's shape, tone and states are the disclosure recipe's. */
  className?: string;
}

export interface AccordionPanelProps {
  children: ReactNode;
  /** Adds to the measured region. The region's height and clipping are the recipe's. */
  className?: string;
}

/* One section of an `Accordion`. The trigger and the panel it opens are `Accordion.Trigger` and
   `Accordion.Panel`; the heading that labels them is the trigger's own, so a consumer never has
   to build an accessible accordion structure by hand.

   The join between two sections belongs to the section below it: every item after the first draws
   a line on its top edge, in the lightest `row` tone, because the sections are rows of one stacked
   list rather than separate parts of a surface. The line is the item's own, so a fragment or a
   wrapper around items gets the same joins as a flat list.

   The join yields to a closed neighbour under the pointer: a closed item that is hovered hides the line
   above it and the line below it, while an open section keeps its line, so expanded content reads as one
   unit. Both selectors sit inside the pointer media query, so a tap leaves no hover tone behind. */
const joinYield =
  "[@media(hover:hover)_and_(pointer:fine)]:[&:not([data-open]):hover]:border-transparent [@media(hover:hover)_and_(pointer:fine)]:[&:not([data-open]):hover+*]:border-transparent";
const AccordionItem = ({ children, className, ...props }: AccordionItemProps) => (
  <BaseAccordion.Item
    {...props}
    className={cn("min-w-0 [&:not(:first-child)]:border-t", joinYield, edgeTone.row, className)}
  >
    {children}
  </BaseAccordion.Item>
);

type AccordionComponent = ((props: AccordionProps) => React.JSX.Element) & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Panel: typeof AccordionPanel;
};

const HeadingLevelContext = createContext<AccordionHeadingLevel>(3);

/* The heading element Base wraps each trigger in. `render` replaces the element rather than
   adding one, so the level changes without a second wrapper. */
const headingRender = (level: AccordionHeadingLevel) => React.createElement(`h${level}`);

const AccordionTrigger = ({ children, className }: AccordionTriggerProps) => {
  const headingLevel = useContext(HeadingLevelContext);

  return (
    /* The heading is the item's own, so a consumer never writes the accessible accordion
       structure by hand; `render` replaces the element rather than adding a wrapper, so the
       level follows the document instead of being fixed at Base's default. */
    <BaseAccordion.Header render={headingRender(headingLevel)} className={cn("m-0")}>
      <BaseAccordion.Trigger className={cn(disclosure.trigger, className)}>
        <span className={cn("min-w-0 flex-1")}>{children}</span>
        {/* The affordance is a disclosure chevron at its own slot size. It turns in place, so it takes
            `orient`: it is the same object before and after, and only its direction changes. */}
        <span className={cn(disclosure.chevron)} aria-hidden="true">
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            aria-hidden="true"
            className={cn(iconStroke.glyph, motionOrient, "group-data-[panel-open]:rotate-180")}
          />
        </span>
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
};

/* The measured region. Base publishes the panel's open height as its own variable, and the
   disclosure recipe reads `--sui-disclose-height`, so the panel maps the two rather than the
   recipe knowing which primitive it belongs to. */
const AccordionPanel = ({ children, className }: AccordionPanelProps) => (
  <BaseAccordion.Panel
    className={cn(
      "[--sui-disclose-height:var(--accordion-panel-height)]",
      disclosure.panel,
      className
    )}
  >
    <div className={cn("px-4 pb-4 pt-1")}>{children}</div>
  </BaseAccordion.Panel>
);


const Accordion = (({
  children,
  multiple = false,
  disabled = false,
  headingLevel = 3,
  className,
  ...props
}: AccordionProps) => {
  return (
    <HeadingLevelContext.Provider value={headingLevel}>
      <BaseAccordion.Root
        {...props}
        multiple={multiple}
        disabled={disabled}
        className={cn("flex min-w-0 flex-col", className)}
      >
        {children}
      </BaseAccordion.Root>
    </HeadingLevelContext.Provider>
  );
}) as AccordionComponent;

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel = AccordionPanel;

export default Accordion;
