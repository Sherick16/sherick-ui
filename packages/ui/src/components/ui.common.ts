import { cx } from "@/libs/utils";
import type { Variant } from "./ui.types";
import { motionDisclose, motionFeedback, motionRim, motionRowLayer, motionStateLayer } from "./ui.motion";

/* Sherick UI design primitives
   ==========================================================================
   One module owns every visual rule in the library. A component composes these
   primitives; it does not write a color, shadow, radius, duration or hairline of
   its own. The system has these parts:

     material   what a surface is made of          (canvas, matte, control, acrylic)
     elevation  how far it sits off the page       (flat, raised, floating, control, recessed)
     shape      its corner role                    (control, prominent, surface, expressive, pill, circle)
     edge       the hairline between stacked parts (row, header, rule)
     state      how it responds                    (rest, hover, pressed, selected, disabled, focus)
     stateLayer the composited hover/press overlay (quiet, tonal, filled, track, activeRow)
     disclosure one expandable region and its row (trigger, panel)
     tone       its color role                     (text, soft, tonal, selected, strong)
     text       the readable emphasis ladder       (high, medium)
     density    how tightly it is packed           (compact, normal, prominent, target)
     overlay    floating shells                    (menu, tooltip, popup, toast, sheet, dialog)
    focusRing  the one focus language             (focusRing, focusRingInset, focusRingHeld, focusRingWithin, groupFocusRing)

   Temporal behavior is deliberately not here: `ui.motion.ts` owns every transition,
   duration, curve and reduced-motion rule, and a recipe below names one of its recipes
   rather than writing a timing of its own.

   The canonical statement of these rules — and of what is deliberately left to a
   component's own anatomy, such as layout, spacing, padding, intrinsic size,
   responsive arrangement and content typography — is `docs/DESIGN_LANGUAGE.md`.
   Extend that document and this module together; never implement a visual rule in
   a component.

   material, elevation and edge are orthogonal, and that is the point:
   a material is a fill, an elevation is a distance, and an edge is a structural
   line. A component adds elevation only where its anatomy is genuinely lifted,
   and a hairline only where two parts actually meet. Nothing is baked in.

   The physical language, in order:
     flat matte by default
       -> tactile depth on manipulated controls
       -> recessed depth for tracks, grooves and wells, and for a raised control
          while it is held
       -> acrylic only for surfaces that genuinely float above the page

   Elevation composites from the light values in `theme.css` (light above the
   surface plane). The structural edge tone is its own token, and the acrylic
   recipes are tokenized separately and calibrated per theme, but both follow the
   same model: light above, shade below. So a highlight, a shadow, a floating
   sheet's gradient and a pressed inset stay physically related without sharing
   one set of numbers. */

/* Focus visibility — one language for every interactive element.
   `focusRing` draws the ring outside the shape, for a control that stands alone, and it follows
   **visible** focus: a button does not announce itself when a pointer presses it.
   `focusRingInset` draws it inside, for a control nested within another surface
   where an outer ring would collide with the parent's edge. Fields use the outer
   ring only: no inner rim is added, so focus reads as one ring, never two.
   `focusRingHeld` and `focusRingWithin` are the same ring for a control that **holds a value**,
   where the platform moves focus somewhere a plain ring cannot follow: the first for a control
   that is itself focusable and hands focus to the surface it opens, the second for one whose
   focus lives in a borderless input inside it. `focusRingHeld` follows *any* focus, because a
   select has no focus left to follow once its list has taken it; `focusRingWithin` follows
   *visible* focus, so what a field does is what the platform does — a text field is
   `:focus-visible` whenever it is focused, a range input only for the keyboard — and a select
   trigger and an editable combobox field end up identical in every state: neither looks ringed at
   rest, both look ringed the moment either is used, and both lose it together. `groupFocusRing`
   draws it from the wrapping control instead of the track it contains. */
export const focusRing =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sherick-focus focus-visible:outline-offset-[3px]";

export const focusRingInset =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-focus";

/* A focus owner that also contains a subtree paints the inset ring on its direct row only. */
export const parentFocusRingInset =
  "[:focus-visible>&]:ring-2 [:focus-visible>&]:ring-inset [:focus-visible>&]:ring-sherick-focus";

/* The ring of a value control that is itself the focusable element: it wears it whenever it
   holds focus, however it was focused, and whenever the surface it opened is on screen. A select
   hands the DOM focus to its list while that list is open, so the ring follows the control's
   engagement rather than the focus — which is exactly what a native `select` shows, and the only
   focus indication the field has left once the list has taken over. */
export const focusRingHeld =
  "focus:outline-none focus:outline focus:outline-2 focus:outline-sherick-focus focus:outline-offset-[3px] data-[popup-open]:outline data-[popup-open]:outline-2 data-[popup-open]:outline-sherick-focus data-[popup-open]:outline-offset-[3px]";

/* The same ring for a value control whose focus lives in a borderless input inside it. It follows
   **visible** focus rather than any focus, which is what makes a field and a slider differ for
   the platform's reasons instead of by local say-so: a text field is `:focus-visible` whenever it
   is focused, so a combobox or search field wears the ring the moment it is used, while a range
   input is `:focus-visible` only for the keyboard, so a slider's handle saves its ring for the
   keyboard and lets its own engagement answer the pointer. */
export const focusRingWithin =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sherick-focus has-[:focus-visible]:outline-offset-[3px]";

/* A file drag marks the same target with the same outline as visible keyboard focus. */
export const focusRingDrag =
  "data-[dragging]:outline data-[dragging]:outline-2 data-[dragging]:outline-sherick-focus data-[dragging]:outline-offset-[3px]";

export const groupFocusRing =
  "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-sherick-focus group-focus-visible:outline-offset-[3px]";

/* Motion is not owned here. Every physical event — feedback, tactile, arrive, orient,
   relocate, direct, presence and activity — is a named recipe in `ui.motion.ts`, which
   owns the timing and the reduced-motion behavior for it. A recipe in this module
   interpolates one of those names; it never writes a duration, a curve, a transition or
   an animation of its own. */

/* Elevation — distance from the surface plane, and nothing else. Three depth roles
   exist, and the last two are a single tactile pair:
   - flat:     at rest on the page. Separation comes from tone alone.
   - raised:   a manipulated control, lifted a hair above its own track so it feels
               touchable; pressing it returns it to the track.
   - floating: a surface that genuinely sits above the application.
   - control:  the resting half of the tactile pair, for a part the user moves —
               a switch thumb, a selected segment or a held option/date selection.
   - recessed: the other half of that pair: a groove, a track or a well, which is
               recessed by definition, and a raised control while it is held, which
               lands at the same depth.
   A passive surface is flat unless its anatomy is sunk by design: a well, a groove and
   a code well are `recessed` while they sit there, and `flat` is the default for
   everything else passive. A flat control never gains depth by being pressed. */
export const elevation = {
  flat: "shadow-sherick-flat",
  raised: "shadow-sherick-raised",
  floating: "shadow-sherick-floating",
  control: "shadow-sherick-control",
  recessed: "shadow-sherick-recessed",
  /* One rung further down: the depth a small selection mark sinks to while it is held. A mark
     rests in the ordinary groove; this is its press, never its identity. See
     `selectable.markSurface`. */
  well: "shadow-sherick-well",
} as const;
/* An inset sheet's shaded upper wall, without a lower rim. Kept independent so
   unrelated components do not bundle this recipe. */
export const recessedTop = "shadow-sherick-recessed-top";

/* Shape — semantic corner roles, never an arbitrary radius. Softness grows with
   the size of the object and the emphasis it carries, and silhouette says what an object does:
   a **capsule acts** (buttons, chips, badges, toggles are `pill`) and a **rounded rectangle
   holds** (fields, alerts, tables, sheets). Container roles therefore stay clearly short of a
   capsule at their own height — `control` is a third of a 48px field — so a field never reads as
   an almost-button beside a real one. Nested roles stay concentric: an inner corner is the outer
   corner minus the inset between them (a 20px track around a 16px indicator at 4px, a 24px list
   sheet around 16px options at 8px).
   - control:     ordinary controls and dense data regions — fields, rows, options,
                  chips, tables.
   - mark:        a compact square selection mark — a 20px checkbox box. `control` is a role
                  for objects the size of a field; its radius exceeds the half-extent of a
                  20px square, so a mark needs a step of its own — a corner under a third of
                  its side, so the box stays a rounded square and never reads as a radio.
   - row:         a row at command density — a row in a list that is scanned rather than
                  read holds a corner proportional to its own height, because `control`
                  would reach a 36px row's half-extent and read as a capsule.
   - prominent:   prominent controls and compact floating surfaces.
   - surface:     large surfaces — cards, menus, panels.
   - sheet:       a surface attached to one edge of the viewport. Its exposed corners step
                  below `prominent` rather than above it, because a surface that meets an
                  edge is read as an extension of the page: a corner sized for a
                  free-floating object makes it read as an oversized floating card. It is a
                  role of its own rather than a smaller `prominent`, because `prominent`
                  also holds compact floating controls, and those must keep their softness.
   - expressive:  an expressive surface that owns the viewport — a dialog, tightened so it
                  reads as a focused surface rather than a pillowy one.
   - pill:        fully rounded controls whose width follows their content.
   - circle:      fully rounded square targets. */
export const shape = {
  control: "rounded-[1rem]",
  mark: "rounded-[0.375rem]",
  row: "rounded-[0.75rem]",
  prominent: "rounded-[1.25rem]",
  surface: "rounded-[1.5rem]",
  sheet: "rounded-[1rem]",
  expressive: "rounded-[1.75rem]",
  pill: "rounded-full",
  circle: "rounded-full",
} as const;

/* Structural edges — the hairline where two parts of one surface meet, and the
   only structural lines in the library. A matte control has no rim: a 1px inset
   ring that traces a filled object is still a drawn border, so filled controls
   are separated by tone, not by a line. Light does the rest: a raised control
   carries a lower shadow, and the elevation steps add the upper highlight.
   One tone serves every line, so table rows, dividers, the `Divider` component and
   code sections agree with each other. A Markdown blockquote is not one of these: it
   takes a primary accent, because a quote is content-level emphasis rather than a
   structural join between two parts.

   The three roles are a tone each, and two of them carry the direction the row draws. The tone
   is authored once and separately, because a `Divider` draws its own direction: a row's line and
   a standalone rule have to agree on the tone without sharing a border. */
export const edgeTone = {
  row: "border-sherick-edge/[0.06]",
  header: "border-sherick-edge/[0.10]",
  rule: "border-sherick-edge/[0.075]",
} as const;

/* Rim — the boundary of a *hollow* control: a text field, or an empty checkbox or radio. Nothing
   inside such a control says what it is — an empty field holds at most a placeholder, an empty mark
   holds nothing — and it still has to be identifiable at 3:1, which no neutral fill step and no
   depth the light model can draw achieves on its own. So a hollow control carries one rim in the
   `rim` tone, tuned to clear 3:1 on every surface by a small margin and no more, and that rim is
   the only border a control has. A filled control — a button, a chip, a selected mark — is identified by its fill and
   never carries one.
   The field rim is a real border: forced colors repaints a border in a system colour, where it
   would remove an inset shadow, and the scoped baseline sizes boxes by their border edge, so the
   rim never changes a field's footprint. Its states ride on the field ladder in `state.field`.
   A drop target's rim is dashed, and the dashes are a mask over an overlay rather than the native
   `dashed` style, whose dash length and corner joins the platform decides: the mask fixes the dash
   rhythm and follows the `control` corner exactly. The mask is authored in `tokens.ts`. */
const dashedRimMask =
  "after:[mask-image:var(--sui-rim-dashed)] after:[mask-size:100%_100%] after:[mask-repeat:no-repeat]";

export const rim = {
  field: "border-[1.5px] border-sherick-rim",
  fieldError: "border-[1.5px] border-sherick-danger",
  dashed: /* @__PURE__ */ cx(
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
    "after:bg-sherick-rim",
    dashedRimMask,
    motionRim
  ),
  /* The dashes step up under the pointer and take the primary tone while a file is held over them. */
  dashedHover: "hover:after:bg-sherick-ink-muted",
  dashedDragging: "data-[dragging]:after:bg-sherick-primary",
} as const;

export const edge = {
  /* Rows of a stacked list or table. */
  row: /* @__PURE__ */ cx("border-b", edgeTone.row, "last:border-b-0"),
  /* The heavier rule beneath a column header. */
  header: /* @__PURE__ */ cx("border-b", edgeTone.header),
  /* A section break inside one surface, or a standalone rule. Pair it with the
     directional border class at the call site (`border-t`, `border-l`). */
  rule: edgeTone.rule,
} as const;

const effectiveDisabled =
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45 disabled:cursor-not-allowed disabled:opacity-45";

/* Interaction states:
     rest       the material, at whatever elevation its anatomy calls for
     hover      one tonality step, never a change in depth or a new border
     pressed    a raised control returning to the recessed depth of its own track, plus
                a slight compression; a flat control stays flat and a floating one keeps
                its elevation
     selected   a held choice: selected tone plus control elevation on a segment,
                option/tree row or date surface; never on mere navigation highlight
     disabled   45% opacity, no pointer affordance, no interactive state at all
     focus      the shared outer focus ring, visible on keyboard focus */
export const state = {
  /* A raised matte control presses back into the track beneath it — the same physical
     depth a groove or a well sits at. How far the press itself travels is motion amplitude, and
     it belongs with the tactile intent in `ui.motion.ts`. */
  recess: "active:shadow-sherick-recessed",
  /* The disabled step for a control whose disabled state is a Sherick prop. */
  disabled: "cursor-not-allowed opacity-45",
  /* The same step, keyed on the primitive's own markers rather than on a Sherick prop: Base marks
     an effectively disabled control — including one disabled by the field around it — with
     `data-disabled`, and a part that disables itself at a bound carries `disabled` as well. */
  effectiveDisabled,
  /* A row whose control is disabled by any means — its own option, its group, or the field around
     it — dims from the control's own marker rather than from a Sherick prop. */
  disabledRow: "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-45",
  /* A control nested inside a disabled composite. The composite already applied the opacity step,
     and a second one would dim the field unevenly; this carries only the disabled cursor. */
  disabledDescendant: "cursor-not-allowed",
  /* A part dims independently at a bound, but never a second time inside a disabled field. */
  disabledPart: /* @__PURE__ */ cx(effectiveDisabled, "group-data-[disabled]/field:opacity-100"),
  /* A part the pointer is engaging — the handle of a value control. It sits matte and settled at
     rest and takes its accent, a little larger, while the pointer is on it. Drag covers the case
     where the pointer has been captured and left the control. */
  engaged:
    "group-[:not([data-disabled])]:hover:scale-110 group-[:not([data-disabled])]:hover:bg-sherick-primary-strong group-[:not([data-disabled])]:hover:text-sherick-on-primary data-[dragging]:scale-110 data-[dragging]:bg-sherick-primary-strong data-[dragging]:text-sherick-on-primary",
  /* A control with a hit area of its own. */
  enabled: "cursor-pointer",
  /* A text field: the normal text cursor, never a pointer. */
  text: "cursor-text",
  /* Quiet scan feedback for non-interactive data rows: tonality only. */
  rowHover: "hover:bg-sherick-ink/[0.05]",
  /* The matte field family — one tonality ladder, four triggers, no rims. A field
     steps its surface up once on hover and once more while it is engaged; a
     composite field focuses its outer surface while the input inside stays
     borderless; an expanded control holds the engaged step while its popup is
     open. Tonality carries the state, so no border appears and disappears. */
  /* A field is a well: its fill sits below the surface around it, and engaging it sinks it further
     while its rim steps up. An invalid field is the same well with a danger rim: the rim, the
     danger placeholder and the field's message carry the error, so the fill never trades its
     depth for a tinted wash. The error steps keep the well's depth ladder and leave the rim alone. */
  field: {
    hover: "hover:bg-sherick-canvas/[0.85] hover:border-sherick-ink-muted",
    focus: "focus:bg-sherick-canvas focus:border-sherick-ink-muted",
    /* A composite's engaged tone outranks hover, independent of variant emission order. */
    focusWithin: "[&&]:focus-within:bg-sherick-canvas [&&]:focus-within:border-sherick-ink-muted",
    engaged: "bg-sherick-canvas border-sherick-ink-muted",
    errorHover: "hover:bg-sherick-canvas/[0.85]",
    errorFocus: "focus:bg-sherick-canvas",
    errorEngaged: "bg-sherick-canvas",
    /* The error ladder again, keyed on Base UI's validity attribute for a part that learns its
       validity from the field it sits in. Two variants outrank the single-variant ladder above,
       so neither ladder has to be conditional. */
    invalid: "data-[invalid]:border-sherick-danger",
    invalidHover: "data-[invalid]:hover:border-sherick-danger",
    invalidEngaged: "data-[invalid]:border-sherick-danger",
    invalidFocusWithin: "[&&]:data-[invalid]:focus-within:border-sherick-danger",
  },

} as const;

/* State layers.
   A layer is `relative` itself, because its overlay is absolutely positioned inside the control.
   A component that positions the control — an absolutely placed close or submit control — writes
   that position *after* the layer in its class list: `tailwind-merge` keeps the last class in a
   conflicting group, so a position written before the layer is silently replaced by the layer's
   own.
   Replacing `background-color` on hover erases whatever fill a control owns: an
   opaque fill collapses to a bare tint and a tinted fill loses most of its step.
   This overlay instead composites over the fill, tinted with `currentColor` — the
   container's own on-color, which is also the color furthest from that fill, and
   the same color as the label, so the glyphs themselves are unaffected. Opacity
   carries the state, so it fades on the shared motion curve instead of snapping,
   and it takes the press timing while the control is held.
   One step per fill strength: a quiet surface tints lightly, an opaque accent fill
   takes the heaviest step.
   Both interactive steps are gated on the primitive's own disabled markers, so an effectively
   disabled control neither tints nor presses — whether it was disabled by a prop, by its group or
   by the field around it. `:disabled` alone cannot gate a press: a row in a collection is a
   `div`, so `:active` matches it while the pointer is down on it and the marker is the only gate
   there is. */
const stateLayerBase = /* @__PURE__ */ cx(
  "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:opacity-0",
  motionStateLayer
);

/* A part answers the pointer only while it is interactive. A native control carries `disabled`, and
   a collection primitive marks its rows with `data-disabled` instead. One rule covers both, in the
   same shape for hover and for press, and the group form is that rule for a part whose pointer
   arrives from the wrapping control.

   Each step is written out as a whole class name rather than assembled from a variant fragment and
   a suffix, because the stylesheet compiler reads class names as literal text: a name that only
   exists once the recipe is evaluated compiles to no rule at all, and the step silently disappears.
   Interpolating one of these consts is safe — the name is still written here in full. */
const hoverQuiet = "[&:not([data-disabled]):not(:disabled)]:hover:before:opacity-[0.05]";
const hoverTonal = "[&:not([data-disabled]):not(:disabled)]:hover:before:opacity-[0.09]";
const hoverFilled = "[&:not([data-disabled]):not(:disabled)]:hover:before:opacity-[0.18]";
const hoverTrack = "group-[:not([data-disabled]):not(:disabled)]:hover:before:opacity-[0.18]";
const pressQuiet = "[&:not([data-disabled]):not(:disabled)]:active:before:opacity-[0.09]";
const pressTonal = "[&:not([data-disabled]):not(:disabled)]:active:before:opacity-[0.15]";
/* A neutral fill's label is ink, so a 15% ink veil turns the whole control a flat grey while it is
   held — and the recess and the compression already say "pressed". The neutral press is lighter;
   coloured fills keep the stronger step their labels were measured through. */
const pressTonalNeutral = "[&:not([data-disabled]):not(:disabled)]:active:before:opacity-[0.12]";
const pressFilled = "[&:not([data-disabled]):not(:disabled)]:active:before:opacity-[0.26]";
const pressTrack = "group-[:not([data-disabled]):not(:disabled)]:active:before:opacity-[0.26]";
/* A selection mark answers hover with the light tonal step: it is a 20px glyph beside its own
   label, and the track's step would turn an empty well into a grey disc. Its press is depth, not
   a heavier veil — `selectable.markSurface` sinks the well — so the layer only holds its hover
   step while the pointer is down. A read-only mark accepts no change and advertises none.
   The pseudo-class sits *inside* the group selector: written after it, as `…]:hover:`, it would
   match the mark's own 20px box rather than the control and the row around it. */
const hoverMark =
  "group-[:not([data-disabled]):not([data-readonly]):not(:disabled):hover]:before:opacity-[0.09]";

/* A labelled control surface paints its state on a row that owns the pointer area while the
   actual disabled marker belongs to a descendant control. Gate the same quiet response on that
   descendant so a disabled or read-only choice does not advertise a press it cannot accept. */
export const stateLayerQuietComposite = /* @__PURE__ */ cx(
  "relative",
  stateLayerBase,
  "before:rounded-[inherit] before:bg-current",
  "[&:not([data-disabled]):not([data-readonly]):not(:disabled):not(:has([data-disabled])):not(:has([data-readonly]))]:hover:before:opacity-[0.05]",
  "[&:not([data-disabled]):not([data-readonly]):not(:disabled):not(:has([data-disabled])):not(:has([data-readonly]))]:active:before:opacity-[0.09]"
);

export const stateLayer = {
  /* Quiet surfaces — ghost controls, navigation rows, menu options. */
  quiet: /* @__PURE__ */ cx("relative", stateLayerBase, "before:rounded-[inherit] before:bg-current", hoverQuiet, pressQuiet),
  /* Tinted containers: the fill is nearly page color already, so the container's own
     on-color (`current`) carries the state at a light step. Shared by every matte
     control with a fill — tonal buttons, icon buttons, acrylic buttons. */
  tonal: /* @__PURE__ */ cx("relative", stateLayerBase, "before:rounded-[inherit] before:bg-current", hoverTonal, pressTonal),
  /* The same layer for a neutral (`secondary`) tonal fill, with the lighter press. */
  tonalNeutral: /* @__PURE__ */ cx("relative", stateLayerBase, "before:rounded-[inherit] before:bg-current", hoverTonal, pressTonalNeutral),
  /* Opaque fills: `current` is the fill's own on-color — the color furthest from it in
     either theme — so one step reads on a saturated blue and a neutral gray alike. */
  filled: /* @__PURE__ */ cx("relative", stateLayerBase, "before:rounded-[inherit] before:bg-current", hoverFilled, pressFilled),
  /* A switch track or a selection well: the same layer, but hover and press arrive from the
     wrapping control rather than from the surface itself. */
  track: /* @__PURE__ */ cx(stateLayerBase, "before:rounded-[inherit] before:bg-current", hoverTrack, pressTrack),
  /* A checkbox box or a radio socket: the hover arrives from the wrapping control, at the light
     tonal step, and the press is carried by the well's own depth rather than by this layer. */
  mark: /* @__PURE__ */ cx(stateLayerBase, "before:rounded-[inherit] before:bg-current", hoverMark),
  /* A row highlighted by keyboard or pointer navigation. Base UI collection primitives expose
     `data-highlighted`; this is the one canonical visual treatment for it, and it pairs with a
     row's own `quiet` layer — the row carries both, so a highlighted row and a hovered row are the
     same tone at the same strength. That strength is written twice because a class name has to be
     literal to be compiled; that the two rendered layers agree is asserted in the browser suite
     rather than left to these lines to stay in step.
     It is deliberately not gated on the disabled markers: a disabled command stays reachable by
     keyboard so it can be discovered and announced as unavailable, and a reader still has to see
     which row the navigation is on when it lands there. */
  activeRow: "data-[highlighted]:before:opacity-[0.05]",
} as const;

/* Hit area — the interactive region of a control whose visible mark is smaller than a comfortable
   target, drawn outside the layout box so a column, a row gap and the space beside a label are all
   measured from the control the user sees. The expansion is capped at the accessible target floor;
   CSS cannot see neighbouring geometry, so it keeps clearance only while surrounding rows are at
   least as tall as that floor — which this library's own `density.normal` rhythm is, and a 40px
   table row is not. */
export const hitArea =
  "relative after:pointer-events-auto after:absolute after:inset-[min(0px,calc((100%-2.75rem)/2))] after:content-['']";

/* Material — fill only. No material carries elevation or a rim: the same matte
   fill appears flat in a card, lifted on a button and recessed in a groove.
   - canvas:      the page itself.
   - matteQuiet:  the quietest matte step, for dense data regions and wells that
                  should sit back from the surface around them.
   - matte:       a matte surface that separates from the canvas by tone alone.
   - matteHigh:   the second matte step, for nesting inside another matte surface.
   - matteInset:  a passive sheet tucked under a stronger control; subdued without
                  blending into the canvas or needing a drawn rim.
   - control:     the fill every text control shares, plus its placeholder tone. It is a well:
                  the canvas tone, which sits below a card in both themes, so a field reads as
                  sunk into the surface rather than as a pad raised from it. Its rim, not its
                  fill, is what separates it (see `rim`).
   - handle:      the fill of a small part the user has to find — a value control's handle.
                  Surface steps sit within a few percent of their neighbours, so this role
                  takes the mid-emphasis tone, which inverts with the theme and separates in
                  both.
   - acrylic:     a translucent sheet lit from above, for surfaces that float above
                  the application. The gradient, fill, blur and saturation are part of
                  the material. A gradient arrives as a typed image arbitrary value
                  rather than through the colour scale, because `tailwind-merge`
                  collapses two background utilities into one and would silently drop
                  either the fill or the gradient. Each one is written out literally, so
                  the class scanner never meets a half-built name. The fill stays an
                  ordinary background colour, so a caller can retone a sheet without
                  touching its lighting. An anchored sheet carries most of its own tone,
                  because it has to stay legible over whatever it happens to sit on: a
                  saturated button behind a popup must not read as the popup's own
                  state. `acrylicDense` is the same sheet at higher opacity still, for
                  the smallest floating surfaces — a tooltip, a floating control.
   - acrylicHero: the large-overlay sheet, for a surface that owns the viewport. It is
                  markedly more opaque and calmer than the smaller sheets: it has to
                  read first as a physical surface and only secondarily as glass, so the
                  scrim behind it does the separating, the blur only defocuses, and the
                  gradient is a restrained top-to-bottom light rather than a frosted
                  haze. Its tone is a subtle step above the canvas in every theme —
                  in dark mode a small step above the canvas rather than a light grey
                  sheet — which is how it separates without leaning on its shadow, and
                  `--sui-overlay-fill` tunes how much of the sheet is its own tone rather
                  than the defocused page — a large overlay leans on that, not on blur. */
export const material = {
  canvas: "bg-sherick-canvas text-sherick-ink",
  matteQuiet: "bg-sherick-surface/[0.42] text-sherick-ink",
  matte: "bg-sherick-surface/[0.78] text-sherick-ink",
  matteHigh: "bg-sherick-surface-high/[0.72] text-sherick-ink",
  control: "bg-sherick-canvas/[0.7] text-sherick-ink placeholder:text-sherick-ink-muted",
  /* The invalid fill carries its placeholder at the *full* danger tone, not at a fraction of it. A
     placeholder is text, so it answers to the same 4.5:1 the copy beside it does, and a partial
     opacity of an accent is a different colour from the accent: the 72%-opacity placeholder
     measured 2.8–3.0:1 light and 3.4–3.9:1 dark on this fill, while the token it was mixed from
     measures 4.1–4.7:1 light and 5.2–6.2:1 dark on it. There is no dimmer step of a semantic tone
     that is still readable, and a normal field's placeholder is `ink-muted` at full strength
     already — so the error form is the same rule, in the tone the field is in. */
  controlError: "bg-sherick-canvas/[0.7] text-sherick-ink placeholder:text-sherick-danger",
  handle: "bg-sherick-ink-muted text-sherick-canvas",
  acrylic:
    "bg-sherick-surface-float/[var(--sui-glass-fill)] bg-[image:var(--sui-glass-gradient)] text-sherick-ink backdrop-blur-[var(--sui-glass-blur)] backdrop-saturate-[var(--sui-glass-saturation)] backdrop-brightness-[var(--sui-glass-brightness)]",
  acrylicDense:
    "bg-sherick-surface-float/[var(--sui-glass-dense-fill)] bg-[image:var(--sui-glass-gradient-dense)] text-sherick-ink backdrop-blur-[var(--sui-glass-dense-blur)] backdrop-saturate-[var(--sui-glass-dense-saturation)] backdrop-brightness-[var(--sui-glass-dense-brightness)]",
  acrylicHero:
    "bg-sherick-surface-overlay/[var(--sui-overlay-fill)] bg-[image:var(--sui-glass-hero-gradient)] text-sherick-ink backdrop-blur-[var(--sui-glass-hero-blur)] backdrop-saturate-[var(--sui-glass-hero-saturation)] backdrop-brightness-[var(--sui-glass-hero-brightness)]",
} as const;
/* Dark neutral behind native video, including poster loading and letterboxing. */
export const mediaCanvas = "bg-sherick-media";
/* A passive sheet tucked below a stronger control; independently tree-shakeable. */
export const matteInset = "bg-sherick-surface-high/[0.35] text-sherick-ink";

/* Type roles — the recurring kinds of text the library sets, each with one size, line height and,
   where the role owns it, one weight. A component still owns copy that only it renders; these are
   the roles that recur across families and have to agree wherever they appear:
   - control:    the type step of a control, owned through `density` below.
   - supporting: a field's description, hint and error, and the secondary line under a row's label.
   - caption:    compact labels — a badge, a tooltip, a group label, a calendar weekday.
   - title:      the heading of a compact surface — a popover, a toast, a command palette.
   - heading:    the title of a surface that owns the viewport — a dialog, an alert dialog, a drawer.
   - numeric:    figures that are compared down a column or updated in place.
   Every size lands on a whole-pixel line box, so stacked rows keep one rhythm. */
export const type = {
  control: {
    compact: "text-sm",
    normal: "text-[0.9375rem] leading-[1.375rem]",
    prominent: "text-lg",
  },
  supporting: "text-[0.8125rem] leading-5",
  caption: "text-xs leading-4",
  title: "text-[0.9375rem] leading-[1.375rem] font-semibold",
  heading: "text-xl leading-7 font-semibold tracking-[-0.02em]",
  numeric: "tabular-nums",
} as const;

/* Density — three control steps plus the accessible hit target.
   Density owns height and the type step, so controls of one density share a
   rhythm. A component's anatomy owns its padding: a button's inline padding is
   set by how it is gripped, a field's by how much text it holds, and neither is
   derived from the other. The default step is comfortable rather than dense: a
   48px control is Sherick's resting proportion, and `compact` is the step for
   dense product regions. Body copy, headings and labels are content, not
   controls, and take a type role above. */
export const density = {
  compact: /* @__PURE__ */ cx("min-h-10", type.control.compact),
  normal: /* @__PURE__ */ cx("min-h-12", type.control.normal),
  prominent: /* @__PURE__ */ cx("min-h-14", type.control.prominent),
  /* Minimum interactive target for an icon-only control that stands on its own. */
  target: "min-h-11 min-w-11",
  /* A control that is one part of a composite field — the trailing controls a Combobox owns. It
     keeps the floor's height, because it has to sit in the field's row, and takes only the width
     its glyph needs: the two of them are gripped as one cluster at the field's edge, and two full
     squares there read as two controls beside a field rather than as parts of it.
     The narrower step still clears the 24px pointer-target minimum WCAG AA asks for. It is below
     this system's own 44px floor on purpose: that floor belongs to a control that is the whole
     target of its own action, and this one is a part of a field the pointer is already in. */
  part: "min-h-11 min-w-9",
} as const;

/* Icon slot — the fixed box a leading or trailing mark occupies, sized by the type step it sits
   beside so the icon-to-label ratio is the same at every size: a 14px label takes a 16px mark, a
   15px label a 20px mark, an 18px label a 24px mark, and a 12px caption a 14px mark. The box, not
   the artwork's own whitespace, is what aligns with the label, and a spinner that replaces the icon
   lands in the same box. */
export const iconSlot = {
  caption: "inline-flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5",
  compact: "inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-4",
  normal: "inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5",
  prominent: "inline-flex size-6 shrink-0 items-center justify-center [&>svg]:size-6",
} as const;

/* Stacking level — where anything that floats sits relative to the application.

   One interaction level, deliberately. Base UI nests a popup's portal *inside* the portal of the surface it
   was opened from, and appends it last, so document order already says which floating surface is
   on top: the innermost — the one opened last — wins. A scale that ranked surfaces by kind would
   fight that, and it cannot be right: a popup opened from inside a dialog is the innermost
   surface there is, yet a ranking puts the dialog above it and the popup renders behind the modal
   that owns it. Sharing one level lets the nesting Base already built decide, at any depth.

   The level's job is to clear the application's own content, not to rank Sherick surfaces against
   each other. */
export const stacking = {
  float: "z-50",
  /* A persistent app notification portal predates the modal it reports on. */
  notification: "z-[60]",
} as const;

/* Floating overlay shells.
   Base UI owns popup presence, focus, dismissal, portals and anchored positioning.
   Sherick UI owns only the visual shell: material, elevation and shape. Where the entrance
   grows from and how it moves on the way are the presence recipes' in `ui.motion.ts`, so a
   surface's shell never depends on the primitive's open state. `scrim` is the plane
   *behind* a surface that owns the viewport, so it is a fill and a blur with no elevation
   or shape of its own. It is shared rather than written per component so a dialog and an
   alert dialog separate from the page identically. */
export const overlay = {
  /* The plane behind a surface that owns the viewport. */
  scrim: /* @__PURE__ */ cx("fixed inset-0", stacking.float, "bg-sherick-scrim/[0.38] backdrop-blur-[var(--sui-scrim-blur)]"),
  /* An anchored surface with room to breathe: a selection list (Select, Combobox) or
     structured content (Popover). It grows out of its trigger and carries the softer
     surface corner, because what it holds is read rather than scanned.
     When not to use it: a short list of commands wants `menu`, and a hint wants
     `tooltip`. */
  popup: /* @__PURE__ */ cx(shape.surface, material.acrylic, elevation.floating),
  /* A compact list of commands. The same sheet, the same presence and the same lighting as
     `popup`, tightened in shape so a handful of short actions reads as a list rather than a
     page: a command list should feel like one more control on the surface it came from.
     When not to use it: a list of options that are chosen rather than performed, or a
     surface holding structured content, wants `popup`. */
  menu: /* @__PURE__ */ cx(shape.control, material.acrylic, elevation.floating),
  /* A short hint is a compact sheet, not a capsule button. */
  tooltip: /* @__PURE__ */ cx(shape.row, material.acrylicDense, elevation.floating),
  /* A toast is a floating status surface that arrives on its own and leaves on its own. It
     holds a line or two of copy rather than being read as a page, so it takes the compact
     floating corner rather than the wide sheet a popup is.
     When not to use it: a hint attached to a control wants `tooltip`, and anything the user
     opened themselves wants `popup`. */
  toast: /* @__PURE__ */ cx(shape.prominent, material.acrylic, elevation.floating),
  /* A dialog rises further than a menu. It is anchored to the viewport rather than to a trigger,
     so it has no side to grow from and takes the modal presence instead of the anchored one.
     Its corner is the most generous in the library, because a surface that floats free of every
     edge has nothing to line up with. */
  dialog: /* @__PURE__ */ cx(shape.expressive, material.acrylicHero, elevation.floating),
  /* A sheet is the same viewport-owning surface as a dialog, attached to one edge of the
     viewport. Its exposed corners take `shape.sheet` — one step below a compact floating
     surface rather than above it — because a surface that meets an edge is read as an extension
     of the page, and its attached edge is squared by the component's own anatomy. Which corners
     those are is decided by the edge; the radius the other two keep is still `shape`'s.
     When not to use it: a surface with no edge to attach to wants `dialog`. */
  sheet: /* @__PURE__ */ cx(shape.sheet, material.acrylicHero, elevation.floating),
} as const;

/* Text hierarchy — two roles, because only two can carry readable text. High emphasis carries
   labels and values, medium emphasis carries supporting copy, descriptions and placeholders. Both
   clear 4.5:1 on every surface the library composites over, in both themes.
   
   There is deliberately no third text step. A third step would have to sit between `medium` and
   the dimmest tone a surface allows, and at these surfaces the value that clears 4.5:1 collapses
   into `ink-muted` — a step that measures the same as the one above it is not a hierarchy, it is a
   role pretending to be one. The dimmest tone is a *non-text* role instead (see `detail` below). */
export const text = {
  high: "text-sherick-ink",
  medium: "text-sherick-ink-muted",
} as const;

/* Detail — the non-text furniture tone: a gutter, a rail, a mark's frame, secondary graphical
   detail that carries meaning without being read. It answers to the 3:1 non-text requirement on
   every surface it is permitted on, and it is never a foreground for text: a hint, a placeholder,
   a line number or any other readable step uses `text.medium`. */
export const detail = {
  /** A mark's own frame, or a rail drawn as a line. */
  mark: "border-sherick-detail",
  /** The same tone as a block, for a gutter or a rail with thickness. */
  fill: "bg-sherick-detail",
} as const;

/* A list surface — the sheet a collection of rows sits in, and the two row densities it can
   hold. Select, Combobox and Menu all compose these, so an option and a command are the same
   object at two densities instead of three independent designs.

   The sheet never exceeds what the viewport leaves it, and scrolls inside itself rather than
   growing. Its width is the list's own decision: a control's list is never narrower than the
   control it came from and grows to fit its own content until the viewport clamp, and a command
   list only ever grows to its content. Unselected rows and commands stay flat; held options
   compose `tone.selected` with `elevation.control`. One row step of `stateLayer.quiet` plus
   `stateLayer.activeRow` carries both its hover and
   its keyboard highlight, so an option and a command are highlighted by the same tone at the
   same strength. Keyboard focus adds the shared inset ring independently of that highlight.
   Selection is a tint of the sheet through `tone.selected` and never the opaque
   accent, which belongs to the one primary action in the view rather than to a row that happens
   to be chosen.
   A row that cannot be used takes no hover and no press, and its tone step says so on its own —
   but it keeps the navigation highlight. A disabled option or command stays reachable by
   keyboard so it can be discovered and announced as unavailable, and a reader still has to see
   which row the navigation is on when it arrives there. Disabled means "cannot be chosen or
   performed", never "cannot be found". */
export const list = {
  sheet: "max-w-[var(--available-width)] max-h-[var(--available-height)] overflow-y-auto",
  /* A row in a selection list: one line, read one at a time and chosen.
     The row carries two separate things that both have to be visible. Its *navigation highlight*
     is the state layer — one tone shared with the pointer, because a row under the pointer and a
     row under the arrow keys are the same thing happening. Its *focus treatment* is the shared
     inset ring, and it is gated on `:focus-visible`, which is what separates the two cases: Base
     gives the active row real DOM focus, and the platform reports that focus as visible when the
     keyboard put it there and not when a pointer did. So a pointer that opens a list and moves
     over a row gets the highlight and no ring, a keyboard that opens one and steps down it gets
     both, a selected row keeps its selection tint under the ring, and a disabled-but-navigable
     row still shows where the navigation is while saying it cannot be used. The ring is inset
     because the row lives inside the sheet it belongs to, as a segment does in its track. */
  option: /* @__PURE__ */ cx(
    "flex w-full items-center justify-between gap-4 px-4 py-3 text-start outline-none",
    type.control.normal,
    shape.control,
    motionFeedback,
    focusRingInset,
    text.high,
    stateLayer.quiet,
    stateLayer.activeRow,
    motionRowLayer,
    state.effectiveDisabled
  ),
  /* The same object at the density a list of short actions wants, where the row is scanned
     rather than read and the list is a control rather than a page. `shape.row` keeps the
     command's corner proportional to its own height, so its highlight nests in the tighter
     sheet the menu is. */
  command: /* @__PURE__ */ cx(
    "flex w-full items-center gap-3 px-3 py-2 text-start outline-none",
    type.control.compact,
    shape.row,
    motionFeedback,
    focusRingInset,
    text.high,
    stateLayer.quiet,
    stateLayer.activeRow,
    motionRowLayer,
    state.effectiveDisabled
  ),
} as const;

/* A disclosure — one row that opens the region beneath it. An item in an `Accordion` and a
   standalone `Collapsible` are the same object: a stacked row, and the in-flow panel its
   primitive measures. They share this recipe so the two cannot drift into two designs, and the
   height itself is the primitive's — it arrives as `--sui-disclose-height`, which each
   component maps its own primitive's panel variable onto, because the measured geometry is
   anatomy and only the interpolation is temporal. */
export const disclosure = {
  /* The row: a full-width row in a stacked group, activated like a selectable row. Its own focus
     indicator is the shared inset ring, because an offset one drawn outside the row would land on
     the divider or the panel beside it rather than around the row it belongs to — which is the same
     reason a segment inside a track takes the inset form. The chevron the component puts in the
     row is the disclosure's own affordance and turns in place under `motionOrient`. */
  trigger: /* @__PURE__ */ cx(
    "group [overflow-wrap:anywhere]",
    list.option,
    state.enabled
  ),
  panel: /* @__PURE__ */ cx("h-[var(--sui-disclose-height)] overflow-hidden text-sm leading-7 [overflow-wrap:anywhere]", text.medium, motionDisclose),
} as const;

/* Tone hierarchy — the color roles a surface can take, in rising strength:
     text      foreground only, for quiet rows and links.
     soft      a de-emphasised tinted surface: alerts, badges, quiet cards.
     tonal     a matte control fill at rest: tonal buttons, icon buttons.
     selected  the fill a selected control holds: options, segments, calendar days, tree rows.
     strong    the opaque accent fill that marks priority.
   The semantic soft and selected steps are the role's own authored surfaces (`--sui-<role>-soft`,
   `--sui-<role>-selected`), not a fraction of its foreground: the foreground is tuned for text
   contrast, and a fraction of it is a greyed version of the hue. They are opaque, so one tone reads
   the same on the canvas, inside a card and on an acrylic sheet. The neutral soft step is a step
   *within* whatever holds it rather than the card fill itself, so a neutral badge or tag stays
   visible inside a card. */
export const tone = {
  text: {
    primary: "text-sherick-primary",
    secondary: "text-sherick-ink",
    danger: "text-sherick-danger",
    warning: "text-sherick-warning",
    success: "text-sherick-success",
  },
  soft: {
    primary: "bg-sherick-primary-soft text-sherick-primary",
    secondary: "bg-sherick-surface-high/[0.72] text-sherick-ink",
    danger: "bg-sherick-danger-soft text-sherick-danger",
    warning: "bg-sherick-warning-soft text-sherick-warning",
    success: "bg-sherick-success-soft text-sherick-success",
  },
  tonal: {
    primary: "bg-sherick-primary-soft",
    secondary: "bg-sherick-surface-high/[0.56]",
    danger: "bg-sherick-danger-soft",
    warning: "bg-sherick-warning-soft",
    success: "bg-sherick-success-soft",
  },
  selected: {
    primary: "bg-sherick-primary-selected text-sherick-ink",
    secondary: "bg-sherick-surface-high/[0.82] text-sherick-ink",
    danger: "bg-sherick-danger-selected text-sherick-ink",
    warning: "bg-sherick-warning-selected text-sherick-ink",
    success: "bg-sherick-success-selected text-sherick-ink",
  },
  strong: {
    primary: "bg-sherick-primary-strong text-sherick-on-primary",
    secondary: "bg-sherick-surface-high text-sherick-ink",
    danger: "bg-sherick-danger text-sherick-on-danger",
    warning: "bg-sherick-warning text-sherick-on-warning",
    success: "bg-sherick-success text-sherick-on-success",
  },
  /* The strong fills again, keyed on the primitive's own selection marker rather than on a
     Sherick prop. A control that holds its selection in the primitive — an uncontrolled
     `Switch` — has to take its fill from the same source of truth as a controlled one, and a
     keyed fill has to be written out literally to be compiled, so it is a role here rather
     than a conditional at the call site. */
  strongChecked: {
    primary: "group-data-[checked]:bg-sherick-primary-strong group-data-[checked]:text-sherick-on-primary",
    secondary: "group-data-[checked]:bg-sherick-surface-high group-data-[checked]:text-sherick-ink",
    danger: "group-data-[checked]:bg-sherick-danger group-data-[checked]:text-sherick-on-danger",
    warning: "group-data-[checked]:bg-sherick-warning group-data-[checked]:text-sherick-on-warning",
    success: "group-data-[checked]:bg-sherick-success group-data-[checked]:text-sherick-on-success",
  },
} satisfies Record<string, Record<Variant, string>>;

/* Current location — where the reader is, as opposed to a value they chose. A navigation row, the
   current page of a pagination and any other `aria-current` destination hold the role's soft
   container, full ink and a touch of weight, and stay flat: depth and the stronger selected step
   belong to held values (`tone.selected` with `elevation.control`). */
export const currentDestination = "bg-sherick-primary-soft text-sherick-ink font-medium";

/* Selectable surface — the recessed surface of a control that fills once it is selected: a
   switch track, a checkbox box, a radio circle, a slider groove. Selection is keyed on the
   primitive's own `data-checked` / `data-indeterminate`, so an uncontrolled control is styled
   from the same source of truth as a controlled one. A mixed box is selected but is not
   ticked, which is why the second attribute stands beside the first. */
/* A radio's opt-in full row follows the Base control it labels. `:has` keeps uncontrolled
   selection authoritative at the primitive rather than mirroring it in component state.
   Keep this independent so unrelated consumers of the mark recipes can tree-shake it. */
export const selectableRowSurface =
  "has-[[data-checked]]:bg-sherick-primary-selected has-[[data-checked]]:text-sherick-ink has-[[data-checked]]:shadow-sherick-control";

export const selectable = {
  surface: /* @__PURE__ */ cx("relative", elevation.recessed, motionFeedback),
  /* A selection mark — a checkbox box, a radio socket — rests in the same groove a Switch track
     does. While the wrapping control is held it sinks to the `well`: the floor darkens and the
     boundary stays exactly where it was, which is how a mark that must not move under the pointer
     answers a press. */
  markSurface: /* @__PURE__ */ cx(
    "relative",
    elevation.recessed,
    "group-[:not([data-disabled]):not([data-readonly]):not(:disabled):active]:shadow-sherick-well",
    motionFeedback
  ),
  /* The resting fill a *groove* holds — a segmented control's track, a tab list — and nothing more.
     A groove that holds labelled segments is identified by those segments, exactly as a tab list is
     identified by its labels, so it takes no boundary of its own. */
  rest: /* @__PURE__ */ cx(material.matteHigh, text.medium),
  /* An *empty mark* — an unchecked box, an unselected radio — is a hollow control: nothing inside it
     says what it is, and it still has to be identifiable at 3:1. Neither the neutral fill (about
     1.3:1 against the surface around it) nor any depth the light model can draw gets it there
     without turning the mark into a shaded orb. So an empty mark is the one control that carries
     a **rim**: the `rim` tone, tuned to just clear 3:1 on every surface, drawn as the lip of the
     recess it sits in rather than as an outline over a filled control. The rim belongs to the empty
     state only — a selected mark is identified by its fill, and the rim dissolves into it.
     The rim is an overlay rather than the mark's own border, so the fill, the hover layer and the
     recess all reach the mark's real edge: a border would leave a 1.5px frame of untinted fill
     around a hovered selected box. Hover steps the rim to the mid-emphasis tone — darker in light
     mode, lighter in dark — which is a visible answer on a 20px mark where a tint alone is not. */
  mark: /* @__PURE__ */ cx(
    "bg-sherick-canvas/[0.7]",
    text.medium,
    "after:pointer-events-none after:absolute after:inset-0 after:box-border after:rounded-[inherit] after:border-[1.5px] after:content-['']",
    "after:border-sherick-rim",
    "group-[:not([data-disabled]):not([data-readonly]):not(:disabled):hover]:after:border-sherick-ink-muted",
    motionRim
  ),
  /* A selected mark is the strong accent, edge to edge, and it settles flat: it is identified by
     its fill and its glyph, and the rim fades out as the fill arrives. The rim fades by opacity
     rather than by colour, so forced colors cannot repaint a transparent rim as a visible one. */
  selected:
    "group-data-[checked]:bg-sherick-primary-strong group-data-[checked]:text-sherick-on-primary group-data-[checked]:shadow-sherick-flat group-data-[checked]:after:opacity-0",
  indeterminate:
    "group-data-[indeterminate]:bg-sherick-primary-strong group-data-[indeterminate]:text-sherick-on-primary group-data-[indeterminate]:shadow-sherick-flat group-data-[indeterminate]:after:opacity-0",
  /* A selected radio's dot: the socket's on-colour, flat. A Switch thumb is lifted because it is a
     24px part the user moves; an 8px dot under the same shadow reads as a bead with a halo. */
  thumb: "bg-current",
} as const;

/* The authored alphas the contrast contract measures. They are derived from the class names above
   rather than restated, so a change to a state step, a tint strength or the field ladder moves the
   measurement with it: `scripts/smoke-package.mjs` passes this model to
   `scripts/contrast-contract.mjs`, and the same module proves every class here has a rule in the
   published stylesheet. */
const recipeAlpha = (recipe: string, pattern: RegExp, label: string) => {
  const match = recipe.match(pattern);
  if (!match) throw new Error(`recipe alpha missing for ${label}`);
  return Number(match[1]);
};
const stateAlpha = (recipe: string, label: string) =>
  recipeAlpha(recipe, /opacity-\[(0?\.\d+)\]/, label);
const fillAlpha = (recipe: string, label: string) => recipeAlpha(recipe, /\/\[(0?\.\d+)\]/, label);
/* A field well's canvas step: written without an alpha, the step is the opaque canvas. */
const wellAlpha = (recipe: string, label: string) => {
  const match = recipe.match(/bg-sherick-canvas(?:\/\[(0?\.\d+)\])?(?:\s|$)/);
  if (!match) throw new Error(`recipe alpha missing for ${label}`);
  return match[1] === undefined ? 1 : Number(match[1]);
};

export const recipeAlphas = {
  state: {
    quiet: { hover: stateAlpha(hoverQuiet, "state.quiet.hover"), press: stateAlpha(pressQuiet, "state.quiet.press") },
    tonal: { hover: stateAlpha(hoverTonal, "state.tonal.hover"), press: stateAlpha(pressTonal, "state.tonal.press") },
    tonalNeutral: { hover: stateAlpha(hoverTonal, "state.tonalNeutral.hover"), press: stateAlpha(pressTonalNeutral, "state.tonalNeutral.press") },
    filled: { hover: stateAlpha(hoverFilled, "state.filled.hover"), press: stateAlpha(pressFilled, "state.filled.press") },
    mark: { hover: stateAlpha(hoverMark, "state.mark.hover") },
  },
  tint: {
    neutralSoft: fillAlpha(tone.soft.secondary, "tint.neutralSoft"),
    neutralRest: fillAlpha(tone.tonal.secondary, "tint.neutralRest"),
  },
  field: {
    quiet: fillAlpha(material.matteQuiet, "field.quiet"),
    card: fillAlpha(material.matte, "field.card"),
    groove: fillAlpha(material.matteHigh, "field.groove"),
    control: wellAlpha(material.control, "field.control"),
    hover: wellAlpha(state.field.hover, "field.hover"),
    engaged: wellAlpha(state.field.engaged, "field.engaged"),
  },
} as const;

/* A labelled field is a shrinkable column. Its explanatory copy wraps, including identifiers;
   the input itself keeps its native single-line scrolling behavior. */
export const fieldLayout = "flex min-w-0 w-full flex-col [overflow-wrap:anywhere]";

/* The messages under a field: its description or hint, and its error. One role for every field in
   the family, so a hint reads the same under a text field, a date range and a file chooser. */
export const fieldMessage = {
  description: /* @__PURE__ */ cx("mt-2", type.supporting, text.medium),
  error: /* @__PURE__ */ cx("mt-2", type.supporting, tone.text.danger),
} as const;
