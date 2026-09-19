import React from "react";
import { cn } from "@/libs/utils";
import NavItem from "./NavItem";
import { text } from "./ui.common";

export interface NavGroupItem {
  label: string;
  href: string;
}

export interface NavGroupProps {
  title: string;
  items: NavGroupItem[];
  activeHref?: string;
  className?: string;
}

/* A titled group of destinations. The group is **structure inside the surface it sits on**, not a
   surface of its own: it brings no fill, no depth and no rim, so a navigation column reads as one
   region rather than as a card holding cards.

   The title is a section label, not a badge: it takes the same emphasis step a value takes and
   leaves the resting rows a step below it, so the hierarchy comes from the ladder instead of from
   small muted capitals. Its rhythm is deliberately tight — the rows are already separated by the
   density step they hold, so the group adds only the little that makes one group read as one
   group. */
const NavGroup = ({ title, items, activeHref, className }: NavGroupProps) => (
  <div className={cn("flex min-w-0 flex-col gap-0.5 py-1", className)}>
    <h3 className={cn("px-3 pb-1 text-sm font-medium", text.high)}>{title}</h3>
    {items.map((item) => (
      <NavItem key={item.href} href={item.href} active={item.href === activeHref}>
        {item.label}
      </NavItem>
    ))}
  </div>
);

export default NavGroup;
