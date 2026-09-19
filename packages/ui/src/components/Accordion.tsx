"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import React, { createContext, useContext, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/libs/utils";
import Divider from "./Divider";
import { disclosure } from "./ui.common";
import { motionFeedback, motionOrient } from "./ui.motion";

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
   to build an accessible accordion structure by hand. */
const AccordionItem = ({ children, className, ...props }: AccordionItemProps) => (
  <BaseAccordion.Item {...props} className={cn("min-w-0", className)}>
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
        {/* The affordance turns in place, so it takes `orient`: it is the same object before
            and after, and only its direction changes. */}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 shrink-0", motionOrient, "group-data-[panel-open]:rotate-180")}
        />
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


/* One hairline where two sections meet. The line belongs to the group rather than to a section,
   so a section never draws its own edge, and it is the public `Divider` at its lightest role —
   the line between the rows of one stacked list.

   Three of its properties are the accordion's own anatomy: it is inset to the band the trigger and
   the panel content share, so it marks the join between two sections rather than the width of the
   surface; it keeps air above and below, so the hover tint never sits on a rule; and it yields
   while either section beside it is hovered, so the boundary reads when the group is scanned
   without competing with the row the pointer is on. A section that is already open is excluded
   from the yield, because the line beneath expanded content is what keeps the expanded section
   reading as one unit. */
const withDividers = (children: ReactNode) =>
  React.Children.toArray(children).flatMap((child, index) =>
    index === 0
      ? [child]
      : [
          <Divider
            key={`divider-${index}`}
            weight="row"
            className={cn(
              /* `w-auto` in place of the shared full width: the column stretches it across the
                 band the margins leave, so the inset is real geometry rather than a full-width
                 line that overshoots its own margins. */
              "w-auto mx-4 my-2",
              motionFeedback,
              "[&:has(+div:not([data-open]):hover)]:opacity-0",
              "[div:not([data-open]):hover+&]:opacity-0"
            )}
          />,
          child,
        ]
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
        {withDividers(children)}
      </BaseAccordion.Root>
    </HeadingLevelContext.Provider>
  );
}) as AccordionComponent;

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel = AccordionPanel;

export default Accordion;
