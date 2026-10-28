import { mergeProps } from "@base-ui/react/merge-props";
import React, { cloneElement, type AnchorHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { currentDestination, density, focusRing, iconSlot, shape, state, stateLayer } from "./ui.common";
import { motionFeedback } from "./ui.motion";

export interface NavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  /**
   * The element the row renders as, such as a router link. The row's classes, its current marker and its
   * own props are merged onto it, so the link is the row and keeps its own navigation.
   */
  render?: ReactElement;
}

/* The row's classes and current marker, shared with `NavGroup`'s `renderLink` so a consumer's own link
   reads exactly like a row this component renders. The row takes its container's width and wraps its
   label, so a long destination never clips; only a compact value slot truncates (§19). */
export const navItemAttributes = (active: boolean, className?: string) => ({
  "aria-current": active ? ("page" as const) : undefined,
  className: cn(
    "flex w-full min-w-0 items-center gap-2 px-3",
    density.compact,
    shape.row,
    motionFeedback,
    focusRing,
    active ? currentDestination.row : state.quietInk,
    stateLayer.quiet,
    className
  ),
});

/* A destination in a navigation list. It is a **row**, not a control the size of a field: its
   corner is proportional to its own height, so a compact row never becomes a capsule, and it stays
   flat — depth never announces which page you are on. Density owns the row's height, so the row
   holds the densest step the ladder has and its own anatomy supplies only the inline padding.

   The current destination is the same row holding the quietest accent tint, with its label back at
   full ink and a touch of weight. That is deliberately quieter than an opaque accent fill, which
   belongs to the one primary *action* in a view rather than to the page you happen to be on, and it
   is quieter than the row-selection step a list of choices takes, because a row of destinations is
   scanned rather than chosen. Colour is never the only carrier: the row also publishes
   `aria-current`, which is what assistive technology reads. */
const NavItem = ({ children, icon, className, href, active = false, render, ...props }: NavItemProps) => {
  const row: AnchorHTMLAttributes<HTMLAnchorElement> = {
    href,
    ...navItemAttributes(active, className),
    children: (
      <>
        {icon && (
          <span className={cn(iconSlot.compact)} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={cn("min-w-0 [overflow-wrap:anywhere]")}>{children}</span>
      </>
    ),
    ...props,
  };

  if (render === undefined) return <a {...row} />;

  /* The row's props go onto the caller's element through the same merge Base UI's render prop uses: the
     classes join, the handlers chain, and the element's own props win where they conflict. */
  const element = render as ReactElement<AnchorHTMLAttributes<HTMLAnchorElement>>;
  return cloneElement(element, {
    ...mergeProps<"a">(row, element.props),
    children: element.props.children ?? row.children,
  });
};

export default NavItem;
