import type { Variant } from "./ui.types";

export const focusRing =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export const focusRingInset =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400";

export const motionState =
  "transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out motion-reduce:transition-none motion-reduce:transform-none";

export const motionComponent =
  "transition-[background-color,color,box-shadow,transform,opacity] duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none";

export const pressable =
  "active:scale-[0.985] motion-reduce:active:scale-100";

export const shape = {
  pill: "rounded-4xl",
  control: "rounded-2xl",
  surface: "rounded-3xl",
  hero: "rounded-[2.25rem]",
  circle: "rounded-full",
} as const;

export const surface = {
  control:
    "bg-zinc-700/55 text-zinc-100 placeholder:text-zinc-400 hover:bg-zinc-700/75",
  controlError:
    "bg-red-500/15 text-red-200 placeholder:text-red-300/60 hover:bg-red-500/20",
  passive: "bg-zinc-800/55 text-zinc-100",
  raised:
    "bg-zinc-800/92 text-zinc-100 shadow-2xl shadow-black/30 backdrop-blur-xl",
  tooltip:
    "bg-zinc-700/90 text-zinc-100 shadow-lg shadow-black/25 backdrop-blur-lg",
} as const;

export const toneTextMap: Record<Variant, string> = {
  primary: "text-blue-300",
  secondary: "text-zinc-200",
  danger: "text-red-300",
  warning: "text-amber-200",
  success: "text-emerald-300",
};

export const toneSurfaceMap: Record<Variant, string> = {
  primary: "bg-blue-400/20",
  secondary: "bg-zinc-500/20",
  danger: "bg-red-400/20",
  warning: "bg-amber-400/20",
  success: "bg-emerald-400/20",
};

export const toneHoverMap: Record<Variant, string> = {
  primary: "hover:bg-blue-400/30",
  secondary: "hover:bg-zinc-500/30",
  danger: "hover:bg-red-400/30",
  warning: "hover:bg-amber-400/30",
  success: "hover:bg-emerald-400/30",
};

export const toneActiveMap: Record<Variant, string> = {
  primary: "active:bg-blue-400/40",
  secondary: "active:bg-zinc-500/40",
  danger: "active:bg-red-400/40",
  warning: "active:bg-amber-400/40",
  success: "active:bg-emerald-400/40",
};

export const toneStrongMap: Record<Variant, string> = {
  primary: "bg-blue-500 text-blue-50",
  secondary: "bg-zinc-600 text-zinc-50",
  danger: "bg-red-500 text-red-50",
  warning: "bg-amber-400 text-amber-950",
  success: "bg-emerald-500 text-emerald-950",
};

export const toneSoftMap: Record<Variant, string> = {
  primary: "bg-blue-400/14 text-blue-200",
  secondary: "bg-zinc-500/14 text-zinc-200",
  danger: "bg-red-400/14 text-red-200",
  warning: "bg-amber-400/14 text-amber-200",
  success: "bg-emerald-400/14 text-emerald-200",
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
