/* Sherick UI motion grammar
   =========================
   Components describe what changes; this module exclusively describes how change moves.

   The canonical intents are:
   - feedback: non-spatial state response;
   - tactile: temporary physical response to activation;
   - arrive: a meaningful subordinate part appears or leaves;
   - orient: a persistent part changes orientation in place;
   - relocate: a persistent part moves or resizes between stable states;
   - direct: geometry continuously follows the user;
   - disclose: in-flow content expands/collapses (reserved until the first disclosure primitive);
   - presence: an independent surface enters/leaves;
   - activity: continuous motion that communicates ongoing work.

   `docs/DESIGN_LANGUAGE.md` owns the semantics. Keep this file temporal: target geometry,
   material, tone and elevation remain component/anatomy concerns. */

export type MotionIntent =
  | "feedback"
  | "tactile"
  | "arrive"
  | "orient"
  | "relocate"
  | "direct"
  | "disclose"
  | "presence"
  | "activity";

/* This foundation intentionally reuses the currently generated utility vocabulary so landing the
   architecture does not silently restyle existing components or force a baseline regeneration.
   The semantic leaf exports are the new API; migration PRs may refine their implementation while
   preserving the intent contract. Components never choose the timing/easing tokens directly. */

/** Non-spatial feedback: hover, focus, field tone and row highlight. */
export const motionFeedback =
  "transition-[background-color,color,box-shadow,opacity] duration-press ease-press motion-reduce:transition-none";

/** A control physically answers press immediately and settles on release. */
export const motionTactile =
  "transition-[background-color,color,box-shadow,transform,opacity,width,height] duration-release ease-release active:duration-press active:ease-press motion-reduce:transition-none motion-reduce:transform-none";

/** A meaningful subordinate part arrives. Spring is reserved for this intent. */
export const motionArrive =
  "transition-[background-color,color,box-shadow,transform,opacity] duration-release ease-spring active:duration-press active:ease-press group-active:duration-press group-active:ease-press motion-reduce:transition-none motion-reduce:transform-none";

/** A persistent disclosure affordance changes orientation without changing identity. */
export const motionOrient = motionTactile;

/** A persistent indicator moves/resizes between stable destinations, with no overshoot. */
export const motionRelocate = motionTactile;

/** Direct manipulation: settle when stepped, never interpolate pointer-driven position. */
export const motionDirect =
  "transition-[inset-inline-start,width,height,background-color,color,box-shadow,transform,opacity] duration-release ease-release active:duration-press active:ease-press data-[dragging]:transition-[background-color,color,box-shadow,transform,opacity] motion-reduce:transition-none motion-reduce:transform-none";

/* Presence is split by role even while the migration still shares the legacy keyframes. This
   prevents new components from choosing a generic "overlay" motion and gives each role an
   independent seam for the Base lifecycle / side-aware presence migration. */
export const motionPresenceAnchoredEnter = "animate-sherick-overlay-in motion-reduce:animate-none";
export const motionPresenceAnchoredExit = "animate-sherick-overlay-out motion-reduce:animate-none";
export const motionPresenceTooltipEnter = "animate-sherick-overlay-in motion-reduce:animate-none";
export const motionPresenceTooltipExit = "animate-sherick-overlay-out motion-reduce:animate-none";
export const motionPresenceModalEnter = "animate-sherick-overlay-in motion-reduce:animate-none";
export const motionPresenceModalExit = "animate-sherick-overlay-out motion-reduce:animate-none";
export const motionPresenceScrimEnter = "animate-sherick-scrim-in motion-reduce:animate-none";
export const motionPresenceScrimExit = "animate-sherick-scrim-out motion-reduce:animate-none";

/** Continuous activity is a distinct intent, not an exception to interaction motion. */
export const motionActivitySpin = "animate-spin motion-reduce:animate-none";
export const motionActivityPulse = "animate-pulse motion-reduce:animate-none";

/* Temporal helpers that shared non-temporal state recipes move onto during migration. */
export const motionStateLayer =
  "before:transition-opacity before:duration-release before:ease-release active:before:duration-press active:before:ease-press motion-reduce:before:transition-none";

export const motionSteppedValuePress =
  "group-has-[button:active]:duration-press group-has-[button:active]:ease-press";

/* Temporary bridge shape for the current components. New components must not use it. Once every
   existing component imports a semantic leaf recipe directly, this object and ui.common's legacy
   motion owner are deleted. */
export const legacyMotion = {
  press: motionFeedback,
  release: motionTactile,
  travel: motionDirect,
  spring: motionArrive,
  overlayIn: motionPresenceAnchoredEnter,
  overlayOut: motionPresenceAnchoredExit,
  scrimIn: motionPresenceScrimEnter,
  scrimOut: motionPresenceScrimExit,
} as const;

/* `disclose` is intentionally semantic-only for now. Its implementation lands with the first
   Accordion/Collapsible primitive, when the actual Base lifecycle and geometry are known. */
