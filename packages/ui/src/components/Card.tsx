import React, { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { material, shape, text, tone, type } from "./ui.common";
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
const CardRoot = ({
  children,
  variant = "secondary",
  className,
  ...props
}: CardProps): React.JSX.Element => {
  return (
    <div
      className={cn(
        "min-w-0 p-6 [overflow-wrap:anywhere]",
        shape.surface,
        variant === "secondary" ? material.matte : tone.soft[variant],
        text.high,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/* The card's own heading takes the `title` role: a heading inside a surface is never larger than
   the surface's title (§20), and this is that title. */
const CardTitle = ({ children, headingLevel = 3, className, ...props }: CardTitleProps): React.ReactElement =>
  React.createElement(`h${headingLevel}`, { ...props, className: cn("m-0", type.title, text.high, className) }, children);

/* The line under the title: body copy in the supporting tone, close enough to read with the title. */
const CardDescription = ({ className, ...props }: CardDescriptionProps): React.JSX.Element => (
  <p {...props} className={cn("m-0 mt-1", type.body, text.medium, className)} />
);

/* The compound's type is written out, so the published declarations name the props types rather
   than expanding a heading's whole attribute set inline for every React version a consumer runs. */
type CardComponent = ((props: CardProps) => React.JSX.Element) & {
  Title: (props: CardTitleProps) => React.ReactElement;
  Description: (props: CardDescriptionProps) => React.JSX.Element;
};

export const Card: CardComponent = Object.assign(CardRoot, { Title: CardTitle, Description: CardDescription });
