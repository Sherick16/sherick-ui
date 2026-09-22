import { ChevronRight } from "lucide-react";
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/libs/utils";
import { focusRing, text } from "./ui.common";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  items: BreadcrumbItem[];
  /**
   * How an intermediate destination is rendered — the escape hatch for a router link. The supplied
   * props carry the destination, the shared classes and the item's own content, and the renderer
   * spreads them onto its element.
   */
  renderLink?: (item: BreadcrumbItem, props: AnchorHTMLAttributes<HTMLAnchorElement>) => ReactNode;
}

/* The trail of places a reader came through. It is **passive**: links and text, no state, no effect
   and no client directive, so a server component renders it and a page that only reads it ships no
   behaviour.

   The last item is the page the reader is on, and it is text even when the caller supplies an href
   for it — a link to where you already are is a control with nothing left to do, and `aria-current`
   is what says which one it is. Every intermediate destination is a real anchor, so an ordinary
   click, a modified click and every browser affordance work the way they do everywhere else on the
   web: no router is required and none is assumed. `renderLink` is the caller's way to substitute its
   own link component, and it receives the href, the accessible relationship and the shared classes
   the plain anchor would have been given.

   Separators are decorative chevrons: they mirror with the writing direction and are hidden from
   assistive technology. Long labels wrap and the trail yields to a narrow parent instead of
   collapsing, truncating or hiding a place — which places are behind the reader is information, and a
   breadcrumb that hides one is a breadcrumb that lies. */
const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, renderLink, className, "aria-label": ariaLabel, ...props }, ref) => {
    /* The props an intermediate destination is rendered from, composed once so the caller's own link
       and the default anchor are the same object: the same destination, the same content and the same
       shared classes — including the focus ring the keyboard needs to see. */
    const linkProps = (item: BreadcrumbItem): AnchorHTMLAttributes<HTMLAnchorElement> => ({
      href: item.href,
      className: cn("min-w-0 [overflow-wrap:anywhere]", focusRing, text.medium, "hover:text-sherick-ink"),
      children: item.label,
    });

    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel ?? "Breadcrumb"}
        className={cn("min-w-0", className)}
      >
        {/* A native ordered list: the trail has an order, and the order is the information. The row
            wraps rather than overflowing, so a long trail stays inside its column. `role="list"`
            restates the element's own role rather than adding one, because `list-none` — which removes
            the marker a breadcrumb does not want — is also what makes Safari drop the semantics. */}
        <ol
          role="list"
          className={cn(
            "m-0 flex min-w-0 list-none flex-wrap items-center gap-x-2 gap-y-1 p-0",
            text.medium
          )}
        >
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1;

            return (
              <li key={index} className={cn("flex min-w-0 items-center gap-x-2")}>
                {index > 0 && (
                  <ChevronRight aria-hidden="true" className={cn("size-4 shrink-0 rtl:-scale-x-100")} />
                )}
                {isCurrent ? (
                  <span
                    aria-current="page"
                    className={cn("min-w-0 font-medium [overflow-wrap:anywhere]", text.high)}
                  >
                    {item.label}
                  </span>
                ) : item.href ? (
                  renderLink ? (
                    renderLink(item, linkProps(item))
                  ) : (
                    <a {...linkProps(item)} />
                  )
                ) : (
                  <span className={cn("min-w-0 [overflow-wrap:anywhere]")}>{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

export default Breadcrumb;
