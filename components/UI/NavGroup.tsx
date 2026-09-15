import React from "react";
import NavItem from "./NavItem";

export interface NavGroupItem {
  label: string;
  href: string;
}

export interface NavGroupProps {
  title: string;
  items: NavGroupItem[];
}

const NavGroup = ({ title, items }: NavGroupProps) => (
  <div className="space-y-1.5 py-3">
    <h3 className="px-3 pb-1 text-xs font-semibold text-zinc-500">{title}</h3>
    {items.map((item) => (
      <NavItem key={item.href} to={item.href}>
        {item.label}
      </NavItem>
    ))}
  </div>
);

export default NavGroup;
