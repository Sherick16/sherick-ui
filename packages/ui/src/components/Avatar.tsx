"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import React, { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/libs/utils";
import { material, shape, text, type } from "./ui.common";
import { motionFeedback } from "./ui.motion";

const sizeMap: Record<"sm" | "md" | "lg", { element: number; styles: string }> = {
  sm: { element: 32, styles: "h-8 w-8" },
  md: { element: 64, styles: "h-16 w-16" },
  lg: { element: 128, styles: "h-32 w-32" },
};

export interface AvatarProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  /**
   * What stands in for the picture while it loads and after it fails. Defaults to the initials of `alt`,
   * so an avatar with no picture still says who it is.
   */
  fallback?: ReactNode;
}

/* The first letter of the first two words of the name. */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, size = "md", shape: shapeRole = "circle", fallback, className, ...props }, ref) => {
    const dimensions = sizeMap[size] || sizeMap.md;
    const isDecorative = alt.length === 0;

    return (
      <BaseAvatar.Root
        {...props}
        ref={ref}
        role={isDecorative ? undefined : "img"}
        aria-label={isDecorative ? undefined : alt}
        aria-hidden={isDecorative || undefined}
        className={cn(
          "overflow-hidden",
          dimensions.styles,
          material.matteHigh,
          shapeRole === "circle" ? shape.circle : shape.control,
          className
        )}
      >
        {/* The picture keeps its own source and its own name; the root carries the rest. */}
        <BaseAvatar.Image
          keepMounted
          src={src}
          alt={alt}
          width={dimensions.element}
          height={dimensions.element}
          loading="lazy"
          className={cn(
            "h-full w-full object-cover",
            motionFeedback,
            "data-[error]:opacity-0 data-[loading]:opacity-0"
          )}
        />
        {/* Base shows the fallback until the picture has loaded, and again if it fails, so the place of the
            picture always says something. */}
        <BaseAvatar.Fallback
          className={cn("flex h-full w-full items-center justify-center", type.label, text.medium)}
        >
          {fallback ?? initialsOf(alt)}
        </BaseAvatar.Fallback>
      </BaseAvatar.Root>
    );
  }
);

Avatar.displayName = "Avatar";

export default Avatar;
