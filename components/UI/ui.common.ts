import type { Variant } from "./ui.types";

/* Sherick UI design primitives
   ==========================================================================
   One module owns every visual rule in the library. A component composes these
   primitives; it does not write a color, shadow, radius, duration or edge of its
   own. The system has seven parts:

     edge       the hairline that traces a surface  (faint, base, strong)
     elevation  how far it sits off the page        (flat, raised, floating, control, pressed)
     shape      its corner role                     (control, prominent, surface, expressive, pill, circle)
     state      how it responds                     (rest, hover, pressed, selected, disabled, focus)
     material   what a surface is made of           (canvas, matte, raised matte, acrylic)
     tone       its color role                      (text, soft, tonal, selected, strong)
     density    how tightly it is packed            (compact, normal, prominent, target)
     motion     how it moves                        (press, release, overlay)

   Elevation, edge, lighting and acrylic all derive from the single light model in
   `theme.css` (light above the surface plane), so a control's highlight, its
   shadow, a floating sheet's gradient and a pressed inset stay physically
   related rather than merely coexisting. */

/* Focus visibility — one language for every interactive element.
   `focusRing` draws the ring outside the shape, for a control that stands alone.
   `focusRingInset` draws it inside, for a control nested within another surface
   where an outer ring would collide with the parent's own edge. */
export const focusRing =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-sherick-focus focus-visible:outline-offset-[3px]";

export const focusRingInset =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sherick-focus";

/* Motion — three families. A component picks a family, never a duration:
   - press:   the fast, decisive response to a press or a tonality change.
   - release: the expressive settle when a control is released, a selection moves,
              a thumb slides or a floating surface arrives.
   - overlay: the entrance and exit of anything that floats above the page, with a
              matching scrim family for the plane behind it.
   `release` carries size as well as transform because a selection may change the
   shape of the part that moves (a switch thumb grows as it slides). Every family
   is neutralised under `prefers-reduced-motion`.
   Loading feedback (`animate-spin`, `animate-pulse`) sits outside these families:
   it reports progress rather than responding to interaction. */
export const motion = {
  press:
    "transition-[background-color,color,box-shadow,transform,opacity] duration-press ease-press motion-reduce:transition-none motion-reduce:transform-none",
  release:
    "transition-[background-color,color,box-shadow,transform,opacity,width,height] duration-release ease-release motion-reduce:transition-none motion-reduce:transform-none",
  overlayIn: "animate-sherick-overlay-in motion-reduce:animate-none",
  overlayOut: "animate-sherick-overlay-out motion-reduce:animate-none",
  scrimIn: "animate-sherick-scrim-in motion-reduce:animate-none",
  scrimOut: "animate-sherick-scrim-out motion-reduce:animate-none",
} as const;

/* Structural edges.
   A matte surface does not need a conventional border. What separates it from the
   page is lighting: a faint structural edge traces the shape, the elevation step
   adds a microscopic upper highlight and a soft lower shadow, and together they
   read as a lit rim rather than a drawn line. The edge is a hairline inset ring, so
   it follows any radius and never affects layout.
   The edge hierarchy is a tone ladder on that one hairline, and each step is owned
   by the trigger that applies it: faint at rest, base while hovered, strong while
   focused, engaged or selected. The remaining entries are the same hairline used as
   a separator instead of a rim, so every structural line shares one tone. */
export const edge = {
  faint: "ring-1 ring-inset ring-sherick-edge/[0.09]",
  hover: "hover:ring-sherick-edge/[0.14]",
  focus: "focus:ring-sherick-edge/[0.22]",
  focusWithin: "focus-within:ring-sherick-edge/[0.22]",
  engaged: "ring-sherick-edge/[0.22]",
  /* Rows of a stacked list or table. */
  row: "border-b border-sherick-edge/[0.075] last:border-b-0",
  /* The heavier rule beneath a column header. */
  header: "border-b border-sherick-edge/[0.10]",
  /* A section break inside one surface, or a standalone rule. Pair it with the
     directional border class at the call site (`border-t`, `border-l`). */
  rule: "border-sherick-edge/[0.075]",
} as const;

/* Elevation — the only sanctioned source of depth beside `press`. Shadow encodes
   how far a surface sits above the ground, never decoration:
   - flat:     matte surfaces that separate from the canvas by tone alone.
   - raised:   raised matte surfaces and tactile tonal controls, on a soft contact
               shadow that stays close to the edge.
   - floating: acrylic surfaces above the application.
   - control:  matte interactive controls, a hair above their own track at rest.
   - pressed:  the same controls pressed or selected, recessed into that track.
   Only these steps may appear anywhere in the library. */
export const elevation = {
  flat: "shadow-sherick-flat",
  raised: "shadow-sherick-raised",
  floating: "shadow-sherick-floating",
  control: "shadow-sherick-control",
  pressed: "shadow-sherick-pressed",
} as const;

/* Shape — semantic corner roles, never an arbitrary radius. Softness grows with
   the size of the object and the emphasis it carries:
   - control:     ordinary controls — fields, rows, options, chips.
   - prominent:   prominent controls and compact floating surfaces.
   - surface:     large surfaces — cards, menus, panels, data regions.
   - expressive:  expressive surfaces that own the viewport — hero overlays.
   - pill:        fully rounded controls whose width follows their content.
   - circle:      fully rounded square targets. */
export const shape = {
  control: "rounded-[1.25rem]",
  prominent: "rounded-[1.5rem]",
  surface: "rounded-[1.75rem]",
  expressive: "rounded-[2.25rem]",
  pill: "rounded-full",
  circle: "rounded-full",
} as const;

/* Interaction states. The full language is:
     rest       the material and its resting elevation
     hover      one tonality step, never a change in depth
     pressed    recessed into its own track, plus a slight compression
     selected   the pressed depth held, with a selected tone
     disabled   45% opacity, no pointer affordance, no interactive state at all
     focus      the shared focus ring, visible on keyboard focus
   Depth, tonality and edge lighting carry these states together; a control that
   only swaps a color is the exception, not the pattern. */
export const state = {
  /* Tactile compression — matte controls only, never wide surfaces. */
  press: "active:scale-[0.98] motion-reduce:active:scale-100",
  /* The same compression, driven by the wrapping button instead of the track. */
  groupPress: "group-active:scale-[0.98] motion-reduce:group-active:scale-100",
  /* A raised matte control presses into the track beneath it. */
  recess: "active:shadow-sherick-pressed",
  /* That recess, held for as long as a selection lasts. */
  selected: "shadow-sherick-pressed",
  disabled: "cursor-not-allowed opacity-45",
  enabled: "cursor-pointer",
  /* Quiet scan feedback for non-interactive data rows: tonality only, no depth,
     no press, no selection. */
  rowHover: "hover:bg-sherick-ink/[0.05]",
  /* The matte field family — one tonality ladder, one edge ladder, four triggers.
     A field steps its surface up once on hover and once more while it is engaged; a
     composite field focuses its outer surface while the input inside stays
     borderless; an expanded control holds the engaged step for as long as its popup
     is open. */
  field: {
    hover: `hover:bg-sherick-surface-high/[0.82] ${edge.hover}`,
    focus: `focus:bg-sherick-surface-high/[0.9] ${edge.focus}`,
    focusWithin: `focus-within:bg-sherick-surface-high/[0.9] ${edge.focusWithin}`,
    engaged: `bg-sherick-surface-high/[0.9] ${edge.engaged}`,
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
   carries the state, so it fades on the shared motion curve instead of snapping.
   One step per fill strength: a quiet surface tints lightly, an opaque accent fill
   takes the heaviest step. */
const stateLayerBase =
  "before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:opacity-0 before:transition-opacity before:duration-release before:ease-release motion-reduce:before:transition-none";

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
  /* Tracks: the same layer, but hover arrives from the wrapping button rather than
     the track itself. */
  track: `${stateLayerBase} before:rounded-[inherit] before:bg-current group-hover:before:opacity-[0.18] group-active:before:opacity-[0.26]`,
  /* A menu row highlighted by keyboard navigation rather than a pointer. */
  activeRow: "data-[active=true]:before:opacity-[0.06]",
} as const;

/* Material — what a surface is made of. Depth is not part of a material: the same
   matte recipe appears flat in a card and raised on a control.
   - canvas:      the page itself.
   - matte:       a matte surface that separates from the canvas by tone alone.
   - matteHigh:   the second matte step, for nesting inside another matte surface.
   - matteRaised: a matte surface lifted off the page. Pair it with `tone.tonal` for
                  a tonal control, or leave it neutral for a lifted panel.
   - control:     the resting surface of a matte field: tone, a faint structural
                  edge and tactile depth. Interaction steps live in `state.field`,
                  so a disabled field simply keeps the resting surface.
   - acrylic:     a floating sheet above the application. The gradient is lit from
                  above like everything else, so its top edge is brighter than its
                  bottom. `acrylicDense` is the same sheet at higher opacity, for
                  small floating surfaces that would otherwise be hard to read. */
export const material = {
  canvas: "bg-sherick-canvas text-sherick-ink",
  matte: "bg-sherick-surface/[0.78] text-sherick-ink",
  matteHigh: "bg-sherick-surface-high/[0.72] text-sherick-ink",
  matteRaised: `bg-sherick-surface-float/[0.82] text-sherick-ink ${elevation.raised} ${edge.faint}`,
  control: `bg-sherick-surface-high/[0.66] text-sherick-ink placeholder:text-sherick-ink-muted ${edge.faint} ${elevation.control}`,
  controlError: `bg-sherick-danger/[0.075] text-sherick-ink placeholder:text-sherick-danger/[0.72] ${edge.faint} ${elevation.control}`,
  acrylic: `bg-sherick-surface-float/[0.60] bg-sherick-glass text-sherick-ink ${elevation.floating} backdrop-blur-[var(--sui-glass-blur,32px)] backdrop-saturate-[var(--sui-glass-saturation,1.45)] backdrop-brightness-[var(--sui-glass-brightness,1.04)]`,
  acrylicDense: `bg-sherick-surface-float/[0.72] bg-sherick-glass-dense text-sherick-ink ${elevation.floating} backdrop-blur-[var(--sui-glass-dense-blur,26px)] backdrop-saturate-[var(--sui-glass-dense-saturation,1.38)] backdrop-brightness-[var(--sui-glass-dense-brightness,1.035)]`,
} as const;

/* Density — three control sizes plus the accessible hit target.
   The library targets dense desktop and product UI, so even the prominent step stays
   compact: density changes padding, height and type step, never the interaction
   language. Body copy, headings and labels are content, not controls, and set their
   own type. */
export const density = {
  compact: "min-h-10 px-3.5 py-2 text-sm",
  normal: "min-h-12 px-5 py-3 text-[0.95rem]",
  prominent: "min-h-14 px-8 py-4 text-base",
  /* Minimum interactive target for an icon-only control. */
  target: "min-h-11 min-w-11",
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
     selected  the fill a selected control holds while it stays recessed.
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
