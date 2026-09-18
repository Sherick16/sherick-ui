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

   Every recipe here owns the transition property, the duration, the curve and the
   `prefers-reduced-motion` behavior for one physical event. The durations and curves
   themselves are the authored tokens in `src/styles/tokens.ts`; nothing in this file
   writes a literal duration or an animation keyframe beyond the two activity loops.

   `docs/DESIGN_LANGUAGE.md` owns the semantics. Target geometry, material, tone and
   elevation remain component/anatomy concerns: a component says where something ends
   up, and this module says how it gets there. */

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

/** Non-spatial feedback: hover, focus, field tone, a highlighted row, a filled surface.
 *  It never translates, scales or resizes; reduced motion simply drops the interpolation
 *  and the state still arrives. */
export const motionFeedback =
  "transition-[background-color,color,box-shadow,opacity] duration-press ease-press motion-reduce:transition-none";

/** A control answers a press immediately and settles on its release, compressing and
 *  returning as the component's own state geometry asks it to. Reduced motion removes
 *  the interpolation; `state.*` owns what the target geometry is, so the spatial part of
 *  a press is neutralised there rather than by a blanket `transform: none` that would
 *  also erase positioning transforms a part legitimately carries. */
export const motionTactile =
  "transition-[background-color,color,box-shadow,transform,opacity] duration-release ease-release active:duration-press active:ease-press motion-reduce:transition-none";

/** A meaningful subordinate part arrives. Spring is reserved for this intent: a mark is
 *  made by overshooting the position it lands in. It leaves without the overshoot, and
 *  reduced motion lands it in one step. */
export const motionArrive =
  "transition-[background-color,color,box-shadow,transform,opacity] duration-release ease-spring data-[starting-style]:scale-50 data-[ending-style]:scale-50 data-[ending-style]:opacity-0 data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit motion-reduce:transition-none motion-reduce:transform-none";

/** A persistent affordance changes orientation in place: a disclosure chevron. It reaches
 *  its target orientation consistently and never overshoots. */
export const motionOrient =
  "transition-transform duration-release ease-release motion-reduce:transition-none";

/** A persistent object travels between stable destinations: a tab indicator, a switch
 *  thumb. Position, size and the tone it picks up on the way settle together, and an
 *  interrupted move retargets from wherever it currently is because it is a transition
 *  and not a keyframe. */
export const motionRelocate =
  "transition-[left,inset-inline-start,top,width,height,transform,background-color,color,box-shadow,opacity] duration-release ease-release motion-reduce:transition-none";

/** Direct manipulation: the pointer owns the geometry, so a positional transition would be
 *  lag. While the primitive reports a drag, position and size are removed from the
 *  transition list and only tone and engagement geometry remain; a keyboard or programmatic
 *  step still settles. Reduced motion never changes direct manipulation. */
export const motionDirect =
  "transition-[inset-inline-start,width,height,background-color,color,box-shadow,transform,opacity] duration-release ease-release active:duration-press active:ease-press data-[dragging]:transition-[background-color,color,box-shadow,transform,opacity] motion-reduce:transition-none motion-reduce:transform-none";

/* Presence is split by role: an anchored popup, a tooltip, a modal surface and the plane
   behind it. All four describe the same three states — settled, `data-starting-style` and
   `data-ending-style` — and let the primitive decide when the node mounts and unmounts.
   None of them writes an animation keyframe or a timer, so a rapid open → close → open
   retargets from the current painted value instead of restarting.

   The anchored roles read their entrance direction from the resolved side. Base publishes
   the side on the popup after collision handling and the origin as `--transform-origin`, so
   a surface below its trigger rises into place, one above it settles down into it, and one
   flipped by a collision animates the way it is actually placed. */

const anchoredGeometry = [
  "[transform-origin:var(--transform-origin)]",
  "[--sui-overlay-from-shift-y:-4px]",
  "data-[side=top]:[--sui-overlay-from-shift-y:4px]",
  "data-[side=left]:[--sui-overlay-from-shift-y:0px] data-[side=left]:[--sui-overlay-from-shift-x:4px]",
  "data-[side=right]:[--sui-overlay-from-shift-y:0px] data-[side=right]:[--sui-overlay-from-shift-x:-4px]",
  "data-[side=inline-start]:[--sui-overlay-from-shift-y:0px] data-[side=inline-start]:[--sui-overlay-from-shift-x:4px]",
  "data-[side=inline-end]:[--sui-overlay-from-shift-y:0px] data-[side=inline-end]:[--sui-overlay-from-shift-x:-4px]",
].join(" ");

/* Both ends of a presence animation start from the same state, and reduced motion drops the
   spatial half of it: presence still reads as arriving, but only through opacity. The
   transform is a literal class rather than an interpolated one, because the stylesheet
   compiler reads class names as text: a name that only exists once a template is evaluated
   compiles to no rule at all. */
const anchoredFrom = [
  "data-[starting-style]:opacity-0",
  "data-[starting-style]:[transform:translate(var(--sui-overlay-from-shift-x,0px),var(--sui-overlay-from-shift-y,0px))scale(var(--sui-overlay-from-scale,1))]",
  "data-[ending-style]:opacity-0",
  "data-[ending-style]:[transform:translate(var(--sui-overlay-from-shift-x,0px),var(--sui-overlay-from-shift-y,0px))scale(var(--sui-overlay-from-scale,1))]",
  "motion-reduce:data-[starting-style]:transform-none",
  "motion-reduce:data-[ending-style]:transform-none",
].join(" ");

const modalFrom = [
  "data-[starting-style]:opacity-0",
  "data-[starting-style]:[transform:translate(0,8px)scale(0.985)]",
  "data-[ending-style]:opacity-0",
  "data-[ending-style]:[transform:translate(0,8px)scale(0.985)]",
  "motion-reduce:data-[starting-style]:transform-none",
  "motion-reduce:data-[ending-style]:transform-none",
].join(" ");

/** An anchored surface: `Select`, `Combobox`, `Menu` and `Popover`. It grows out of the edge
 *  it is attached to, enters on the overlay timing, and leaves on the shorter exit. */
export const motionPresenceAnchored = [
  "transition-[opacity,transform] duration-overlay ease-release",
  "data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit",
  "motion-reduce:transition-[opacity]",
  "[--sui-overlay-from-scale:0.985]",
  anchoredGeometry,
  anchoredFrom,
].join(" ");

/** A tooltip: the same side-aware model as an anchored popup, deliberately lighter. It
 *  settles on the local timing rather than the overlay timing and never bounces. */
export const motionPresenceTooltip = [
  "transition-[opacity,transform] duration-release ease-release",
  "data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit",
  "motion-reduce:transition-[opacity]",
  "[--sui-overlay-from-scale:0.985]",
  anchoredGeometry,
  anchoredFrom,
].join(" ");

/** A modal surface: anchored to the viewport rather than to a trigger, so it has no side
 *  to grow from. A large surface never bounces; it fades, rises a little and settles. */
export const motionPresenceModal = [
  "transition-[opacity,transform] duration-overlay ease-release",
  "data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit",
  "motion-reduce:transition-[opacity]",
  modalFrom,
].join(" ");

/** The plane behind a surface that owns the viewport. Opacity only: a blur or a filter is
 *  never animated, so the plane can never animate the page behind it. */
export const motionPresenceScrim =
  "transition-opacity duration-overlay ease-release data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit";

/** Continuous activity is a distinct intent, not an exception to interaction motion: it
 *  reports work rather than answering an event, and it has no entrance of its own. */
export const motionActivitySpin = "animate-spin motion-reduce:animate-none";
export const motionActivityPulse = "animate-pulse motion-reduce:animate-none";

/** The state layer is a composited overlay, so its own opacity is the only thing that
 *  moves. Shared here because four interaction states across the library ride it. */
export const motionStateLayer =
  "before:transition-opacity before:duration-release before:ease-release active:before:duration-press active:before:ease-press group-active:before:duration-press group-active:before:ease-press motion-reduce:before:transition-none";

/* `disclose` is intentionally semantic-only for now. Its implementation lands with the first
   Accordion/Collapsible primitive, when the actual Base lifecycle and geometry are known. */
