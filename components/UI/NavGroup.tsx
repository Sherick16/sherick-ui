import React from "react";
import NavItem from "./NavItem";

export interface NavGroupItem {
  label: string;
  href: string;
}

export interface NavGroupProps {
  title: string;
  items: NavGroupItem[];
  activeHref?: string;
}

const NavGroup = ({ title, items, activeHref }: NavGroupProps) => (
  <div className="space-y-1.5 py-2">
    <h3 className="px-3 pb-1 text-xs font-semibold text-sherick-ink-muted">{title}</h3>
    {items.map((item) => (
      <NavItem key={item.href} to={item.href} active={item.href === activeHref}>
        {item.label}
      </NavItem>
    ))}
  </div>
);

export default NavGroup;
