import React, { type ImgHTMLAttributes } from "react";
import { cn } from "@/libs/utils";

const sizeMap: Record<"sm" | "md" | "lg", { element: number; styles: string }> = {
  sm: { element: 32, styles: "w-8 h-8" },
  md: { element: 64, styles: "w-16 h-16" },
  lg: { element: 128, styles: "w-32 h-32" },
};

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height"> {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

const Avatar = ({ src, alt, size = "md", className, ...props }: AvatarProps) => {
  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <div className={cn("rounded-4xl overflow-hidden", dimensions.styles, className)}>
      <img
        src={src}
        alt={alt}
        width={dimensions.element}
        height={dimensions.element}
        loading="lazy"
        className="object-cover w-full h-full bg-gray-400"
        {...props}
      />
    </div>
  );
};

export default Avatar;
