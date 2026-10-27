"use client";

import { Menu as BaseMenu } from "@base-ui/react/menu";
import React, { type MouseEventHandler, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import Divider from "./Divider";
import { list, overlay, stacking, text, tone, type } from "./ui.common";
import { motionPresenceAnchored } from "./ui.motion";
import type { OverlayAlign, OverlaySide, PartProps, Variant } from "./ui.types";

export interface MenuProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  /** Base's own open-change callback, event details included. */
  onOpenChange?: BaseMenu.Root.Props["onOpenChange"];
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

export interface MenuContentProps extends Omit<PartProps<"div">, "children" | "className"> {
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
  /** The row's leading mark. It takes the command icon's slot, beside the label. */
  icon?: ReactNode;
  /** The gesture that runs this action elsewhere. It is a hint, and the menu registers no shortcut. */
  shortcut?: ReactNode;
  /**
   * Renders the row as another element, such as a link. Base hands the row's own attributes and its
   * handlers to that element, so the row keeps its menu behaviour.
   */
  render?: ReactElement;
}

export interface MenuSeparatorProps {
  className?: string;
}

/** A group of rows, announced under its label. */
export type MenuGroupProps = PartProps<"div">;

/** The heading of a group. Base names the group from it, so it is read as the group begins. */
export type MenuLabelProps = PartProps<"div">;

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
  Group: typeof MenuGroup;
  Label: typeof MenuLabel;
};

/* The popup takes the rest props, so an `id` or an `aria-label` names the menu for a reader who
   cannot see a heading. */
const MenuContent = ({
  children,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset,
  ...props
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
          {...props}
          className={cn(
            list.sheet,
            "w-max min-w-44 max-w-[min(20rem,var(--available-width))] space-y-1 p-1",
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
   a restrained tint of that tone, and the sheet around it stays neutral. The icon and the shortcut
   take the same anatomy as a palette command, so a menu and a palette read the same. */

const MenuItem = ({ variant, className, children, icon, shortcut, render, ...props }: MenuItemProps) => (
  <BaseMenu.Item
    {...props}
    render={render}
    className={cn(list.command, variant === "danger" && tone.text.danger, className)}
  >
    {icon !== undefined ? (
      /* A danger row's mark takes the row's own tone, so the mark and the label say the same thing. */
      <span aria-hidden="true" className={cn(list.commandIcon, variant !== "danger" && text.medium)}>
        {icon}
      </span>
    ) : null}
    <span className={cn("min-w-0 flex-1 truncate")}>{children}</span>
    {shortcut !== undefined ? (
      <span className={cn("ms-3 shrink-0 font-sherick-mono", type.caption, text.medium)}>{shortcut}</span>
    ) : null}
  </BaseMenu.Item>
);

MenuItem.displayName = "MenuItem";

/* A group is the menu's own structure: its rows sit together under one label, and the label is the
   group's name for assistive technology. */
const MenuGroup = ({ className, ...props }: MenuGroupProps) => (
  <BaseMenu.Group {...props} className={cn("space-y-1", className)} />
);

MenuGroup.displayName = "MenuGroup";

/* The label is the command-list heading recipe, so a group's heading in a menu and in a palette match. */
const MenuLabel = ({ className, ...props }: MenuLabelProps) => (
  <BaseMenu.GroupLabel {...props} className={cn(list.groupLabel, className)} />
);

MenuLabel.displayName = "MenuLabel";

/* Base's menu separator *is* the shared Base separator, which is the component `Divider`
   renders: the menu uses the public divider rather than re-deriving a line. The margin is the
   menu's own spacing between parts. */
const MenuSeparator = ({ className }: MenuSeparatorProps) => (
  <Divider className={cn("mx-3 my-1 w-auto", className)} />
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
Menu.Group = MenuGroup;
Menu.Label = MenuLabel;

export default Menu;
