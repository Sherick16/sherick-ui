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

/* State layers.
   Replacing `background-color` on hover erases whatever fill a control owns: an opaque
   fill collapses to a bare tint and a tinted fill loses most of its step. This overlay
   instead composites over the fill, tinted with `currentColor` — the container's own
   on-color, which is also the color furthest from that fill, and the same color as the
   label, so the glyphs themselves are unaffected. Opacity carries the state, so it fades
   on the shared motion curve instead of snapping. */
const stateLayerBase =
  "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:opacity-0 before:transition-opacity before:duration-200 before:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:before:transition-none";

export const stateLayer = {
  /* Tinted containers: the fill is nearly page color already, so the container's own
     on-color (`current`) carries the state at a light step. */
  tonal: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current hover:before:opacity-[0.1] active:before:opacity-[0.16]`,
  /* Opaque fills: `current` is the fill's own on-color — the color furthest from it in
     either theme — so one step reads on a saturated blue and a neutral gray alike. */
  filled: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current hover:before:opacity-[0.18] active:before:opacity-[0.26]`,
  /* Switch track: same layer, but hover arrives from the wrapping button. */
  switchTrack: `${stateLayerBase} before:rounded-[inherit] before:bg-current group-hover:before:opacity-[0.18] group-active:before:opacity-[0.26]`,
} as const;

export const shape = {
  pill: "rounded-full",
  control: "rounded-[1.25rem]",
  surface: "rounded-[1.75rem]",
  hero: "rounded-[2.25rem]",
  circle: "rounded-full",
} as const;

/* Elevation steps, expressed once so no component hand-writes a shadow. Two families:
   the surface ladder below, and the tactile control pair used by matte interactive
   controls. Only these values may appear anywhere in the library:
   - grounded: matte, no shadow — separation comes from surface color alone.
   - raised: tonal controls and lifted surfaces, on a soft contact-shadow step.
   - floating: liquid-glass overlays that sit above the application.
   - control: matte interactive controls, a hair above their own track at rest.
   - pressed: the same controls pressed or selected, recessed into that track. Applied
     through the state that fits each control — `active:` for buttons, the selected
     condition for segmented controls — so the variant class is written at the call site. */
export const elevation = {
  grounded: "shadow-sherick-grounded",
  raised: "shadow-sherick-raised",
  floating: "shadow-sherick-floating",
  control: "shadow-sherick-control",
  pressed: "shadow-sherick-pressed",
} as const;

/* Surface depth roles. Depth comes from the elevation steps and nothing else: the
   palette, shape and blur of a role do not change as it steps up the ladder. */
export const surface = {
  control:
    "bg-sherick-surface-high/[0.66] text-sherick-ink placeholder:text-sherick-ink-muted hover:bg-sherick-surface-high/[0.82] focus:bg-sherick-surface-high/[0.9] focus:shadow-sherick-focus",
  controlError:
    "bg-sherick-danger/[0.075] text-sherick-ink placeholder:text-sherick-danger/[0.72] hover:bg-sherick-danger/[0.10] focus:bg-sherick-danger/[0.13]",
  grounded: "bg-sherick-surface/[0.78] text-sherick-ink",
  groundedHigh: "bg-sherick-surface-high/[0.72] text-sherick-ink",
  raised: `bg-sherick-surface-float/[0.82] text-sherick-ink ${elevation.raised}`,
  acrylic: `bg-sherick-surface-float/[0.60] bg-sherick-glass text-sherick-ink ${elevation.floating} backdrop-blur-[var(--sui-glass-blur,32px)] backdrop-saturate-[var(--sui-glass-saturation,1.45)] backdrop-brightness-[var(--sui-glass-brightness,1.04)]`,
  acrylicDense: `bg-sherick-surface-float/[0.72] bg-sherick-glass-dense text-sherick-ink ${elevation.floating} backdrop-blur-[var(--sui-glass-dense-blur,26px)] backdrop-saturate-[var(--sui-glass-dense-saturation,1.38)] backdrop-brightness-[var(--sui-glass-dense-brightness,1.035)]`,
  modal: `bg-sherick-surface-float/[0.68] bg-sherick-glass text-sherick-ink ${elevation.floating} backdrop-blur-[var(--sui-glass-blur,32px)] backdrop-saturate-[var(--sui-glass-saturation,1.45)] backdrop-brightness-[var(--sui-glass-brightness,1.04)]`,
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
