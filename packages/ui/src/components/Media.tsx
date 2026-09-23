import React, { forwardRef, type ComponentPropsWithRef } from "react";
import { cn } from "@/libs/utils";
import { focusRingWithin, material, mediaCanvas, shape } from "./ui.common";

type Presentation = {
  aspect?: "auto" | "square" | "portrait" | "landscape" | "video" | "wide";
  fit?: "cover" | "contain";
  position?: "center" | "top" | "bottom";
  radius?: "default" | "none";
  /** Applied to the frame, not the native media element. */
  className?: string;
};

export type MediaImageProps = Presentation &
  Omit<ComponentPropsWithRef<"img">, keyof Presentation | "alt"> &
  ({ alt: string; decorative?: false } | { decorative: true; alt?: never });

export type MediaVideoProps = Presentation &
  Omit<ComponentPropsWithRef<"video">, keyof Presentation | "controls" | "tabIndex" | "aria-hidden"> &
  ({ decorative?: false; controls?: boolean; tabIndex?: number; "aria-hidden"?: boolean | "true" | "false" }
    | { decorative: true; controls?: never; tabIndex?: never; "aria-hidden"?: never });

const aspects = {
  auto: "",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  video: "aspect-video",
  wide: "aspect-[21/9]",
} as const;

const fits = { cover: "object-cover", contain: "object-contain" } as const;
const positions = { center: "object-center", top: "object-top", bottom: "object-bottom" } as const;

const Image = forwardRef<HTMLImageElement, MediaImageProps>(function MediaImage({
  aspect = "auto", fit = "cover", position = "center", radius = "default",
  className, decorative, alt, loading = "lazy", ...props
}, ref) {
  return (
    <span className={cn(
      "relative inline-block max-w-full overflow-hidden align-top",
      aspect !== "auto" && "block w-full",
      aspects[aspect], radius === "default" && shape.surface, material.matteHigh, className
    )}>
      <img {...props} ref={ref} alt={decorative ? "" : alt} loading={loading} className={cn(
        "block max-w-full", aspect === "auto" ? "h-auto" : "absolute inset-0 h-full w-full",
        fits[fit], positions[position]
      )} />
    </span>
  );
});

const Video = forwardRef<HTMLVideoElement, MediaVideoProps>(function MediaVideo({
  aspect = "auto", fit = "contain", position = "center", radius = "default",
  className, decorative, controls, tabIndex, "aria-hidden": ariaHidden,
  playsInline = true, preload = "metadata", ...props
}, ref) {
  return (
    <div className={cn(
      "relative w-full overflow-hidden",
      aspects[aspect], radius === "default" && shape.surface,
      mediaCanvas, !decorative && focusRingWithin, className
    )}>
      <video {...props} ref={ref} controls={decorative ? false : controls}
        aria-hidden={decorative ? true : ariaHidden}
        tabIndex={decorative ? -1 : tabIndex} playsInline={playsInline} preload={preload}
        className={cn("block w-full", aspect === "auto" ? "h-auto" : "absolute inset-0 h-full",
          fits[fit], positions[position])} />
    </div>
  );
});

export const Media = { Image, Video };
