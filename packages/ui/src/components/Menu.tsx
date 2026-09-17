"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import React, { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import Divider from "./Divider";
import { list, motion, overlay, stacking, tone } from "./ui.common";
import type { Variant } from "./ui.types";

export interface MenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: BaseMenu.Root.Props["onOpenChange"];
}

export interface MenuContentProps {
  children: ReactNode;
  /** Adds to the popup's own shell. The sheet's material, shape and elevation are the recipe's. */
  className?: string;
  side?: ComponentProps<typeof BaseMenu.Positioner>["side"];
  align?: ComponentProps<typeof BaseMenu.Positioner>["align"];
  sideOffset?: ComponentProps<typeof BaseMenu.Positioner>["sideOffset"];
  alignOffset?: ComponentProps<typeof BaseMenu.Positioner>["alignOffset"];
}

export interface MenuItemProps
  extends Omit<ComponentProps<typeof BaseMenu.Item>, "className" | "children"> {
  children: ReactNode;
  /** Adds to the row's own shell. */
  className?: string;
  /**
   * The action's semantic role. `danger` marks the action itself — the row's label and its
   * highlight take the danger tone, and the popup around it stays neutral.
   */
  variant?: Variant;
}

export interface MenuSeparatorProps {
  className?: string;
}

/**
 * A surface of actions. Each item acts and the menu closes; nothing here holds a value, so a
 * value-selection surface is `Select` or `Combobox` rather than a menu. Base UI owns keyboard
 * navigation, typeahead, roving focus, Escape, outside dismissal and focus restoration; Sherick
 * UI owns the sheet, the row treatment and the tone an action reads in.
 */
type MenuComponent = ((props: MenuProps) => React.JSX.Element) & {
  Trigger: typeof BaseMenu.Trigger;
  Content: typeof MenuContent;
  Item: typeof MenuItem;
  Separator: typeof MenuSeparator;
};

const MenuContent = ({
  children,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset,
}: MenuContentProps) => {
  return (
    <BaseMenu.Portal>
      {/* A menu is modal, which is Base's own default and the reason its positioner already lays a
          plane over everything outside the sheet: an outside press dismisses the menu through
          that plane without reaching the page beneath, so Sherick renders no second backdrop
          and writes no dismissal logic of its own. */}
      <BaseMenu.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn(stacking.float)}
      >
        <BaseMenu.Popup
          className={({ open }) =>
            cn(
              list.sheet,
              "w-max min-w-44 max-w-[min(20rem,var(--available-width))] space-y-1 p-1.5",
              overlay.menu,
              open ? motion.overlayIn : motion.overlayOut,
              className
            )
          }
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
};

/* A command row: `list.command` owns its shape, motion, tone and interactive states. A
   destructive command adds only the danger tone to its own label — the row's highlight is then
   a restrained tint of that tone, and the sheet around it stays neutral. */
const MenuItem = forwardRef<HTMLElement, MenuItemProps>(
  ({ variant, className, children, ...props }, ref) => {
    return (
      <BaseMenu.Item
        ref={ref}
        {...props}
        className={cn(list.command, variant === "danger" && tone.text.danger, className)}
      >
        <span className={cn("min-w-0 flex-1 truncate")}>{children}</span>
      </BaseMenu.Item>
    );
  }
);

MenuItem.displayName = "MenuItem";

/* Base's menu separator *is* the shared Base separator, which is the component `Divider`
   renders: the menu uses the public divider rather than re-deriving a line. The margin is the
   menu's own spacing between parts. */
const MenuSeparator = ({ className }: MenuSeparatorProps) => (
  <Divider className={cn("my-1", className)} />
);

const Menu = (({ children, open, defaultOpen, onOpenChange }: MenuProps) => {
  return (
    <BaseMenu.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </BaseMenu.Root>
  );
}) as MenuComponent;

Menu.Trigger = BaseMenu.Trigger;
Menu.Content = MenuContent;
Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;

export default Menu;
