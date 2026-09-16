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
     motion     how it moves                       (press, release, overlay)
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
   - press:   a tonality change with no physical travel: hover, focus, an engaged
              field. Fast and decisive in both directions.
   - release: a tactile control. It carries every property a tactile control can
              animate — colour, shadow, transform and the size a selection or a thumb
              travels with — and it takes the press timing while it is held (`active:`),
              so the press lands immediately, while the release timing carries the
              settle, so letting go is expressive.
   A control whose transform changes must use `release`; `press` is for pure tonality
   and colour transitions that never move or resize anything.
   - overlay: the entrance and exit of anything that floats above the page, with a
              matching scrim family for the plane behind it.
   Every family is neutralised under `prefers-reduced-motion`; the overlay family
   additionally drops its exit window entirely, so nothing lingers.
   Loading feedback (`animate-spin`, `animate-pulse`) sits outside these families:
   it reports progress rather than responding to interaction. */
export const motion = {
  press:
    "transition-[background-color,color,box-shadow,opacity] duration-press ease-press motion-reduce:transition-none",
  release:
    "transition-[background-color,color,box-shadow,transform,opacity,width,height] duration-release ease-release active:duration-press active:ease-press motion-reduce:transition-none motion-reduce:transform-none",
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
               lands at the same depth. `pressed` is the published alias for that depth;
               prefer `recessed` whenever the surface is simply sunk rather than held.
   A passive surface is flat unless its anatomy is sunk by design: a well, a groove and
   a code well are `recessed` while they sit there, and `flat` is the default for
   everything else passive. A flat control never gains depth by being pressed. */
export const elevation = {
  flat: "shadow-sherick-flat",
  raised: "shadow-sherick-raised",
  floating: "shadow-sherick-floating",
  control: "shadow-sherick-control",
  recessed: "shadow-sherick-recessed",
  /* The same physical depth, named for the moment a control reaches it by being held
     down. Kept because it is published: a control that is actively pressed and a
     passive groove resolve to one recessed depth, so neither name describes a
     different height. */
  pressed: "shadow-sherick-pressed",
} as const;

/* Shape — semantic corner roles, never an arbitrary radius. Softness grows with
   the size of the object and the emphasis it carries:
   - control:     ordinary controls and dense data regions — fields, rows, options,
                  chips, tables.
   - prominent:   prominent controls and compact floating surfaces.
   - surface:     large surfaces — cards, menus, panels.
   - expressive:  an expressive surface that owns the viewport — the large overlay
                  sheet, tightened so it reads as a focused surface rather than a
                  pillowy one.
   - pill:        fully rounded controls whose width follows their content.
   - circle:      fully rounded square targets. */
export const shape = {
  control: "rounded-[1.25rem]",
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
  /* Tactile compression — controls only, never wide surfaces. */
  press: "active:scale-[0.98] motion-reduce:active:scale-100",
  /* The same compression, driven by the wrapping button instead of the track. */
  groupPress: "group-active:scale-[0.98] motion-reduce:group-active:scale-100",
  /* A raised matte control presses back into the track beneath it — the same physical
     depth a groove or a well sits at. */
  recess: "active:shadow-sherick-recessed",
  disabled: "cursor-not-allowed opacity-45",
  /* A control nested inside a disabled composite. The composite already applied the
     opacity step, and a second one would dim the field unevenly; this carries only the
     disabled cursor and semantics. */
  disabledDescendant: "cursor-not-allowed",
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
   takes the heaviest step. */
const stateLayerBase =
  "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:opacity-0 before:transition-opacity before:duration-release before:ease-release active:before:duration-press active:before:ease-press motion-reduce:before:transition-none";

export const stateLayer = {
  /* Quiet surfaces — ghost controls, navigation rows, menu options. */
  quiet: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current hover:before:opacity-[0.05] active:before:opacity-[0.09]`,
  /* Tinted containers: the fill is nearly page color already, so the container's own
     on-color (`current`) carries the state at a light step. Shared by every matte
     control with a fill — tonal buttons, icon buttons, acrylic buttons. */
  tonal: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current hover:before:opacity-[0.09] active:before:opacity-[0.15]`,
  /* Opaque fills: `current` is the fill's own on-color — the color furthest from it in
     either theme — so one step reads on a saturated blue and a neutral gray alike. */
  filled: `relative ${stateLayerBase} before:rounded-[inherit] before:bg-current hover:before:opacity-[0.18] active:before:opacity-[0.26]`,
  /* A switch track: the same layer, but hover and press arrive from the wrapping button
     rather than the track itself. A segmented track is recessed for the same static
     reason but does not compose this layer. */
  track: `${stateLayerBase} before:rounded-[inherit] before:bg-current group-hover:before:opacity-[0.18] group-active:before:opacity-[0.26] group-active:before:duration-press group-active:before:ease-press`,
  /* A row highlighted by keyboard navigation. Legacy Sherick rows expose `data-active`;
     Base UI collection primitives expose `data-highlighted`, and both consume this one
     canonical visual treatment. */
  activeRow:
    "data-[active=true]:before:opacity-[0.06] data-[highlighted]:before:opacity-[0.06]",
} as const;

/* Material — fill only. No material carries elevation or a rim: the same matte
   fill appears flat in a card, lifted on a button and recessed in a groove.
   - canvas:      the page itself.
   - matteQuiet:  the quietest matte step, for dense data regions and wells that
                  should sit back from the surface around them.
   - matte:       a matte surface that separates from the canvas by tone alone.
   - matteHigh:   the second matte step, for nesting inside another matte surface.
   - control:     the fill every text control shares, plus its placeholder tone.
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
  acrylic:
    "bg-sherick-surface-float/[0.60] bg-[image:var(--sui-glass-gradient)] text-sherick-ink backdrop-blur-[var(--sui-glass-blur,32px)] backdrop-saturate-[var(--sui-glass-saturation,1.45)] backdrop-brightness-[var(--sui-glass-brightness,1.04)]",
  acrylicDense:
    "bg-sherick-surface-float/[0.72] bg-[image:var(--sui-glass-gradient-dense)] text-sherick-ink backdrop-blur-[var(--sui-glass-dense-blur,26px)] backdrop-saturate-[var(--sui-glass-dense-saturation,1.38)] backdrop-brightness-[var(--sui-glass-dense-brightness,1.035)]",
  acrylicHero:
    "bg-sherick-surface-overlay/[var(--sui-overlay-fill,0.9)] bg-[image:var(--sui-glass-hero-gradient)] text-sherick-ink backdrop-blur-[var(--sui-glass-hero-blur,14px)] backdrop-saturate-[var(--sui-glass-hero-saturation,1.06)] backdrop-brightness-[var(--sui-glass-hero-brightness,1)]",
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