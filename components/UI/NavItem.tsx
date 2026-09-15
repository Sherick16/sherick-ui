import React, { type AnchorHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { focusRing } from "./ui.common";

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  icon?: ReactNode;
  to: string;
}

const NavItem = ({ children, icon, className, to, ...props }: NavItemProps) => (
  <a
    href={to}
    className={cn(
      "right-2 relative max-w-xs block overflow-hidden whitespace-nowrap text-ellipsis text-sm text-gray-200 hover:bg-gray-700 hover:bg-opacity-40 p-2 rounded-3xl",
      focusRing,
      className
    )}
    {...props}
  >
    {icon && <span className="mr-2 inline-block align-middle">{icon}</span>}
    {children}
  </a>
);

export default NavItem;
