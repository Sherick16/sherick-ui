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

/* Selection is a tone, not a depth: a current destination carries the selected fill and
   the accent foreground. It is a row in a list, not a part the user moves, so it stays
   flat. */
const NavItem = ({ children, icon, className, to, active = false, ...props }: NavItemProps) => (
  <a
    href={to}
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex max-w-xs items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2",
      density.compact,
      shape.control,
      motion.release,
      focusRing,
      state.press,
      active
        ? cn(tone.selected.primary, tone.text.primary, "font-medium")
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
