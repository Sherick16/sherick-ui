import React, { type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import {
  density,
  focusRing,
  motion,
  shape,
  state,
  stateLayer,
  text,
  tone,
} from "./ui.common";

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  icon?: ReactNode;
  to: string;
  active?: boolean;
}

/* The current destination holds the selected tone and the selected depth, so it reads
   as pressed into the navigation surface rather than merely recolored. */
const NavItem = ({ children, icon, className, to, active = false, ...props }: NavItemProps) => (
  <a
    href={to}
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex max-w-xs items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap",
      density.compact,
      shape.control,
      motion.release,
      focusRing,
      state.press,
      active
        ? cn(tone.selected.primary, state.selected, "font-medium")
        : cn(text.medium, "hover:text-sherick-ink", stateLayer.quiet),
      className
    )}
    {...props}
  >
    {icon && <span className="inline-flex shrink-0 items-center [&>svg]:size-5" aria-hidden="true">{icon}</span>}
    <span className="truncate">{children}</span>
  </a>
);

export default NavItem;
