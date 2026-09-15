import type { Variant } from "./ui.types";

export const focusRing =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sherick-focus focus-visible:outline-offset-[3px]";

export const focusRingInset =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-focus";

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
  hero: "rounded-[2.25rem]",
  circle: "rounded-full",
} as const;

export const surface = {
  control:
    "bg-sherick-surface-high/[0.66] text-sherick-ink placeholder:text-sherick-ink-muted hover:bg-sherick-surface-high/[0.82] focus:bg-sherick-surface-high/[0.9] focus:shadow-sherick-focus",
  controlError:
    "bg-sherick-danger/[0.075] text-sherick-ink placeholder:text-sherick-danger/[0.72] hover:bg-sherick-danger/[0.10] focus:bg-sherick-danger/[0.13]",
  passive: "bg-sherick-surface/[0.78] text-sherick-ink",
  tonalHigh: "bg-sherick-surface-high/[0.72] text-sherick-ink",
  raised:
    "bg-sherick-surface-float/[0.82] text-sherick-ink shadow-sherick-soft",
  acrylic:
    "bg-sherick-surface-float/[0.60] bg-sherick-glass text-sherick-ink shadow-sherick-glass backdrop-blur-[32px] backdrop-saturate-[1.45] backdrop-brightness-[1.04]",
  acrylicDense:
    "bg-sherick-surface-float/[0.72] bg-sherick-glass-dense text-sherick-ink shadow-sherick-glass backdrop-blur-[26px] backdrop-saturate-[1.38] backdrop-brightness-[1.035]",
  modal:
    "bg-sherick-surface-float/[0.68] bg-sherick-glass text-sherick-ink shadow-sherick-float backdrop-blur-[34px] backdrop-saturate-[1.42] backdrop-brightness-[1.035]",
  tooltip:
    "bg-sherick-surface-float/[0.78] bg-sherick-glass-dense text-sherick-ink shadow-sherick-soft backdrop-blur-[24px] backdrop-saturate-[1.35] backdrop-brightness-[1.025]",
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
  primary: "bg-sherick-primary/[0.22] text-sherick-ink",
  secondary: "bg-sherick-surface-high/[0.82] text-sherick-ink",
  danger: "bg-sherick-danger/[0.16] text-sherick-ink",
  warning: "bg-sherick-warning/[0.16] text-sherick-ink",
  success: "bg-sherick-success/[0.16] text-sherick-ink",
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
  danger: "bg-sherick-danger text-sherick-on-danger",
  warning: "bg-sherick-warning text-sherick-on-warning",
  success: "bg-sherick-success text-sherick-on-success",
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
