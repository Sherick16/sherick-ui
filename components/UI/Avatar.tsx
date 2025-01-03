import React from "react";
import { cn } from "@/libs/utils";
import NextImage from "next/image";

const sizeMap: Record<"sm" | "md" | "lg", { element: number; styles: string }> =
  {
    sm: {
      element: 32,
      styles: "w-8 h-8",
    },
    md: {
      element: 64,
      styles: "w-16 h-16",
    },
    lg: {
      element: 128,
      styles: "w-32 h-32",
    },
  };

const Avatar = ({
  src,
  alt,
  size = "md",
  className,
  ...props
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-4xl overflow-hidden",
        sizeMap[size]?.styles || sizeMap["md"]?.styles,
        className
      )}
    >
      <NextImage
        src={src}
        alt={alt}
        className="object-cover w-full h-full bg-gray-400"
        width={sizeMap[size]?.element || 64}
        height={sizeMap[size]?.element || 64}
        {...props}
      />
    </div>
  );
};

export default Avatar;
