import React, { forwardRef, type ForwardRefExoticComponent, type HTMLAttributes, type ReactNode, type RefAttributes } from "react";
import { cn } from "@/libs/utils";
import { headingRhythm, material, shape, text, tone, type } from "./ui.common";
import { Variant } from "./ui.types";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: Variant;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  /** The heading level is the host document's business, so it is a prop rather than a fixed level. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

/* A card is a large matte surface: tone separates it from the canvas, and it carries
   no elevation until something lifts it. A neutral card *is* the matte surface; the semantic
   variants are that role's soft container, and they carry meaning rather than decoration — a
   tinted card says something about its content, so it is not a way to make a card stand out. */
const CardRoot = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "secondary", className, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          "min-w-0 p-6 [overflow-wrap:anywhere]",
          shape.surface,
          variant === "secondary" ? material.matte : tone.soft[variant],
          text.high,
          className
        )}
      >
        {children}
      </div>
    );
  }
);

CardRoot.displayName = "Card";

/* The card's own heading takes the `title` role: a heading inside a surface is never larger than
   the surface's title (§20), and this is that title. */
const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, headingLevel = 3, className, ...props }, ref) =>
    React.createElement(`h${headingLevel}`, { ...props, ref, className: cn("m-0", type.title, text.high, className) }, children)
);

CardTitle.displayName = "Card.Title";

/* The line under the title: body copy in the supporting tone, close enough to read with the title. Its gap
   above is the title rhythm, the one gap a title and its supporting line share (§13). */
const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p {...props} ref={ref} className={cn("m-0", headingRhythm.title, type.body, text.medium, className)} />
  )
);

CardDescription.displayName = "Card.Description";

/* The compound's type is written out, so the published declarations name the props types rather
   than expanding a heading's whole attribute set inline for every React version a consumer runs. */
type CardComponent = ForwardRefExoticComponent<CardProps & RefAttributes<HTMLDivElement>> & {
  Title: ForwardRefExoticComponent<CardTitleProps & RefAttributes<HTMLHeadingElement>>;
  Description: ForwardRefExoticComponent<CardDescriptionProps & RefAttributes<HTMLParagraphElement>>;
};

export const Card: CardComponent = Object.assign(CardRoot, { Title: CardTitle, Description: CardDescription });
