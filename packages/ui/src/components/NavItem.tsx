import React, { type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { density, focusRing, shape, stateLayer, text, tone } from "./ui.common";
import { motionTactile } from "./ui.motion";

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

/* A destination in a navigation list. It is a **row**, not a control the size of a field: its
   corner is proportional to its own height, so a compact row never becomes a capsule, and it stays
   flat — depth never announces which page you are on. Density owns the row's height, so the row
   holds the densest step the ladder has and its own anatomy supplies only the inline padding.

   The current destination is the same row holding the quietest accent tint, with its label back at
   full ink and a touch of weight. That is deliberately quieter than an opaque accent fill, which
   belongs to the one primary *action* in a view rather than to the page you happen to be on, and it
   is quieter than the row-selection step a list of choices takes, because a row of destinations is
   scanned rather than chosen. Colour is never the only carrier: the row also publishes
   `aria-current`, which is what assistive technology reads. */
const NavItem = ({ children, icon, className, href, active = false, ...props }: NavItemProps) => (
  <a
    href={href}
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex max-w-xs items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-3",
      density.compact,
      shape.row,
      motionTactile,
      focusRing,
      active
        ? cn(tone.tonal.primary, text.high, "font-medium")
        : cn(text.medium, "hover:text-sherick-ink"),
      stateLayer.quiet,
      className
    )}
    {...props}
  >
    {icon && (
      <span className={cn("inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5")} aria-hidden="true">
        {icon}
      </span>
    )}
    <span className={cn("truncate")}>{children}</span>
  </a>
);

export default NavItem;
