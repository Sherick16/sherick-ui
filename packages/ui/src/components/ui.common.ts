import type { Variant } from "./ui.types";

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
     tone       its color role                     (text, soft, tonal, selected, strong)
     text       the three-step emphasis ladder     (high, medium, low)
     density    how tightly it is packed           (compact, normal, prominent, target)
     motion     how it moves                       (press, release, spring, travel, overlay)
     overlay    floating shells                    (menu, tooltip, dialog)
    focusRing  the one focus language             (focusRing, focusRingInset, focusRingWithin, groupFocusRing)

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
   `focusRing` draws the ring outside the shape, for a control that stands alone.
   `focusRingInset` draws it inside, for a control nested within another surface
   where an outer ring would collide with the parent's edge. Fields use the outer
   ring only: no inner rim is added, so focus reads as one ring, never two.
   `focusRingWithin` draws the outer ring from the composite that owns the focus,
   for a composite control whose inner input stays borderless. `groupFocusRing`
   draws it from the wrapping control instead of the track it contains. */
export const focusRing =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sherick-focus focus-visible:outline-offset-[3px]";

export const focusRingInset =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-focus";

export const focusRingWithin =
  "focus-within:outline focus-within:outline-2 focus-within:outline-sherick-focus focus-within:outline-offset-[3px]";

export const groupFocusRing =
  "group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-sherick-focus group-focus-visible:outline-offset-[3px]";

/* Motion — three families. A component picks a family, never a duration:
   - press:   a tonality change with no physical travel — hover, focus, an engaged field.
   - release: a tactile control: colour, shadow, transform and the size a selection or a
              thumb travels with.
   - travel:  geometry the user is aiming — a slider's handle and the fill it carries. A
              drag is never interpolated; a keyboard or programmatic step glides.
   - spring:  a part that arrives, compresses or rebounds — a selection mark, the surface
              it is made in, the value a stepper drives. The one family that overshoots.
   - overlay: the entrance and exit of anything that floats above the page, with a
              matching scrim family for the plane behind it.
   A control whose transform changes must use `release`, `spring` or `travel`; `press` is for
   pure tonality and colour transitions that never move or resize anything.
   Every family is neutralised under `prefers-reduced-motion`; the overlay family
   additionally drops its exit window entirely, so nothing lingers.
   Loading feedback (`animate-spin`, `animate-pulse`) sits outside these families:
   it reports progress rather than responding to interaction. */
export const motion = {
  press:
    "transition-[background-color,color,box-shadow,opacity] duration-press ease-press motion-reduce:transition-none",
  release:
    "transition-[background-color,color,box-shadow,transform,opacity,width,height] duration-release ease-release active:duration-press active:ease-press motion-reduce:transition-none motion-reduce:transform-none",
  travel:
    "transition-[inset-inline-start,width,height,background-color,color,box-shadow,transform,opacity] duration-release ease-release active:duration-press active:ease-press data-[dragging]:transition-[background-color,color,box-shadow,transform,opacity] motion-reduce:transition-none motion-reduce:transform-none",
  spring:
    "transition-[background-color,color,box-shadow,transform,opacity] duration-release ease-spring active:duration-press active:ease-press group-active:duration-press group-active:ease-press motion-reduce:transition-none motion-reduce:transform-none",
  overlayIn: "animate-sherick-overlay-in motion-reduce:animate-none",
  overlayOut: "animate-sherick-overlay-out motion-reduce:animate-none",
  scrimIn: "animate-sherick-scrim-in motion-reduce:animate-none",
  scrimOut: "animate-sherick-scrim-out motion-reduce:animate-none",
} as const;

/* Elevation — distance from the surface plane, and nothing else. Three depth roles
   exist, and the last two are a single tactile pair:
   - flat:     at rest on the page. Separation comes from tone alone.
   - raised:   a manipulated control, lifted a hair above its own track so it feels
               touchable; pressing it returns it to the track.
   - floating: a surface that genuinely sits above the application.
   - control:  the resting half of the tactile pair, for a part the user moves —
               a switch thumb, a selected segment.
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
} as const;

/* Shape — semantic corner roles, never an arbitrary radius. Softness grows with
   the size of the object and the emphasis it carries:
   - control:     ordinary controls and dense data regions — fields, rows, options,
                  chips, tables.
   - mark:        a compact square selection mark — a checkbox box. `control` is a role
                  for objects the size of a field; its radius exceeds the half-extent of a
                  24px square, so a mark needs a step of its own.
   - prominent:   prominent controls and compact floating surfaces.
   - surface:     large surfaces — cards, menus, panels.
   - expressive:  an expressive surface that owns the viewport — the large overlay
                  sheet, tightened so it reads as a focused surface rather than a
                  pillowy one.
   - pill:        fully rounded controls whose width follows their content.
   - circle:      fully rounded square targets. */
export const shape = {
  control: "rounded-[1.25rem]",
  mark: "rounded-[0.625rem]",
  prominent: "rounded-[1.5rem]",
  surface: "rounded-[1.75rem]",
  expressive: "rounded-[2rem]",
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
   structural join between two parts. */
export const edge = {
  /* Rows of a stacked list or table. */
  row: "border-b border-sherick-edge/[0.06] last:border-b-0",
  /* The heavier rule beneath a column header. */
  header: "border-b border-sherick-edge/[0.10]",
  /* A section break inside one surface, or a standalone rule. Pair it with the
     directional border class at the call site (`border-t`, `border-l`). */
  rule: "border-sherick-edge/[0.075]",
} as const;

/* Interaction states:
     rest       the material, at whatever elevation its anatomy calls for
     hover      one tonality step, never a change in depth or a new border
     pressed    a raised control returning to the recessed depth of its own track, plus
                a slight compression; a flat control stays flat and a floating one keeps
                its elevation
     selected   a selected tone; depth comes from the component's anatomy — a
                segment inside a groove is raised, a row in a list is not
     disabled   45% opacity, no pointer affordance, no interactive state at all
     focus      the shared outer focus ring, visible on keyboard focus */
export const state = {
  /* Tactile compression — controls only, never wide surfaces. A press travels about a pixel at
     the size of the ink it moves, so a control whose outline is what the user sees takes 2% and a
     control whose ink is far smaller than its target takes 10%. */
  press: "active:scale-[0.98] motion-reduce:active:scale-100",
  groupPress: "group-active:scale-[0.98] motion-reduce:group-active:scale-100",
  pressCompact: "active:scale-90 motion-reduce:active:scale-100",
  /* A raised matte control presses back into the track beneath it — the same physical
     depth a groove or a well sits at. */
  recess: "active:shadow-sherick-recessed",
  /* The disabled step for a control whose disabled state is a Sherick prop. */
  disabled: "cursor-not-allowed opacity-45",
  /* The same step, keyed on the primitive's own markers rather than on a Sherick prop: Base marks
     an effectively disabled control — including one disabled by the field around it — with
     `data-disabled`, and a part that disables itself at a bound carries `disabled` as well. */
  effectiveDisabled:
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45 disabled:cursor-not-allowed disabled:opacity-45",
  /* A row whose control is disabled by any means — its own option, its group, or the field around
     it — dims from the control's own marker rather than from a Sherick prop. */
  disabledRow: "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-45",
  /* A control nested inside a disabled composite. The composite already applied the opacity step,
     and a second one would dim the field unevenly; this carries only the disabled cursor. */
  disabledDescendant: "cursor-not-allowed",
  /* A part the pointer is engaging — the handle of a value control. It sits matte and settled at
     rest and takes its accent, a little larger, while the pointer is on it. Drag covers the case
     where the pointer has been captured and left the control. */
  engaged:
    "group-[:not([data-disabled])]:hover:scale-110 group-[:not([data-disabled])]:hover:bg-sherick-primary-strong group-[:not([data-disabled])]:hover:text-sherick-on-primary data-[dragging]:scale-110 data-[dragging]:bg-sherick-primary-strong data-[dragging]:text-sherick-on-primary",
  /* A part that is not the element being pressed but answers it — the value a stepper drives. */
  steppedValue:
    "group-has-[button:active]:scale-[1.06] group-has-[button:active]:duration-press group-has-[button:active]:ease-press",
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
  field: {
    hover: "hover:bg-sherick-surface-high/[0.82]",
    focus: "focus:bg-sherick-surface-high/[0.9]",
    focusWithin: "focus-within:bg-sherick-surface-high/[0.9]",
    engaged: "bg-sherick-surface-high/[0.9]",
    errorHover: "hover:bg-sherick-danger/[0.10]",
    errorFocus: "focus:bg-sherick-danger/[0.13]",
    errorEngaged: "bg-sherick-danger/[0.13]",
    /* The error ladder again, keyed on Base UI's validity attribute for a part that learns its
       validity from the field it sits in. Two variants outrank the single-variant ladder above,
       so neither ladder has to be conditional. */
    invalid: "data-[invalid]:bg-sherick-danger/[0.075]",
    invalidHover: "data-[invalid]:hover:bg-sherick-danger/[0.10]",
    invalidFocusWithin: "data-[invalid]:focus-within:bg-sherick-danger/[0.13]",
  },
} as const;

/* State layers.
   Replacing `background-color` on hover erases whatever fill a control owns: an
   opaque fill collapses to a bare tint and a tinted fill loses most of its step.
   This overlay instead composites over the fill, tinted with `currentColor` — the
   container's own on-color, which is also the color furthest from that fill, and
   the same color as the label, so the glyphs themselves are unaffected. Opacity
   carries the state, so it fades on the shared motion curve instead of snapping,
   and it takes the press timing while the control is held.
   One step per fill strength: a quiet surface tints lightly, an opaque accent fill
   takes the heaviest step.
   The hover step is gated on the primitive's own disabled markers, so an effectively
   disabled control never tints — whether it was disabled by a prop, by its group or by
   the field around it. A disabled element cannot be `:active`, so the press step needs
   no gate. */
const stateLayerBase =
  "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:opacity-0 before:transition-opacity before:duration-release before:ease-release active:before:duration-press active:before:ease-press motion-reduce:before:transition-none";

/* A part is hoverable only while it is interactive: `[&:not(:disabled)]` for a native control,
   and the group form for a part whose hover arrives from the wrapping control. */
const whileInteractive = "[&:not(:disabled)]:hover";
const whileGroupInteractive = "group-[:not([data-disabled]):not(:disabled)]:hover";

export const stateLayer = {
  /* Quiet surfaces — ghost controls, navigation rows, menu options. */
  quiet: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current ${whileInteractive}:before:opacity-[0.05] active:before:opacity-[0.09]`,
  /* Tinted containers: the fill is nearly page color already, so the container's own
     on-color (`current`) carries the state at a light step. Shared by every matte
     control with a fill — tonal buttons, icon buttons, acrylic buttons. */
  tonal: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current ${whileInteractive}:before:opacity-[0.09] active:before:opacity-[0.15]`,
  /* Opaque fills: `current` is the fill's own on-color — the color furthest from it in
     either theme — so one step reads on a saturated blue and a neutral gray alike. */
  filled: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current ${whileInteractive}:before:opacity-[0.18] active:before:opacity-[0.26]`,
  /* A switch track or a selection well: the same layer, but hover and press arrive from the
     wrapping control rather than from the surface itself. */
  track: `${stateLayerBase} before:rounded-[inherit] before:bg-current ${whileGroupInteractive}:before:opacity-[0.18] group-active:before:opacity-[0.26] group-active:before:duration-press group-active:before:ease-press`,
  /* A row highlighted by keyboard navigation. Base UI collection primitives expose
     `data-highlighted`; this is the one canonical visual treatment for it. */
  activeRow: "data-[highlighted]:before:opacity-[0.06]",
} as const;

/* Hit area — the interactive region of a control whose visible mark is smaller than a comfortable
   target, drawn outside the layout box so a column, a row gap and the space beside a label are all
   measured from the control the user sees. The expansion is capped at the accessible target floor;
   CSS cannot see neighbouring geometry, so it keeps clearance only while surrounding rows are at
   least as tall as that floor — which this library's own `density.normal` rhythm is, and a 40px
   table row is not. */
export const hitArea =
  "relative after:pointer-events-auto after:absolute after:-inset-2.5 after:content-['']";

/* Material — fill only. No material carries elevation or a rim: the same matte
   fill appears flat in a card, lifted on a button and recessed in a groove.
   - canvas:      the page itself.
   - matteQuiet:  the quietest matte step, for dense data regions and wells that
                  should sit back from the surface around them.
   - matte:       a matte surface that separates from the canvas by tone alone.
   - matteHigh:   the second matte step, for nesting inside another matte surface.
   - control:     the fill every text control shares, plus its placeholder tone.
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
                  touching its lighting. `acrylicDense` is the same sheet at higher opacity for
                  small floating surfaces that must stay legible.
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
  control: "bg-sherick-surface-high/[0.66] text-sherick-ink placeholder:text-sherick-ink-muted",
  controlError: "bg-sherick-danger/[0.075] text-sherick-ink placeholder:text-sherick-danger/[0.72]",
  handle: "bg-sherick-ink-muted text-sherick-canvas",
  acrylic:
    "bg-sherick-surface-float/[0.60] bg-[image:var(--sui-glass-gradient)] text-sherick-ink backdrop-blur-[var(--sui-glass-blur)] backdrop-saturate-[var(--sui-glass-saturation)] backdrop-brightness-[var(--sui-glass-brightness)]",
  acrylicDense:
    "bg-sherick-surface-float/[0.72] bg-[image:var(--sui-glass-gradient-dense)] text-sherick-ink backdrop-blur-[var(--sui-glass-dense-blur)] backdrop-saturate-[var(--sui-glass-dense-saturation)] backdrop-brightness-[var(--sui-glass-dense-brightness)]",
  acrylicHero:
    "bg-sherick-surface-overlay/[var(--sui-overlay-fill)] bg-[image:var(--sui-glass-hero-gradient)] text-sherick-ink backdrop-blur-[var(--sui-glass-hero-blur)] backdrop-saturate-[var(--sui-glass-hero-saturation)] backdrop-brightness-[var(--sui-glass-hero-brightness)]",
} as const;

/* Density — three control steps plus the accessible hit target.
   Density owns height and the type step, so controls of one density share a
   rhythm. A component's anatomy owns its padding: a button's inline padding is
   set by how it is gripped, a field's by how much text it holds, and neither is
   derived from the other. The library targets dense desktop and product UI, so
   even the prominent step stays compact. Body copy, headings and labels are
   content, not controls, and set their own type. */
export const density = {
  compact: "min-h-10 text-sm",
  normal: "min-h-12 text-[0.95rem]",
  prominent: "min-h-14 text-lg",
  /* Minimum interactive target for an icon-only control. */
  target: "min-h-11 min-w-11",
} as const;

/* Floating overlay shells.
   Base UI owns popup presence, focus, dismissal, portals and anchored positioning.
   Sherick UI owns only the visual shell: material, elevation, shape and the geometry
   that its shared overlay motion grows from. A Base-backed overlay composes one recipe
   here and selects `motion.overlayIn` / `motion.overlayOut` from Base's open state. */
export const overlay = {
  /* A menu grows out of its trigger. */
  menu: `origin-top [--sui-overlay-from-scale:0.985] [--sui-overlay-from-lift:-4px] ${shape.surface} ${material.acrylic} ${elevation.floating}`,
  /* A tooltip grows out of the edge it is anchored to, so its geometry is per position
     and is applied with the position in the component. */
  tooltip: `${shape.prominent} ${material.acrylicDense} ${elevation.floating}`,
  /* A dialog rises further than a menu, from its own scale. */
  dialog: `[--sui-overlay-from-scale:0.985] [--sui-overlay-from-lift:8px] ${shape.expressive} ${material.acrylicHero} ${elevation.floating}`,
} as const;

/* Text hierarchy — three steps, no more. High emphasis carries labels and values,
   medium emphasis carries supporting copy, low emphasis carries the dimmest
   furniture such as gutters and hints. */
export const text = {
  high: "text-sherick-ink",
  medium: "text-sherick-ink-muted",
  low: "text-sherick-ink-faint",
} as const;

/* Tone hierarchy — the color roles a surface can take, in rising strength:
     text      foreground only, for quiet rows and links.
     soft      a de-emphasised tinted surface: alerts, badges, quiet cards.
     tonal     a matte control fill at rest: tonal buttons, icon buttons.
     selected  the fill a selected control holds: menu options, navigation, the
               selected segment of a segmented control.
     strong    the opaque accent fill that marks priority.
   A fill step is composited over whatever sits beneath it, so one tone reads
   correctly on the canvas, inside a card and on an acrylic sheet. */
export const tone = {
  text: {
    primary: "text-sherick-primary",
    secondary: "text-sherick-ink",
    danger: "text-sherick-danger",
    warning: "text-sherick-warning",
    success: "text-sherick-success",
  },
  soft: {
    primary: "bg-sherick-primary/[0.12] text-sherick-primary",
    secondary: "bg-sherick-surface/[0.78] text-sherick-ink",
    danger: "bg-sherick-danger/[0.09] text-sherick-danger",
    warning: "bg-sherick-warning/[0.09] text-sherick-warning",
    success: "bg-sherick-success/[0.09] text-sherick-success",
  },
  tonal: {
    primary: "bg-sherick-primary/[0.12]",
    secondary: "bg-sherick-surface-high/[0.56]",
    danger: "bg-sherick-danger/[0.09]",
    warning: "bg-sherick-warning/[0.09]",
    success: "bg-sherick-success/[0.09]",
  },
  selected: {
    primary: "bg-sherick-primary/[0.22] text-sherick-ink",
    secondary: "bg-sherick-surface-high/[0.82] text-sherick-ink",
    danger: "bg-sherick-danger/[0.16] text-sherick-ink",
    warning: "bg-sherick-warning/[0.16] text-sherick-ink",
    success: "bg-sherick-success/[0.16] text-sherick-ink",
  },
  strong: {
    primary: "bg-sherick-primary-strong text-sherick-on-primary",
    secondary: "bg-sherick-surface-high text-sherick-ink",
    danger: "bg-sherick-danger text-sherick-on-danger",
    warning: "bg-sherick-warning text-sherick-on-warning",
    success: "bg-sherick-success text-sherick-on-success",
  },
} satisfies Record<string, Record<Variant, string>>;

/* Selectable surface — the recessed surface of a control that fills once it is selected: a
   switch track, a checkbox box, a radio circle, a slider groove. Selection is keyed on the
   primitive's own `data-checked` / `data-indeterminate`, so an uncontrolled control is styled
   from the same source of truth as a controlled one. A mixed box is selected but is not
   ticked, which is why the second attribute stands beside the first. */
export const selectable = {
  surface: `relative ${elevation.recessed} ${motion.spring}`,
  rest: `${material.matteHigh} ${text.medium}`,
  selected:
    "group-data-[checked]:bg-sherick-primary-strong group-data-[checked]:text-sherick-on-primary",
  indeterminate:
    "group-data-[indeterminate]:bg-sherick-primary-strong group-data-[indeterminate]:text-sherick-on-primary",
  /* The mark exists only while the control is selected, and leaves softly. */
  mark: `${motion.spring} data-[starting-style]:scale-50 data-[ending-style]:scale-50 data-[ending-style]:opacity-0`,
} as const;