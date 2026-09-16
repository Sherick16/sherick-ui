"use client";

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import React, { type ImgHTMLAttributes } from "react";
import { cn } from "@/libs/utils";
import { material, shape } from "./ui.common";

const sizeMap: Record<"sm" | "md" | "lg", { element: number; styles: string }> = {
  sm: { element: 32, styles: "h-8 w-8" },
  md: { element: 64, styles: "h-16 w-16" },
  lg: { element: 128, styles: "h-32 w-32" },
};

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height"> {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
}

const Avatar = ({
  src,
  alt,
  size = "md",
  shape: shapeRole = "circle",
  className,
  ...props
}: AvatarProps) => {
  const dimensions = sizeMap[size] || sizeMap.md;
  const isDecorative = alt.length === 0;

  return (
    <BaseAvatar.Root
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
      <BaseAvatar.Image
        keepMounted
        src={src}
        alt=""
        width={dimensions.element}
        height={dimensions.element}
        loading="lazy"
        className="h-full w-full object-cover data-[error]:invisible data-[loading]:invisible"
        {...props}
      />
    </BaseAvatar.Root>
  );
};

export default Avatar;
