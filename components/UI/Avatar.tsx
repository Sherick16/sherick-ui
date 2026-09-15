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

/* A passive identity surface: a matte fill behind the image while it loads, no rim and
   no depth. */
const Avatar = ({
  src,
  alt,
  size = "md",
  shape: shapeRole = "circle",
  className,
  ...props
}: AvatarProps) => {
  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={cn(
        "overflow-hidden",
        dimensions.styles,
        material.matteHigh,
        shapeRole === "circle" ? shape.circle : shape.control,
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        width={dimensions.element}
        height={dimensions.element}
        loading="lazy"
        className="h-full w-full object-cover"
        {...props}
      />
    </div>
  );
};

export default Avatar;
