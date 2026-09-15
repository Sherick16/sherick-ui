import type { Variant } from "./ui.types";

export const focusRing =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sherick-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sherick-canvas";

export const focusRingInset =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-primary";

export const motionState =
  "transition-[background-color,color,box-shadow,transform,opacity,filter] duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none";

export const motionComponent =
  "transition-[background-color,color,box-shadow,transform,opacity,filter] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none";

export const pressable =
  "active:scale-[0.98] motion-reduce:active:scale-100";

export const shape = {
  pill: "rounded-full",
  control: "rounded-[1.25rem]",
  surface: "rounded-[1.75rem]",
  hero: "rounded-[2.5rem]",
  circle: "rounded-full",
} as const;

export const surface = {
  control:
    "bg-sherick-surface-high/78 text-sherick-ink placeholder:text-sherick-ink-muted hover:bg-sherick-surface-high/92 focus:bg-sherick-surface-high focus:shadow-[0_10px_30px_-22px_rgba(72,132,255,0.72)]",
  controlError:
    "bg-sherick-danger/14 text-sherick-ink placeholder:text-sherick-danger/65 hover:bg-sherick-danger/18 focus:bg-sherick-danger/20",
  passive: "bg-sherick-surface/90 text-sherick-ink",
  tonalHigh: "bg-sherick-surface-high/84 text-sherick-ink",
  raised:
    "bg-sherick-surface-float/88 text-sherick-ink shadow-sherick-soft ring-1 ring-inset ring-white/[0.035]",
  acrylic:
    "bg-sherick-surface-float/74 text-sherick-ink shadow-sherick-float backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.055]",
  acrylicDense:
    "bg-sherick-surface-float/90 text-sherick-ink shadow-sherick-soft backdrop-blur-xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.05]",
  modal:
    "bg-sherick-surface-float/80 text-sherick-ink shadow-sherick-float backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.06]",
  tooltip:
    "bg-sherick-surface-float/92 text-sherick-ink shadow-sherick-soft backdrop-blur-xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.05]",
} as const;

export const toneTextMap: Record<Variant, string> = {
  primary: "text-sherick-primary",
  secondary: "text-sherick-ink",
  danger: "text-sherick-danger",
  warning: "text-sherick-warning",
  success: "text-sherick-success",
};

export const toneSurfaceMap: Record<Variant, string> = {
  primary: "bg-sherick-primary/16",
  secondary: "bg-sherick-surface-high/70",
  danger: "bg-sherick-danger/14",
  warning: "bg-sherick-warning/14",
  success: "bg-sherick-success/14",
};

export const toneSelectedMap: Record<Variant, string> = {
  primary: "bg-sherick-primary/24 text-sherick-primary",
  secondary: "bg-sherick-surface-high text-sherick-ink",
  danger: "bg-sherick-danger/22 text-sherick-danger",
  warning: "bg-sherick-warning/22 text-sherick-warning",
  success: "bg-sherick-success/22 text-sherick-success",
};

export const toneHoverMap: Record<Variant, string> = {
  primary: "hover:bg-sherick-primary/23",
  secondary: "hover:bg-sherick-surface-high/90",
  danger: "hover:bg-sherick-danger/21",
  warning: "hover:bg-sherick-warning/21",
  success: "hover:bg-sherick-success/21",
};

export const toneActiveMap: Record<Variant, string> = {
  primary: "active:bg-sherick-primary/30",
  secondary: "active:bg-sherick-surface-high",
  danger: "active:bg-sherick-danger/28",
  warning: "active:bg-sherick-warning/28",
  success: "active:bg-sherick-success/28",
};

export const toneStrongMap: Record<Variant, string> = {
  primary: "bg-sherick-primary-strong text-sherick-on-primary",
  secondary: "bg-sherick-surface-high text-sherick-ink",
  danger: "bg-sherick-danger text-sherick-on-primary",
  warning: "bg-sherick-warning text-sherick-canvas",
  success: "bg-sherick-success text-sherick-canvas",
};

export const toneSoftMap: Record<Variant, string> = {
  primary: "bg-sherick-primary/16 text-sherick-primary",
  secondary: "bg-sherick-surface/90 text-sherick-ink",
  danger: "bg-sherick-danger/14 text-sherick-danger",
  warning: "bg-sherick-warning/14 text-sherick-warning",
  success: "bg-sherick-success/14 text-sherick-success",
};

// Backwards-compatible internal aliases. New components should use the focused maps above.
export const styleMap: Record<Variant, string> = Object.fromEntries(
  (Object.keys(toneTextMap) as Variant[]).map((variant) => [
    variant,
    `${toneSurfaceMap[variant]} ${toneTextMap[variant]} ${toneHoverMap[variant]}`,
  ])
) as Record<Variant, string>;

export const bgMap: Record<Variant, string> = toneStrongMap;

export const rowStyleMap: Record<Variant, string> = Object.fromEntries(
  (Object.keys(toneTextMap) as Variant[]).map((variant) => [
    variant,
    `${toneTextMap[variant]} ${toneHoverMap[variant]}`,
  ])
) as Record<Variant, string>;
