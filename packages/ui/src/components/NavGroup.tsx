import React from "react";
import { cn } from "@/libs/utils";
import NavItem from "./NavItem";

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

const NavGroup = ({ title, items, activeHref, className }: NavGroupProps) => (
  <div className={cn("space-y-1.5 py-2", className)}>
    <h3 className={cn("px-3 pb-1 text-xs font-semibold text-sherick-ink-muted")}>{title}</h3>
    {items.map((item) => (
      <NavItem key={item.href} href={item.href} active={item.href === activeHref}>
        {item.label}
      </NavItem>
    ))}
  </div>
);

export default NavGroup;
