# Sherick UI design language

The canonical source of truth for Sherick UI's visual language. Every reusable visual
rule lives here.

Three sources implement it and none invents a rule of its own:

| Layer | File | Contains |
| --- | --- | --- |
| Recipes | `packages/ui/src/components/ui.common.ts` | the named primitives a component composes |
| Tokens | `packages/ui/src/styles/tokens.ts` | the authored runtime values those primitives resolve to, per theme |
| CSS build | `packages/ui/scripts/build-styles.ts` | private compilation/scoping into generated `dist/theme.css` and `dist/styles.css` |

If this document and any other file disagree — a README paragraph, a showcase caption,
a code comment — this document wins and the other file is corrected.

Sherick UI deliberately keeps **visual design** separate from **widget mechanics**.
`@base-ui/react` is the behavioral and accessibility substrate wherever it provides the
primitive: keyboard navigation, focus management, semantic relationships, form
participation, portals, dismissal, popup positioning and primitive state belong to Base
UI. This document remains authoritative for what those primitives look and feel like —
material, elevation, edge, shape, tone, state treatment, density, focus appearance and
motion. Base UI never defines Sherick's visual language.

> **The development showcase demonstrates the system; it does not explain it. Design
> rationale belongs in this document.**

---

## 1. The governing rule

**Quiet by default, expressive where it matters.**

Ordinary information and form controls stay matte, predictable and neutral. Color,
motion and depth are spent where UI floats, activates or genuinely deserves emphasis.
Expressiveness is a budget, not a style: every loud surface makes the surfaces around
it quieter.

The physical language, in order:

```
flat matte by default
  -> tactile depth on manipulated controls
    -> recessed depth for tracks, grooves and wells, and for a raised control while
       it is held
      -> acrylic only for surfaces that genuinely float above the page
```

A component enters this ladder at the step its anatomy demands and stops there. It
never climbs a step to announce a state.

---

## 2. Orthogonality: material, elevation and edge

These three primitives are independent, and that is the load-bearing decision of the
whole system:

- **material** is a fill, and nothing else.
- **elevation** is a distance from the surface plane, and nothing else.
- **edge** is a structural line between two parts, and nothing else.

Because nothing is baked in, the same matte fill appears flat in a card, lifted on a
button and recessed in a groove. A component adds elevation only where its anatomy is
genuinely lifted, and a hairline only where two parts actually meet.

**Do:** combine freely — the dialog shell is `shape.expressive` + `material.acrylicHero` +
`elevation.floating`, and the switch thumb is `elevation.control` + `shape.circle` over its
own `bg-current` fill.
**Do not:** expect a material to carry a shadow, a radius or a border, or use an edge
to express a state.

---

## 3. Directional light model

Light comes from **directly above** the surface plane. Every depth cue in the library
is a consequence of that one fact, so shadows, edge highlights, acrylic gradients and
pressed insets stay physically related.

| Observation | Consequence |
| --- | --- |
| an upper edge catches light | `inset 0 1px 0` highlights, brighter acrylic tops |
| a lower edge falls into shade | shadows offset straight down (`0 Y`), acrylic gradients run top → bottom |
| a recessed surface inverts it | the upper lip is shaded, the lower lip catches a faint bounce |
| a structural edge is drawn | `--sui-edge`, a shade-tinted hairline |

`--sui-light-top` (the highlight color) and `--sui-light-bottom` (the shade color) are
the two values the elevation ladder composites from: `raised`, `floating`, `control` and
`recessed` are all built out of them, so re-tuning that pair re-lights every shadow,
highlight and pressed inset at once.

The acrylic recipes are a **separate** token family (`--sui-glass-*`), calibrated per
theme rather than composited from those two values. They follow the same directional
model — a brighter top, a shaded lower edge — so a sheet still reads as lit by the same
overhead source, but `--sui-light-*` is not the switch that retunes it.

In dark mode `--sui-edge` rims with light instead of shade: the same hairline role at
the opposite end of the same model. There is no second lighting system.

**Do not** add a shadow that is offset sideways or upward, a gradient that runs
bottom-to-top, or a highlight on a lower edge. Each one contradicts the light source
and breaks the relationship between every other depth cue.

---

## 4. Material — what a surface is made of

Primitives: `canvas`, `matteQuiet`, `matte`, `matteHigh`, `control`, `controlError`,
`acrylic`, `acrylicDense`, `acrylicHero`.

A material is a fill. Tone separates matte surfaces from each other; nothing else does.

| Material | Role | Should be used for | Should not be used for |
| --- | --- | --- | --- |
| `canvas` | the page itself | the root application surface | anything nested inside another surface |
| `matteQuiet` | the quietest matte step | dense data regions and wells that must sit back | primary content surfaces that need to read |
| `matte` | a matte surface separated by tone alone | cards, panels, grouped content | floating UI |
| `matteHigh` | the second matte step | nesting inside another matte surface | a page background |
| `control` | the fill every text control shares | text fields, textareas, search, select triggers | passive content surfaces |
| `controlError` | the same fill carrying danger tone | an invalid field | any non-semantic state |
| `acrylic` | a translucent sheet lit from above | menus, popovers and other surfaces floating above the app | anything grounded in the page |
| `acrylicDense` | the same sheet at higher opacity | small floating surfaces that must stay legible, such as tooltips | large sheets — use `acrylicHero` |
| `acrylicHero` | the large-overlay recipe | a surface that owns the viewport, such as a dialog | menus and tooltips |

**Do:** choose the material by what the surface *is*, then let tone alone separate it.
**Do not:** give a material a shadow or a rim, or reach for acrylic because a surface
"feels important". Acrylic is reserved for genuinely floating UI — a grounded card made
of glass is a contradiction.

---

## 5. Elevation — how far a surface sits off the page

Primitives: `flat`, `raised`, `floating`, `control`, `recessed`.

Depth is chosen by **anatomy**, never by state.

| Elevation | Role | Should be used for | Should not be used for |
| --- | --- | --- | --- |
| `flat` | at rest on the page | passive matte surfaces; wider surfaces such as cards | a well that is sunk by design — that is `recessed` |
| `raised` | a manipulated control lifted a hair above its own track | tactile tonal controls (`ActionButton` tonal, `IconButton`) | passive surfaces, table rows, menu rows |
| `control` | the resting half of the tactile pair | a part the user moves — a switch thumb, a selected segment | wide surfaces, or a whole segmented control |
| `recessed` | the other half of the pair | grooves, tracks and wells, which are sunk by definition | raised or resting controls |
| `floating` | a surface that genuinely sits above the application | acrylic overlays: menus, tooltips, dialogs | matte surfaces sitting on the page |

The tactile pair (`control` / `recessed`) is deliberately shallower than the tonal
ladder and geometry-neutral: a restrained echo of neumorphism, never a neumorphic
surface.

**Do:** let a control press back into the track beneath it — `state.recess` on a raised
control, which lands at the same depth a groove sits at.
**Do not** add depth *merely* to announce hover, selection or disabled: depth in this
system comes from anatomy, so the selected segment of a segmented control is raised while
the row it sits in a list stays flat.

---

## 6. Acrylic — the floating material

Acrylic is only correct for UI that floats above the application. Three recipes exist,
and the difference between them is opacity, blur and how much of the sheet is its own
tone rather than the defocused page behind it.

- `acrylic` — menus and popups. Translucent, gradient-lit, blurred.
- `acrylicDense` — small floating surfaces (tooltips). Same sheet, higher opacity,
  because a small surface has little room to stay legible.
- `acrylicHero` — the large overlay sheet (dialogs; reachable through `overlay.dialog`).
  Markedly more opaque and calmer: a surface that owns the viewport must read first as a
  physical surface and only secondarily as glass. The scrim behind it does the
  separating, the blur only defocuses, and the gradient is a restrained top-to-bottom
  light rather than a frosted haze. Its tone is a **subtle step above the canvas** in
  every theme — the invariant is enough separation from the canvas while staying
  substantially darker than a grey, foggy sheet. In dark mode that is a step of roughly
  0.03 in OKLCH lightness over the canvas (0.236 over 0.205), not a panel lighter than
  the floating surface level; in light mode it is 0.993 over 0.965. Because the step is
  small the sheet never leans on its shadow, and `--sui-overlay-fill` decides how much of
  it is its own tone rather than the defocused page — which is what a large overlay
  actually leans on, not blur.

Two implementation constraints, both load-bearing:

- The gradient arrives as a typed image arbitrary value rather than through the color
  scale, because `tailwind-merge` collapses two background utilities into one and would
  silently drop either the fill or the gradient. Each recipe is written out literally so
  the class scanner never meets a half-built name.
- The base fill stays an ordinary background color, so a caller can retone a sheet
  without touching its lighting.

**Do not** use acrylic for cards, panels, tables, fields or any other grounded surface,
and do not re-tune a sheet's blur to make it "pop".

---

## 7. Floating shells — the overlay recipes

Primitives: `overlay.menu`, `overlay.tooltip`, `overlay.dialog`.

An overlay is a **composition**, not a new material. Each recipe bundles the floating
shell's standard **material + elevation + shape + entrance geometry**, so every floating
surface in the library resolves the same way and stays consistent with the material,
elevation, acrylic and shape rules above.

| Recipe | Shell | Composes | Entrance geometry |
| --- | --- | --- | --- |
| `overlay.menu` | a menu, listbox or popup that grows out of its trigger | `shape.surface` + `material.acrylic` + `elevation.floating` | grows from its trigger: origin at the top, a small scale-up and a −4px lift |
| `overlay.tooltip` | a small anchored hint | `shape.prominent` + `material.acrylicDense` + `elevation.floating` | grows out of the edge it is anchored to, so its geometry is applied with its position |
| `overlay.dialog` | the dialog that owns the viewport | `shape.expressive` + `material.acrylicHero` + `elevation.floating` | rises into place from its own scale, with a larger lift than a menu |

The recipes own only the **visual shell** and the geometry its motion grows from. Base UI
owns popup presence, portals, focus management, pointer/focus suppression while closing,
outside interaction, Escape dismissal and anchored positioning. A Base-backed component
selects `motion.overlayIn` / `motion.overlayOut` (and the matching scrim family) from the
primitive's open/closing state; Sherick UI does not maintain a second overlay lifecycle.

Rules:

- **a new menu, tooltip or dialog consumes one of these recipes** rather than
  reconstructing floating-surface classes by hand: pick `overlay.menu`,
  `overlay.tooltip` or `overlay.dialog`, and let the recipe own the material, the
  elevation, the shape and the entrance geometry;
- a shell that needs a different combination is a **new recipe** — add it to this
  document and to `overlay` in `packages/ui/src/components/ui.common.ts` before anything uses it;
- behavior remains the Base primitive's responsibility; do not add Sherick-specific
  portal, focus-trap, dismissal, positioning or presence infrastructure around it.

---

## 8. Edge — structural lines

Primitives: `row` (the faintest), `header` (the heaviest), `rule` (between the two).

The hairline is reserved for **where two parts of one surface actually meet**: stacked
table rows, the rule beneath a column header, a divider, a code section boundary. One
tone serves every line, so those all agree with each other, and the public `Divider`
component renders exactly this tone so consumers never reach for a hand-built border.

A quote is **not** one of these. `Markdown` marks a blockquote with a primary accent,
because a quote is content-level emphasis rather than a structural join between two
parts, and `Markdown`'s `hr` takes `edge.rule` for the same reason a divider does.

A 1px ring that traces a filled object is still a drawn border. Therefore:

- matte controls carry **no rim**: they are separated by tone and by light alone;
- fields add no line at all — their hover, focus, engaged and error states are tonality
  only, which is why no border appears and disappears as a user interacts;
- `edge.rule` needs its direction supplied at the call site (`border-t`, `border-l`).

**Do:** use a hairline to separate sibling parts inside one surface.
**Do not** draw a rim around a filled control, outline a card for emphasis, or express an
interaction state with a border.

---

## 9. Shape grammar

Corner roles are semantic; nothing picks a radius of its own. Softness grows with the
size of the object and the emphasis it carries.

| Shape | Radius | Role | Should not be used for |
| --- | --- | --- | --- |
| `control` | 1.25rem | ordinary controls, dense data regions — fields, rows, options, chips, tables | large surfaces |
| `prominent` | 1.5rem | prominent controls, compact floating surfaces | small inline controls |
| `surface` | 1.75rem | large surfaces — cards, menus, panels | buttons |
| `expressive` | 2rem | an expressive surface that owns the viewport — the large overlay sheet, tightened so it reads as a focused surface rather than a pillowy one | anything smaller than a dialog |
| `pill` | full | fully rounded controls whose width follows their content | a wide button with a fixed width |
| `circle` | full | fully rounded square targets | non-square targets |

**Do:** hold one role across a whole component family, so a switch and a segmented
control read as the same object at two scales.
**Do not** substitute a numeric radius, or mix two adjacent steps inside one surface.

---

## 10. Tonal hierarchy

### Surfaces and text

Canvas plus three surface levels (`--sui-surface`, `--sui-surface-high`,
`--sui-surface-float`) carry structure. Three text steps carry emphasis and no more:

| Text step | Carries | Should not be used for |
| --- | --- | --- |
| `text.high` | labels and values | dimmed furniture |
| `text.medium` | supporting copy | primary labels, where it would soften hierarchy |
| `text.low` | the dimmest furniture — gutters, hints, token names | anything a user must read to act |

A surface level is a **tone, not a depth**. Depth comes from the elevation ladder.

### Color roles

The color roles a surface can take, in rising strength:

| Tone | Role | Should be used for | Should not be used for |
| --- | --- | --- | --- |
| `text` | foreground only | quiet rows and links | fills |
| `soft` | a de-emphasized tinted surface | alerts, badges, quiet cards | primary actions |
| `tonal` | a matte control fill at rest | tonal buttons, icon buttons, chips | surfaces that are not controls |
| `selected` | the fill a selected control holds | menu options, navigation, the selected segment of a segmented control | hover — hover is a state layer, not this tone |
| `strong` | the opaque accent fill that marks priority | the one primary action in a view | multiple actions competing for priority |

A fill step is composited over whatever sits beneath it, so one tone reads correctly on
the canvas, inside a card and on an acrylic sheet.

### Semantic color

Semantic color **marks meaning**; it never floods a surface:

- `danger`, `warning` and `success` describe a state of the data or the task, never
  decoration or brand;
- the mark lands on the surface and the icon; the copy stays at its normal emphasis so a
  semantic region is still readable;
- `primary` carries interaction and priority, `accent` is the secondary hue for
  supporting emphasis;
- a whole table, card or page never takes a semantic tone — semantic color belongs
  inside the cell, the alert or the badge that actually carries the meaning.

Light mode is a separately designed soft theme, not an inversion of the dark palette.

---

## 11. Interaction states

One language, applied the same way everywhere:

| State | Expressed by | Never expressed by |
| --- | --- | --- |
| rest | the material at whatever elevation the anatomy calls for | — |
| hover | one tonality step — a state layer over the fill, or a step up the surface ladder | depth, a new border, a size change |
| pressed | a raised control returning to the recessed depth of its own track (`state.recess`), plus a slight compression; a flat control stays flat and presses through the state layer's active step and the same compression | a color swap alone |
| selected | a selected tone; depth comes from anatomy — a segment inside a groove is raised, a row in a list stays flat | depth alone |
| disabled | 45% opacity, no pointer affordance, no interactive state at all | grey-on-grey colouring that breaks theme |
| focus | the shared focus ring | any other indicator |

State layers: replacing `background-color` on hover erases whatever fill a control owns,
so states are composited by a `currentColor`-tinted overlay instead. Opacity carries the
state, so it fades on the shared motion curve rather than snapping.

| Layer | Hover / active opacity | Applies to |
| --- | --- | --- |
| `quiet` | 0.05 / 0.09 | ghost controls, navigation rows, menu options |
| `tonal` | 0.09 / 0.15 | tinted matte controls — tonal buttons, icon buttons, acrylic buttons |
| `filled` | 0.18 / 0.26 | opaque accent fills |
| `track` | 0.18 / 0.26 | a switch track, where hover and press arrive from the wrapping button via `group-*` |
| `activeRow` | `data-active` / `data-highlighted` | a collection row highlighted by keyboard navigation; Base UI collection primitives use `data-highlighted` |

Fields are a single borderless family: a matte `surface-high` fill that steps up once on
hover and once more while engaged, no ring and no lift. `state.field.*` covers hover,
focus, focus-within, engaged and their error counterparts.

Three further `state` entries carry the parts of a state that are not colour, and they are
members of the system rather than local styling:

| Entry | Carries |
| --- | --- |
| `enabled` / `text` | the pointer affordance — `cursor-pointer` for a control with a hit area of its own, `cursor-text` for a text field |
| `rowHover` | the quiet scan feedback for a data row that is read rather than activated (`Table`): an ink tint, not a state layer, because a data row owns no fill to composite over |
| `disabledDescendant` | the cursor-only variant of `disabled`, for a control nested in a composite that has already applied the 45% opacity step |

**Do:** let tonality carry hover; let a raised control recess while it is held; let a
flat or floating control press through the state layer's active step and `state.press`.
**Do not** use opacity for anything except disabled, or add depth to show a state.

### Pressed, precisely

A press is never a single recipe, because a control's anatomy decides what it can do.
The rule is:

- a **raised / tactile** control (tonal `ActionButton`, tonal `IconButton`) returns to the
  recessed depth while it is held, and comes back up on release;
- a **flat** control (filled or text `ActionButton`, ghost `IconButton`, a menu option, a
  table row) does not change depth at all: the press is the state layer's active step
  plus `state.press`;
- a **floating** control keeps its elevation while it is held — an acrylic `IconButton`
  presses through its state layer, never by losing altitude;
- a **groove** is recessed at rest because it is sunk by design, not because it is being
  pressed: a switch track sits at the recessed depth permanently and takes
  `stateLayer.track` with `state.groupPress`, so its hover and press arrive from the
  wrapping button, while a segmented track is recessed for the same static reason and
  takes each segment's own `state.press`, with its unselected segments adding the
  `quiet` state layer, as its press feedback;
- **selection** depth stays anatomy-dependent: the selected segment of a segmented
  control is raised inside its recessed track, while a selected row in a list stays flat.

---

## 12. Motion

Three families, no exceptions. A component picks a family, never a duration.

| Family | Role | Tokens | Should be used for |
| --- | --- | --- | --- |
| `press` | a tonality change with no physical travel, fast and decisive in both directions | `--sui-duration-press`, `--sui-ease-press` | hover, focus, an engaged field |
| `release` | a tactile control: every property a tactile control can animate — colour, shadow, transform, and the size a selection or a thumb travels with | `--sui-duration-release`, `--sui-ease-release`, plus the press pair on `active:` | any control whose transform changes |
| overlay | entrance and exit for anything that floats, plus a matching scrim family (`scrimIn` / `scrimOut`) for the plane behind it | `--sui-duration-overlay`, `--sui-duration-overlay-exit`, `--sui-ease-release`, `--sui-ease-exit` | menus, tooltips, dialogs and their scrims |

`release` takes the press timing while it is held (`active:`), so the press lands
immediately, and the release timing carries the settle, so letting go is expressive.

Rules:

- a control whose transform changes **must** use `release`; `press` is for pure tonality
  and colour transitions that never move or resize anything;
- floating overlays share the Sherick overlay motion family while **Base UI owns their
  presence and lifecycle**. A menu grows from its trigger, a tooltip grows out of the
  anchored edge and a dialog rises from its own center; Sherick consumes Base's state and
  positioning variables rather than maintaining mount/closing state itself;
- there is no Sherick timer tied to `--sui-duration-overlay-exit`: Base UI keeps closing
  primitives present for their CSS exit animation and removes them when the transition is
  complete. `prefers-reduced-motion` still neutralises Sherick's animation classes;
- every family is neutralised under `prefers-reduced-motion`, and `release` additionally
  drops its transform;
- loading feedback (`animate-spin`, `animate-pulse`) sits outside these families: it
  reports progress rather than responding to interaction.

**Do not** write a literal duration, easing or `transition-*` list in a component, or
animate a property no family covers.

---

## 13. Density

Three control steps, plus one accessible hit-target floor. Density owns **height and the
type step**, so controls of one density share a rhythm.

| Step | Min height | Type step | Role |
| --- | --- | --- | --- |
| `compact` | 2.5rem | 0.875rem | dense desktop UI |
| `normal` | 3rem | 0.95rem | the default rhythm |
| `prominent` | 3.5rem | 1.125rem | the largest step, still compact by consumer-app standards |
| `target` | 2.75rem square | inherits | the minimum interactive target for an icon-only control |

Anatomy owns **padding**, not density: a button is gripped at its ends, a field holds
text, and neither is derived from the other — one density can carry two paddings, so
padding is written with the component rather than in these tokens. `ActionButton` is the
worked example: its `sm` / `md` / `lg` sizes are `density.compact` + `px-4 py-2`,
`density.normal` + `px-6 py-3` and `density.prominent` + `px-8 py-4`.

The library targets dense desktop and product UI, so even the prominent step stays
compact. Body copy, headings and labels are content rather than controls and set their
own type.

**Do not** invent a fourth size step, scale a control by transform, or derive a button's
inline padding from a field's.

---

## 14. Accessibility and focus

- One visible focus language everywhere: a 2px ring in `--sui-focus`.
- `focusRing` draws the ring **outside** the shape, for a control that stands alone.
- `focusRingInset` draws it **inside**, for a control nested in another surface where an
  outer ring would collide with the parent's edge.
- `focusRingWithin` draws the outer ring from the composite that owns the focus, for a
  composite control whose inner input stays borderless.
- `groupFocusRing` draws it from the wrapping control instead of the track it contains.
- Fields use the outer ring only. No inner rim is added, so focus reads as one ring,
  never two.
- Where Base UI provides the widget primitive, Base UI owns roles, ARIA relationships,
  generated IDs, keyboard navigation, focus placement/restoration and composite-control
  form participation. Sherick UI owns the visible focus/state treatment layered onto
  that behavior. Do not duplicate Base's semantic machinery locally.
- Focus is visible on keyboard focus (`:focus-visible`), and never removed without a
  replacement indicator.
- Every action is keyboard operable, and keyboard interaction receives an equivalent
  visible focus/state treatment — the same ring and the same tonality a pointer sees.
  `disabled` removes interactivity entirely rather than merely dimming it.
- An icon-only control requires an accessible name: visible text, `aria-label` or
  `aria-labelledby`. **A tooltip is not an accessible name** — it may supplement the name
  for sighted discoverability, but it never replaces it.
- Icon-only controls meet the `target` hit-area floor.
- `prefers-reduced-motion` is respected by every motion family.
- The component runtime is font-agnostic; typography is the consumer's decision.
- Color is never the only carrier of meaning: a semantic state also carries an icon, a
  label or a position.

---

## 15. Theming

Tokens are grouped as one small system in `packages/ui/theme.css`: tonality, lighting, elevation,
material and motion. Theme selection is CSS-only — no attribute follows
`prefers-color-scheme`, while `data-sherick-theme="light"` or `"dark"` force one.

Consumers retune the library by overriding variables, not by forking component styles.
Retinting `--sui-light-top` / `--sui-light-bottom` re-lights every shadow, pressed state
and edge highlight; the acrylic recipes are retuned through their own `--sui-glass-*`
variables instead.

Three compatibility aliases keep resolving for consumers that shipped against 1.0.x:
`--sui-elevation-grounded` (the former name of the flat step), `--sui-shadow-focus` and
`--sui-shadow-primary`. New code uses `--sui-elevation-flat` and the shared focus ring.

---

## 16. Extending the language

The primitives above are the complete set of visual rules in the library. A component
composes them; it does not write a color, shadow, radius, duration, material recipe or
hairline of its own.

If a genuinely new visual rule is required:

1. add it to this document first, with its role and its when-to-use / when-not-to-use
   examples;
2. add it as a named primitive in `packages/ui/src/components/ui.common.ts`, and its tokens to
   `packages/ui/theme.css`;
3. then consume the primitive in the component.

Not every local decision is a visual rule. **Layout, spacing, component-specific
padding, intrinsic dimensions, responsive arrangement and content typography are the
component's own anatomy** — decide them inside the component, exactly as `ActionButton`'s
size paddings are decided. They are not promoted into global primitives, and "could this
be a primitive?" is not a reason to add one. The prohibition covers the visual system
itself: color and tone roles, material recipes, elevation and shadows, semantic shape
roles, structural edges and rims, state treatments, focus treatment, and motion timing,
easing and families.

Extending the language is the intended path. Implementing a rule locally — a one-off
shadow, a literal color, an inline radius, a bespoke transition — is not. A local rule
makes the language non-canonical: the next component cannot reuse the decision, the next
theme cannot retint it, and no verification can catch it.

A new **behavioral** requirement is different: if Base UI provides that behavior, consume
its primitive directly. Do not extend the visual primitive module with focus managers,
portal helpers, controllable-state hooks or accessibility machinery. If Base UI lacks a
required widget behavior, document that gap before introducing local infrastructure.

---

## 17. The showcase

> **The development showcase demonstrates the system; it does not explain it. Design
> rationale belongs in this document.**

The showcase exists for visual comparison, interaction and state testing, theme testing,
component discovery and regression inspection. It shows specimens and their labels; it
does not argue for them. Rules, rationale and explanation belong here.

A foundation card isolates **one primitive at a time**: the depth ladder is shown against a
single neutral fill, so a pairing inside a specimen card is not a recommendation to compose
it, and a specimen may outline a fill that would otherwise be invisible against the card.