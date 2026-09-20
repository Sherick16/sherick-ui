import React from "react";
import { cn } from "@/libs/utils";
import NavItem from "./NavItem";
import { text } from "./ui.common";

export interface NavGroupItem {
  label: string;
  href: string;
}

/** The heading level a group labels itself with. A navigation group owns a real heading, because
 *  that is what makes a column of destinations scannable as groups; which level it is depends on
 *  where the navigation sits in the host document, which this component cannot know. */
export type NavGroupHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface NavGroupProps {
  title: string;
  items: NavGroupItem[];
  activeHref?: string;
  /** The heading level the group labels itself with. Choose it from the document it is placed
   *  in: a group under a page title is a level 2, one in a sidebar section is whatever its
   *  neighbours are. The default matches the package's other grouped surfaces. */
  headingLevel?: NavGroupHeadingLevel;
  className?: string;
}

/* A titled group of destinations. The group is **structure inside the surface it sits on**, not a
   surface of its own: it brings no fill, no depth and no rim, so a navigation column reads as one
   region rather than as a card holding cards.

   The title is a section label, not a badge: it takes the same emphasis step a value takes and
   leaves the resting rows a step below it, so the hierarchy comes from the ladder instead of from
   small muted capitals. Its rhythm is deliberately tight — the rows are already separated by the
   density step they hold, so the group adds only the little that makes one group read as one
   group. Its heading level is the host document's business, so it is a prop rather than a fixed
   level, exactly as an accordion's heading is. */
const NavGroup = ({ title, items, activeHref, headingLevel = 3, className }: NavGroupProps) => (
  <div className={cn("flex min-w-0 flex-col gap-0.5 py-1", className)}>
    {/* The heading is the group's own; the level follows the document it was placed in rather than
        a level this component assumed. Creating the element directly is the same approach an
        accordion heading takes, so both read the same way. */}
    {React.createElement(`h${headingLevel}`, { className: cn("px-3 pb-1 text-sm font-medium", text.high) }, title)}
    {items.map((item) => (
      <NavItem key={item.href} href={item.href} active={item.href === activeHref}>
        {item.label}
      </NavItem>
    ))}
  </div>
);

export default NavGroup;
