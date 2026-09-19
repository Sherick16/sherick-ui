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

/** A control answers a press immediately and settles on its release.
 *
 *  The recipe owns the *amplitude* of that answer as well as its timing, because how far a
 *  press travels is the system's physical character rather than a component's anatomy: a
 *  control whose outline is what the user sees compresses 4%, which is about two pixels at the
 *  size of the ink it moves. A control whose visible ink is far smaller than the target it is
 *  aimed at takes `motionInkPress` on that ink instead, so the target itself never moves. The
 *  interpolation and the compression are neutralised together under reduced motion. */
export const motionTactile =
  "transition-[background-color,color,box-shadow,transform,opacity] duration-release ease-release active:duration-press active:ease-press active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100";

/** The spatial half of a compact press, applied to the *mark* rather than to the control.
 *
 *  A control whose visible ink is much smaller than the target it is aimed at — a dialog's close
 *  control, a stepper, a search field's submit — is a large target around a small glyph, and only
 *  the glyph is visible at rest. Compressing the whole control would shrink the ground the pointer
 *  is already on (a 44px target becomes 38.7px while held, which is exactly where a near-edge
 *  release lands), so the mark takes the twelve percent and the target keeps its geometry. The
 *  target still owns the focus ring and the state layer, and still carries the tone and depth
 *  response, so the boundary a press happens inside never moves. */
export const motionInkPress =
  "transition-transform duration-release ease-release group-active:duration-press group-active:ease-press group-active:scale-[0.88] motion-reduce:transition-none motion-reduce:group-active:scale-100";

/* Motion is not owned here — but the recipes above are the whole vocabulary: every press, arrival,
   travel, presence and activity in the library is one of these names plus its owner's own target
   geometry. */

/* A field that opens a list — a `Select`'s trigger, an editable `Combobox`'s field — takes
   `motionTactile` as a whole, which is what makes the two forms of the same control press
   identically. The *field* is the element that carries the compression in both: a press activates
   the whole chain, so a descendant being pressed is what makes the field itself match `:active`
   (and a select trigger's own active state is suppressed by the primitive, so its field's wrapper
   is the only element left to carry it). Typing, focus and hover never match it, so the field is
   perfectly still while it is used as a text field; a press that places a caret or drags across a
   word is the same press the field already answers, and distinguishing it would take pointer
   bookkeeping inside a component for a case that reads as one interaction either way. */

/** A meaningful subordinate part arrives. Spring is reserved for this intent: a mark is
 *  made by overshooting the position it lands in. It leaves without the overshoot, and
 *  reduced motion lands it in one step — which takes a *state-specific* override, because the
 *  starting state is a higher-specificity rule than a plain `transform: none` and would otherwise
 *  win under reduced motion while the transition was gone, turning a spring into an instant jump. */
export const motionArrive =
  "transition-[background-color,color,box-shadow,transform,opacity] duration-release ease-spring data-[starting-style]:scale-50 data-[ending-style]:scale-50 data-[ending-style]:opacity-0 data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit motion-reduce:transition-none motion-reduce:transform-none motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:scale-100";

/** A persistent affordance changes orientation in place: a disclosure chevron. It reaches
 *  its target orientation consistently and never overshoots. */
export const motionOrient =
  "transition-transform duration-release ease-release motion-reduce:transition-none";

/** A persistent object travels between stable destinations: a tab indicator, a switch
 *  thumb. The travel itself is the event, so it takes the glide curve rather than the
 *  arrival curve, and it never overshoots: a destination that is passed and come back
 *  from reads as a defect. Position, size and the tone the object picks up on the way
 *  settle together, and an interrupted move retargets from wherever it currently is
 *  because it is a transition and not a keyframe. */
export const motionRelocate =
  "transition-[left,inset-inline-start,top,width,height,transform,background-color,color,box-shadow,opacity] duration-release ease-glide motion-reduce:transition-none";

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
  /* The logical sides resolve against the writing direction: `inline-start` puts the popup at the
     anchor's inline-start edge, which is its physical *left* on a left-to-right page and its
     physical *right* on a right-to-left one, so the four pixels that travel toward the anchor
     change sign with the page while the physical sides above never do. The direction is read from
     the `dir` attribute — the attribute that lays the page out, and the only one a portaled
     surface can see. The primitive resolves the side from the direction *it* is told about
     (`DirectionProvider`), so a consumer whose page is right-to-left declares that direction to
     both, exactly as the workbench's RTL specimens do. */
  "data-[side=inline-start]:[--sui-overlay-from-shift-y:0px] data-[side=inline-start]:[--sui-overlay-from-shift-x:4px]",
  "[[dir=rtl]_&]:data-[side=inline-start]:[--sui-overlay-from-shift-x:-4px]",
  "data-[side=inline-end]:[--sui-overlay-from-shift-y:0px] data-[side=inline-end]:[--sui-overlay-from-shift-x:-4px]",
  "[[dir=rtl]_&]:data-[side=inline-end]:[--sui-overlay-from-shift-x:4px]",
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
  "data-[starting-style]:[transform:translate(0,12px)scale(0.96)]",
  "data-[ending-style]:opacity-0",
  "data-[ending-style]:[transform:translate(0,12px)scale(0.96)]",
  "motion-reduce:data-[starting-style]:transform-none",
  "motion-reduce:data-[ending-style]:transform-none",
].join(" ");

/** An anchored surface: `Select`, `Combobox`, `Menu` and `Popover`. It grows out of the edge
 *  it is attached to, enters on the overlay timing, and leaves on the shorter exit.
 *
 *  The grow is the motion's signature and the four pixels of travel only support it, so the
 *  entrance takes the glide curve rather than the arrival curve. With a front-loaded curve the
 *  opacity and the scale both jump in the first frames, which means the surface is already half
 *  grown by the time it is visible at all — a pop, not a grow. The glide curve spends its whole
 *  duration visible, so the eye actually sees the surface open out of its anchor. */
export const motionPresenceAnchored = [
  "transition-[opacity,transform] duration-overlay ease-glide",
  "data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit",
  "motion-reduce:transition-[opacity]",
  "[--sui-overlay-from-scale:0.94]",
  anchoredGeometry,
  anchoredFrom,
].join(" ");

/** A tooltip: the same side-aware model and the same grow as an anchored popup, deliberately
 *  lighter — it settles on the local timing rather than the overlay timing, and it never
 *  bounces. */
export const motionPresenceTooltip = [
  "transition-[opacity,transform] duration-release ease-glide",
  "data-[ending-style]:duration-overlay-exit data-[ending-style]:ease-exit",
  "motion-reduce:transition-[opacity]",
  "[--sui-overlay-from-scale:0.94]",
  anchoredGeometry,
  anchoredFrom,
].join(" ");

/** A modal surface: anchored to the viewport rather than to a trigger, so it has no side
 *  to grow from. A large surface never bounces; it fades, rises a little and settles, and its
 *  scale stays restrained because a plane this big grows visibly even from a few percent. */
export const motionPresenceModal = [
  "transition-[opacity,transform] duration-overlay ease-glide",
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

/** The indeterminate half of a progress bar. A task with no known value cannot report a
 *  position, so it reports *work* instead: the fill sweeps across its own track on the one loop
 *  that is paced, because a loop that reports rather than answers cannot arrive. The keyframe
 *  travels a logical edge, so a right-to-left page sweeps the other way without a second recipe.
 *  Under reduced motion the loop stops and the fill rests where it starts: a static status
 *  glyph, exactly as the spin and the pulse rest. */
export const motionActivityIndeterminate =
  "animate-sherick-indeterminate motion-reduce:animate-none";

/** The state layer is a composited overlay, so its own opacity is the only thing that
 *  moves. Shared here because four interaction states across the library ride it. */
export const motionStateLayer =
  "before:transition-opacity before:duration-release before:ease-release active:before:duration-press active:before:ease-press group-active:before:duration-press group-active:before:ease-press motion-reduce:before:transition-none";

/* `disclose` is intentionally semantic-only for now. Its implementation lands with the first
   Accordion/Collapsible primitive, when the actual Base lifecycle and geometry are known. */
