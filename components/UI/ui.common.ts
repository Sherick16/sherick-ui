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
  hero: "rounded-[3rem]",
  circle: "rounded-full",
} as const;

export const surface = {
  control:
    "bg-sherick-surface-high/[0.66] text-sherick-ink placeholder:text-sherick-ink-muted hover:bg-sherick-surface-high/[0.82] focus:bg-sherick-surface-high/[0.9] focus:shadow-[0_10px_30px_-24px_rgba(90,145,255,0.42)]",
  controlError:
    "bg-sherick-danger/[0.075] text-sherick-ink placeholder:text-sherick-danger/[0.72] hover:bg-sherick-danger/[0.10] focus:bg-sherick-danger/[0.13]",
  passive: "bg-sherick-surface/[0.78] text-sherick-ink",
  tonalHigh: "bg-sherick-surface-high/[0.72] text-sherick-ink",
  raised:
    "bg-sherick-surface-float/[0.82] text-sherick-ink shadow-sherick-soft",
  acrylic:
    "bg-sherick-surface-float/[0.66] text-sherick-ink shadow-sherick-float backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.045]",
  acrylicDense:
    "bg-sherick-surface-float/[0.80] text-sherick-ink shadow-sherick-soft backdrop-blur-xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.04]",
  modal:
    "bg-sherick-surface-float/[0.70] text-sherick-ink shadow-sherick-float backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.045]",
  tooltip:
    "bg-sherick-surface-float/[0.84] text-sherick-ink shadow-sherick-soft backdrop-blur-xl backdrop-saturate-150 ring-1 ring-inset ring-white/[0.04]",
} as const;

export const toneTextMap: Record<Variant, string> = {
  primary: "text-sherick-primary",
  secondary: "text-sherick-ink",
  danger: "text-sherick-danger",
  warning: "text-sherick-warning",
  success: "text-sherick-success",
};

export const toneSurfaceMap: Record<Variant, string> = {
  primary: "bg-sherick-primary/[0.12]",
  secondary: "bg-sherick-surface-high/[0.56]",
  danger: "bg-sherick-danger/[0.09]",
  warning: "bg-sherick-warning/[0.09]",
  success: "bg-sherick-success/[0.09]",
};

export const toneSelectedMap: Record<Variant, string> = {
  primary: "bg-sherick-primary/[0.18] text-sherick-primary",
  secondary: "bg-sherick-surface-high/[0.82] text-sherick-ink",
  danger: "bg-sherick-danger/[0.16] text-sherick-danger",
  warning: "bg-sherick-warning/[0.16] text-sherick-warning",
  success: "bg-sherick-success/[0.16] text-sherick-success",
};

export const toneHoverMap: Record<Variant, string> = {
  primary: "hover:bg-sherick-primary/[0.18]",
  secondary: "hover:bg-sherick-surface-high/[0.72]",
  danger: "hover:bg-sherick-danger/[0.14]",
  warning: "hover:bg-sherick-warning/[0.14]",
  success: "hover:bg-sherick-success/[0.14]",
};

export const toneActiveMap: Record<Variant, string> = {
  primary: "active:bg-sherick-primary/[0.24]",
  secondary: "active:bg-sherick-surface-high/[0.88]",
  danger: "active:bg-sherick-danger/[0.20]",
  warning: "active:bg-sherick-warning/[0.20]",
  success: "active:bg-sherick-success/[0.20]",
};

export const toneStrongMap: Record<Variant, string> = {
  primary: "bg-sherick-primary-strong text-sherick-on-primary",
  secondary: "bg-sherick-surface-high text-sherick-ink",
  danger: "bg-sherick-danger text-sherick-on-primary",
  warning: "bg-sherick-warning text-sherick-canvas",
  success: "bg-sherick-success text-sherick-canvas",
};

export const toneSoftMap: Record<Variant, string> = {
  primary: "bg-sherick-primary/[0.12] text-sherick-primary",
  secondary: "bg-sherick-surface/[0.78] text-sherick-ink",
  danger: "bg-sherick-danger/[0.09] text-sherick-danger",
  warning: "bg-sherick-warning/[0.09] text-sherick-warning",
  success: "bg-sherick-success/[0.09] text-sherick-success",
};

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
