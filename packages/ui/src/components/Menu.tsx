"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import React, { type MouseEventHandler, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import Divider from "./Divider";
import { list, overlay, stacking, tone } from "./ui.common";
import { motionPresenceAnchored } from "./ui.motion";
import type { OverlayAlign, OverlaySide, Variant } from "./ui.types";

export interface MenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface MenuTriggerProps {
  /**
   * The element the trigger's own props are handed to — usually a Sherick `Button`. The surface
   * opens from whatever this renders, so the trigger looks like the control it is.
   */
  render?: ReactElement;
  children?: ReactNode;
  /** Adds to the rendered element. The trigger writes no visual rules of its own. */
  className?: string;
}

export interface MenuContentProps {
  children: ReactNode;
  /** Adds to the popup's own shell. The sheet's material, shape and elevation are the recipe's. */
  className?: string;
  /** The edge the sheet is anchored to. Its entrance grows from whichever edge it resolves to. */
  side?: OverlaySide;
  align?: OverlayAlign;
  sideOffset?: number;
  alignOffset?: number;
}

export interface MenuItemProps {
  children: ReactNode;
  /** Adds to the row's own shell. */
  className?: string;
  /**
   * The action's semantic role. `danger` marks the action itself — the row's label and its
   * highlight take the danger tone, and the popup around it stays neutral.
   */
  variant?: Variant;
  /**
   * An action that cannot be performed. It stays in the list and stays reachable by keyboard — a
   * disabled command is still one a reader has to be able to find and be told about — but it
   * cannot be activated, and it takes no hover or press state.
   */
  disabled?: boolean;
  /** What choosing the action does. The menu closes afterwards; that is Base's contract. */
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export interface MenuSeparatorProps {
  className?: string;
}

/**
 * A surface of actions. Each item acts and the menu closes; nothing here holds a value, so a
 * value-selection surface is `Select` or `Combobox` rather than a menu. Base UI owns keyboard
 * navigation, typeahead, roving focus, Escape, outside dismissal and focus restoration; Sherick
 * UI owns the sheet, the row treatment and the tone an action reads in.
 *
 * This is the whole of the surface Sherick UI publishes to a consumer: the parts below accept the
 * capabilities this package supports, not the primitive's complete prop set. Composing a Base
 * primitive is how these components are built; it is not what they promise.
 */
type MenuComponent = ((props: MenuProps) => React.JSX.Element) & {
  Trigger: typeof MenuTrigger;
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
          className={cn(
            list.sheet,
            "w-max min-w-44 max-w-[min(20rem,var(--available-width))] space-y-1 p-1.5",
            overlay.menu,
            motionPresenceAnchored,
            className
          )}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
};

/* The trigger is Base's, with only the capabilities this package publishes declared above it. The
   surface has to open from the element the caller renders, so this cannot be a Sherick `Button`:
   it hands Base's trigger props to whatever the caller composes. */
const MenuTrigger = ({ ...props }: MenuTriggerProps) => <BaseMenu.Trigger {...props} />;

/* A command row: `list.command` owns its shape, motion, tone and interactive states. A
   destructive command adds only the danger tone to its own label — the row's highlight is then
   a restrained tint of that tone, and the sheet around it stays neutral. */

const MenuItem = ({ variant, className, children, ...props }: MenuItemProps) => (
  <BaseMenu.Item
    {...props}
    className={cn(list.command, variant === "danger" && tone.text.danger, className)}
  >
    <span className={cn("min-w-0 flex-1 truncate")}>{children}</span>
  </BaseMenu.Item>
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

Menu.Trigger = MenuTrigger;
Menu.Content = MenuContent;
Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;

export default Menu;
