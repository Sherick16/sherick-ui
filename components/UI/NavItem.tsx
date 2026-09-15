import React, { type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { focusRing, motionState, pressable } from "./ui.common";

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  icon?: ReactNode;
  to: string;
}

const NavItem = ({ children, icon, className, to, ...props }: NavItemProps) => (
  <a
    href={to}
    className={cn(
      "flex min-h-10 max-w-xs items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap rounded-xl px-3 py-2 text-sm text-sherick-ink-muted hover:bg-sherick-ink/[0.05] hover:text-sherick-ink active:bg-sherick-ink/[0.09]",
      motionState,
      focusRing,
      pressable,
      className
    )}
    {...props}
  >
    {icon && <span className="inline-flex shrink-0 items-center [&>svg]:size-5" aria-hidden="true">{icon}</span>}
    <span className="truncate">{children}</span>
  </a>
);

export default NavItem;
