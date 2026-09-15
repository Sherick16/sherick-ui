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
  <div className="space-y-2 px-4 py-6 pb-0 rounded-2xl">
    <h3 className="text-sm text-white font-semibold">{title}</h3>
    {items.map((item) => (
      <NavItem key={item.href} to={item.href}>
        {item.label}
      </NavItem>
    ))}
  </div>
);

export default NavGroup;
