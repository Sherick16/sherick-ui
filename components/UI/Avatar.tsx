import React, { type ImgHTMLAttributes } from "react";
import { cn } from "@/libs/utils";

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
  shape = "circle",
  className,
  ...props
}: AvatarProps) => {
  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={cn(
        "overflow-hidden bg-sherick-surface-high/70 shadow-sm",
        dimensions.styles,
        shape === "circle" ? "rounded-full" : "rounded-[1.25rem]",
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
