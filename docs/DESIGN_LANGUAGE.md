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

**Class names are literal.** The recipes in `ui.common.ts` are strings, and the stylesheet is
compiled by scanning the package source for the class names it should emit: a name that only
exists once a recipe is evaluated — a variant fragment glued to a suffix, `${variant}:before:opacity-[0.09]`
— compiles to no rule at all, and that step of the recipe silently disappears. Compose from whole
class names, and write one out in full wherever a variant prefix would otherwise be assembled by
hand. A recipe that renders a class `styles.css` has no rule for fails the package check.

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

Primitives: `canvas`, `matteQuiet`, `matte`, `matteHigh`, `control`, `controlError`, `handle`,
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
| `handle` | the one matte fill that separates from the surfaces around it in both themes | a small part the user has to find — a value control's handle | anything large: a surface this loud stops being quiet |
| `acrylic` | the anchored sheet, lit from above | an anchored surface with room to breathe: a selection list, a menu, a structured popover | anything grounded in the page |
| `acrylicDense` | the same sheet at higher opacity | the smallest floating surfaces — a tooltip, a floating control | anchored popovers and lists — use `acrylic` |
| `acrylicHero` | the large-overlay recipe | a surface that owns the viewport, such as a dialog | menus, popovers and tooltips |

**Do:** choose the material by what the surface *is*, then let tone alone separate it.
**Do not:** give a material a shadow or a rim, or reach for acrylic because a surface
"feels important". Acrylic is reserved for genuinely floating UI — a grounded card made
of glass is a contradiction.

An anchored sheet carries most of its own tone, because it has to stay legible over
whatever it happens to sit over. A popup is small and its contents are the only thing the
user is looking at, so a saturated control or a bright image behind it must not read as
the popup's own state: the sheet's opacity is the floor that prevents it, and the blur
only softens what is left.

---

## 5. Elevation — how far a surface sits off the page

Primitives: `flat`, `raised`, `floating`, `control`, `recessed`.

Depth is chosen by **anatomy**, never by state.

| Elevation | Role | Should be used for | Should not be used for |
| --- | --- | --- | --- |
| `flat` | at rest on the page | passive matte surfaces; wider surfaces such as cards | a well that is sunk by design — that is `recessed` |
| `raised` | a manipulated control lifted a hair above its own track | tactile tonal controls (tonal `Button`, `IconButton`) | passive surfaces, table rows, menu rows |
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

- `acrylic` — anchored surfaces: a selection list, a menu, a structured popover. Gradient-lit
  and blurred, and carrying most of its own tone, because an anchored sheet sits over whatever
  the page happens to have there — a saturated button behind a popup must not read as the
  popup's own state.
- `acrylicDense` — the smallest floating surfaces (tooltips and floating controls). The same
  sheet at higher opacity still, because a surface this small has no room to stay legible.
- `acrylicHero` — the large overlay sheet (dialogs; reachable through `overlay.dialog`).
  Calmer than the smaller sheets and as opaque as the densest of them: a surface that owns the
  viewport must read first as a physical surface and only secondarily as glass. The scrim
  behind it does the separating, the blur only defocuses, and the gradient is a restrained
  top-to-bottom light rather than a frosted haze. Its tone is a **subtle step above the
  canvas** in every theme — the invariant is enough separation from the canvas while staying
  substantially darker than a grey, foggy sheet. In dark mode that is a step of roughly
  0.03 in OKLCH lightness over the canvas (0.236 over 0.205), not a panel lighter than
  the floating surface level; in light mode it is 0.993 over 0.965. Because the step is
  small the sheet never leans on its shadow, and `--sui-overlay-fill` decides how much of
  it is its own tone rather than the defocused page — which is what a large overlay
  actually leans on, not blur.

How opaque each sheet is comes from a runtime value per theme rather than from a literal in
the recipe — `--sui-glass-fill` for an anchored sheet, `--sui-glass-dense-fill` for the
smallest one, `--sui-overlay-fill` for the overlay that owns the viewport. How much of a
sheet has to be its own tone is a property of the theme (a dark sheet has to hide a bright
page, a light one has to hide a dark page), not of the component that renders it.

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

Primitives: `overlay.scrim`, `overlay.popup`, `overlay.menu`, `overlay.tooltip`, `overlay.dialog`.

An overlay is a **composition**, not a new material. A shell recipe bundles the floating
surface's standard **material + elevation + shape + entrance geometry**, so every floating
surface in the library resolves the same way and stays consistent with the material,
elevation, acrylic and shape rules above. `overlay.scrim` is the one recipe that is not a
shell: it is the plane a viewport-owning surface sits on, and it carries a fill and a blur
rather than a material, a depth or a corner.

| Recipe | Shell | Composes | Entrance geometry |
| --- | --- | --- | --- |
| `overlay.scrim` | the plane behind a surface that owns the viewport | a scrim fill plus a backdrop blur — no material, elevation or shape of its own | selects `motion.scrimIn` / `motion.scrimOut` instead of an entrance transform |
| `overlay.popup` | an anchored surface with room to breathe: a selection list (`Select`, `Combobox`) or structured content (`Popover`) | `shape.surface` + `material.acrylic` + `elevation.floating` | grows from its trigger: origin at the top, a small scale-up and a −4px lift |
| `overlay.menu` | a compact list of commands (`Menu`) | `shape.control` + `material.acrylic` + `elevation.floating` | the same growth as `popup`, so a command list and a listbox arrive identically |
| `overlay.tooltip` | a small anchored hint | `shape.prominent` + `material.acrylicDense` + `elevation.floating` | grows out of the edge it is anchored to, so its geometry is applied with its position |
| `overlay.dialog` | the dialog that owns the viewport | `shape.expressive` + `material.acrylicHero` + `elevation.floating` | rises into place from its own scale, with a larger lift than a popup |
The recipes own only the **visual shell** and the geometry its motion grows from. Base UI
owns popup presence, portals, focus management, pointer/focus suppression while closing,
outside interaction, Escape dismissal and anchored positioning. A Base-backed component
selects `motion.overlayIn` / `motion.overlayOut` (and the matching scrim family) from the
primitive's open/closing state; Sherick UI does not maintain a second overlay lifecycle.

Rules:

- **a new menu, tooltip or dialog consumes one of these recipes** rather than
  reconstructing floating-surface classes by hand: pick `overlay.popup` for an anchored surface
  with room to breathe, `overlay.menu` for a compact list of commands, `overlay.tooltip` for a
  hint, and `overlay.dialog` plus `overlay.scrim` for a surface that owns the viewport — and let
  the recipe own the material, the elevation, the shape and the entrance geometry;
- a shell that needs a different combination is a **new recipe** — add it to this
  document and to `overlay` in `packages/ui/src/components/ui.common.ts` before anything uses it;
- behavior remains the Base primitive's responsibility; do not add Sherick-specific
  portal, focus-trap, dismissal, positioning or presence infrastructure around it.

### Stacking

Every floating surface shares one stacking level (`stacking.float`), and **document order decides**
between them. That is not a shortcut, it is the rule Base UI's portals already implement: a popup's
portal is nested *inside* the portal of the surface it was opened from and appended last, so the
innermost — the one opened last — is later in the document and paints on top.

A scale that ranks surfaces by kind, with dialogs above tooltips above popups, cannot be right:
a popup opened from inside a dialog is the innermost surface there is, and a ranking draws the
dialog over it and hides the popup behind the modal that owns it. Sharing one level keeps that
nesting authoritative at any depth, and it also orders the two cases a ranking gets wrong in the
other direction — a dialog opening over a popup, and a popup opening over a tooltip — because
each one is opened after the surface it covers.

The level exists to clear the application's own content, not to rank Sherick's surfaces against
each other.

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
| `mark` | 0.625rem | a compact square selection mark — the `Checkbox` box | anything the size of a field, which wants `control`; a full-width row, which wants `row`; a round mark, which is `circle` |
| `row` | 0.875rem | a row at command density — a row in a list that is scanned rather than read | anything the size of a field or larger, which wants `control` and up; a compact square, which wants `mark` |
| `prominent` | 1.5rem | prominent controls, compact floating surfaces | small inline controls |
| `surface` | 1.75rem | large surfaces — cards, menus, panels | buttons |
| `expressive` | 2rem | an expressive surface that owns the viewport — the large overlay sheet, tightened so it reads as a focused surface rather than a pillowy one | anything smaller than a dialog |
| `pill` | full | fully rounded controls whose width follows their content, and the fully rounded form of a compact part at either ratio — a value control's capsule handle | a wide button with a fixed width |
| `circle` | full | fully rounded square targets | non-square targets |

**Do:** hold one role across a whole component family, so a switch and a segmented
control read as the same object at two scales.
**Do not** substitute a numeric radius, or mix two adjacent steps inside one surface.

A role is chosen by the object's own extent, not by how important it feels. `control`'s
radius is right for anything the size of a field; on a 24px square or a 36px command row
it reaches the object's half-extent and the object stops being a rounded rectangle at all
and becomes a capsule. That is why a compact object takes a tighter step than `control`:
`mark` for a square that has to stay a square, `row` for a full-width row whose corner has
to stay proportional to its own height. A control-sized row keeps `control` at both ends.

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

Compression is a **distance, not a ratio**: a press travels about a pixel at the size of the ink it
moves, and that one rule produces the two steps.

| Step | Moves | For |
| --- | --- | --- |
| `press` / `groupPress` | 2% | a control whose outline is what the user sees — a button, a track, a selection mark |
| `pressCompact` | 10% | a control whose ink is much smaller than the target it is aimed at — an icon inside a `density.target` stepper, where 2% would never register |

Both are **centred zooms**: the part changes size in place, and a press never translates it.

**A selection mark's boundary does not move.** A checkbox box or a radio circle takes the plain 2%
step, not the compact one: ten percent of its own outline is a 2.4px change, and the eye reads that
as the control jumping rather than as pressure. Expression belongs to the contents of that boundary
— the mark arriving on the spring — while the press is carried by the state layer. This is the same
division the slider does not follow, because there the handle moving *is* the interaction.

State layers: replacing `background-color` on hover erases whatever fill a control owns,
so states are composited by a `currentColor`-tinted overlay instead. Opacity carries the
state, so it fades on the shared motion curve rather than snapping.

| Layer | Hover / active opacity | Applies to |
| --- | --- | --- |
| `quiet` | 0.05 / 0.09 | ghost controls, navigation rows, and every collection row. Hover is gated on the primitive's own disabled marker as well as the native attribute, so a row disabled by a list is a row that does not tint |
| `tonal` | 0.09 / 0.15 | tinted matte controls — tonal buttons, icon buttons, acrylic buttons |
| `filled` | 0.18 / 0.26 | opaque accent fills |
| `track` | 0.18 / 0.26 | a switch track, where hover and press arrive from the wrapping button via `group-*` |
| `activeRow` | `data-active` / `data-highlighted` | a collection row highlighted by keyboard or pointer navigation; Base UI collection primitives use `data-highlighted`. It pairs with `quiet` on the same row, so highlight and hover are the same tone at the same strength |

Fields are a single borderless family: a matte `surface-high` fill that steps up once on
hover and once more while engaged, no ring and no lift. `state.field.*` covers hover,
focus, focus-within, engaged and their error counterparts. A control that reads its
validity from the field it sits in rather than from a prop takes the same error ladder
through `state.field.invalid*`, which is one tonality keyed on the field's own
`data-invalid` attribute and deliberately outranks the prop-keyed step it overlaps.

**Selection is a recessed surface that fills.** A switch track, a checkbox box, a radio
circle and a slider groove are one object at four sizes: `selectable.surface` gives them
the recessed depth of a groove and the tactile motion family, `selectable.rest` is the
neutral matte step they hold until they are selected, and `selectable.selected` /
`selectable.indeterminate` are the accent they take once they are — keyed on the
primitive's own selection attribute, so an uncontrolled control is styled from the same
source of truth as a controlled one. Selection never changes their depth: tone carries it,
exactly as it carries hover. Each of them states hover and press through the wrapping
control's state layer, because whether those layers apply while the control is disabled is
decided where the disabled state is known.

The mark inside that surface — a tick, a dash, a dot — exists **only while the control is
selected**, and it arrives under `motion.spring` from the middle of the surface rather
than appearing, so a made selection lands.

A value control's handle follows the same economy: the accent belongs to the **range**, so
the handle sits on it as the `handle` matte fill and takes the accent itself only while the
pointer is on it (`state.engaged`). The range also **reserves the handle's own half-width plus
a hair of air on its end**, so the fill stops short of the handle and the surface shows
through between them: a handle butted against the end of its own range reads as one
continuous shape, and the gap is what makes it a handle. The reservation is geometry — a
transparent logical end border with a padding-box clip — not a drawn edge, and it leaves the
range's end square where the gap is, the way a cut rail ends. A handle filled with the same
accent as the range it terminates is why the two are separated by tone rather than by a drawn
edge. It is also why the handle is the one matte part that is *not* a surface step: every
surface in a theme sits within a few percent of its neighbours, so a handle drawn from that
ladder is only about 1.2:1 against its own groove — findable when the slider is fresh and lost
as soon as the control is dimmed. The `handle` fill (5.7–7.7:1 enabled, 1.9–2.7:1 at 45%
disabled, against a surface step's 1.2:1) is what keeps it legible when the slider is disabled,
where a stronger accent would be the wrong answer.

Six further `state` entries carry the parts of a state that are not colour, and they are
members of the system rather than local styling:

| Entry | Carries |
| --- | --- |
| `enabled` / `text` | the pointer affordance — `cursor-pointer` for a control with a hit area of its own, `cursor-text` for a text field |
| `rowHover` | the quiet scan feedback for a data row that is read rather than activated (`Table`): an ink tint, not a state layer, because a data row owns no fill to composite over |
| `disabled` / `disabledDescendant` | the disabled step, and its cursor-only variant for a control nested in a composite that has already applied the 45% opacity |
| `disabledAttribute` | the same disabled step keyed on the native attribute, for a control that decides its own disabled state — a number field's stepper at its bound |
| `engaged` | a part the pointer is on sits matte and settles back from it: a value control's handle takes its accent and a little size while hovered or dragged, so the accent marks the range and the pointer marks the handle |
| `steppedValue` | a part that is not being pressed but answers the control that is — the value a stepper drives, which leans into the press and settles back |

**Do:** let tonality carry hover; let a raised control recess while it is held; let a
flat or floating control press through the state layer's active step and `state.press`.
**Do not** use opacity for anything except disabled, or add depth to show a state.

### Collection rows

A **collection row** is one line in a list the user scans — a `Select` option, a `Combobox`
option, a `Menu` command. It is its own small system inside the one above, because the same
object appears at two densities and has to behave identically at both:

| Entry | Carries |
| --- | --- |
| `list.option` | a row in a selection list: full width, one line, chosen rather than performed |
| `list.command` | the same row at the density a list of short actions wants — a command is scanned, not read |
| `list.sheet` | the sheet a list of rows sits in: it never exceeds what the viewport leaves it, and scrolls inside itself rather than growing. The width is the list's own decision — a control's list matches the control it came from, a command list is as wide as its commands and no narrower than a short list of actions needs |

The two rows differ only in **density and the corner their own extent allows** — an option row
is a field-sized object and takes `control`, a command row is an object smaller than a field and
takes `row` — and in what they are *for*: an option holds a value, a command performs an action.
Everything else is shared, and that sharing is the point:

- **hover and keyboard highlight are one tone at one strength.** A row composes `quiet` and
  `activeRow` together, so a row under the pointer and a row under the arrow keys read as the
  same thing happening;
- **selection is a tint of the sheet** (`tone.selected`), never the opaque accent. The one
  primary fill in a view belongs to the primary action, not to a row that happens to be chosen;
- **a destructive command wears its tone on its own label**, and its hover and highlight are
  then a restrained tint of that same tone. A menu never paints a whole row — or its sheet —
  in danger to announce that one item in it destroys something;
- **a row that cannot be used composes none of it.** The list's own `data-disabled` marker
  gates the hover step, so a disabled row carries no interactive state at all and the muted
  tone is the only thing saying so.

A row is **flat**: depth never announces hover, highlight or selection, because the row sits in
a list rather than on the page.

### Pressed, precisely

A press is never a single recipe, because a control's anatomy decides what it can do.
The rule is:

- a **raised / tactile** control (tonal `Button`, tonal `IconButton`) returns to the
  recessed depth while it is held, and comes back up on release;
- a **flat** control (filled or text `Button`, ghost `IconButton`, a menu option, a
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

Five families, no exceptions. A component picks a family, never a duration.

| Family | Role | Tokens | Should be used for |
| --- | --- | --- | --- |
| `press` | a tonality change with no physical travel, fast and decisive in both directions | `--sui-duration-press`, `--sui-ease-press` | hover, focus, an engaged field |
| `release` | a tactile control: every property a tactile control can animate — colour, shadow, transform, and the size a selection or a thumb travels with | `--sui-duration-release`, `--sui-ease-release`, plus the press pair on `active:` | any control whose transform changes |
| `spring` | the one family that overshoots: the part travels a little past where it lands and settles back | `--sui-duration-release`, `--sui-ease-spring`, plus the press pair on `active:` / `group-active:` | a selection mark arriving, the surface it is made in, the value a stepper drives |
| `travel` | geometry the user is aiming — a slider's thumb and the fill it carries | `--sui-duration-release`, `--sui-ease-release`, plus the press pair on `active:` | a value control's moving parts |
| overlay | entrance and exit for anything that floats, plus a matching scrim family (`scrimIn` / `scrimOut`) for the plane behind it | `--sui-duration-overlay`, `--sui-duration-overlay-exit`, `--sui-ease-release`, `--sui-ease-exit` | menus, tooltips, dialogs and their scrims |

`release` and `spring` take the press timing while they are held (`active:`, or
`group-active:` when the press arrives from the wrapping control), so the press lands
immediately, and the release timing carries the settle, so letting go is expressive.
`travel` suspends its own position property while the control is dragged: the pointer
already carries that position, and interpolating it would make the fill and the handle
disagree with the finger.

`--sui-ease-spring` is the **only** overshooting curve in the system, and it is reserved
for the parts that say something by arriving: a tick that lands, a value that leans into
the press that changed it, a surface that rebounds. A part that is merely relocating —
a slider handle under a keyboard step, a travelling fill — settles without overshoot,
because a value that passes its own value and comes back reads as a defect.

Rules:

- a control whose transform changes **must** use `release`, `spring` or `travel`; `press`
  is for pure tonality and colour transitions that never move or resize anything;
- floating overlays share the Sherick overlay motion family while **Base UI owns their
  presence and lifecycle**. A menu grows from its trigger, a tooltip grows out of the
  anchored edge and a dialog rises from its own center; Sherick consumes Base's state and
  positioning variables rather than maintaining mount/closing state itself;
- there is no Sherick timer tied to `--sui-duration-overlay-exit`: Base UI keeps closing
  primitives present for their CSS exit animation and removes them when the transition is
  complete. `prefers-reduced-motion` still neutralises Sherick's animation classes;
- every family is neutralised under `prefers-reduced-motion`, and `release`, `spring` and
  `travel` additionally drop their transform;
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
padding is written with the component rather than in these tokens. `Button` is the
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
- A control whose **visible mark is smaller than the target** — a checkbox box, a radio
  circle — keeps that mark as its layout footprint and expands its hit area *outside* that
  footprint with `hitArea`, a transparent pseudo-element extension. Layout, alignment and
  the gap between a control and its copy are therefore measured from the control the user
  can see, while the pointer still answers over the full target. The expansion is capped at
  the `target` floor, but CSS cannot see neighbouring geometry: hit areas keep clearance only
  while the rows around them are at least as tall as that floor, which the library's own
  `density.normal` rhythm is and a 40px table row is not. A control that owns a labelled row —
  a radio option — needs no extension at all, because the row itself is the label.
- `prefers-reduced-motion` is respected by every motion family.
- The component runtime is font-agnostic; typography is the consumer's decision.
- Color is never the only carrier of meaning: a semantic state also carries an icon, a
  label or a position.

### Known contrast gap (pre-release)

The authored default palette does **not** meet WCAG AA text contrast, and this is a known,
measured, deliberately recorded limitation rather than an oversight in a component. It is
not fixed by the palette, because closing it means changing the brand accent and collapsing
the three-step text ladder defined in §10 — a visual-language decision, tracked separately
from component work.

Measured with axe-core 4.13 against the rendered fixtures (the automated gate excludes only
`color-contrast`; see `docs/VERIFICATION.md`):

| Pair | Light | Dark |
| --- | --- | --- |
| `tone.text.primary` on `tone.tonal.primary` (`primary` / 0.12) | 3.82–4.51 | 4.53–5.94 |
| `tone.text.primary` on `tone.selected.primary` (`primary` / 0.22) | 3.69–3.88 | 4.36–4.87 |
| `text.low` on the page canvas | 3.16 | 4.54 |
| `text.low` on `surface-high` | 2.80 | 3.52 |

Consequences that follow from this gap, and the rules they impose:

- **`tone.text.primary` is not an AA foreground on a primary tint.** A primary tonal control
  or primary soft surface carries its label at roughly 3.8–4.4:1. Treat these as decorative
  emphasis, not as the only way a user learns something they must act on.
- **`text.low` is furniture, not copy.** §10 already restricts it to gutters, hints and token
  names; because it measures 2.8–3.2:1 in light mode it must never carry information a user
  needs in order to act, and it must not be the only place a value, label or error appears.
- **Anything that must be readable uses `text.high` or `text.medium`**, both of which clear
  AA on every authored surface in both themes.
- A consumer that needs AA throughout can already retune `--sui-primary` and `--sui-ink-faint`
  at the document root; that is an ordinary supported theme override, not a fork.

Do not "fix" a failing contrast measurement inside a component by darkening that component's
label: the roles above are the shared primitives, and a local color is exactly the kind of
rule §16 forbids inventing locally.

---

## 15. Theming

Tokens are grouped as one small system in `packages/ui/src/styles/tokens.ts`: tonality,
lighting, elevation, material and motion. Theme selection is CSS-only — no attribute follows
`prefers-color-scheme`, while `data-sherick-theme="light"` or `"dark"` force one.

Consumers retune the library by overriding variables, not by forking component styles.
Retinting `--sui-light-top` / `--sui-light-bottom` re-lights every shadow, pressed state
and edge highlight; the acrylic recipes are retuned through their own `--sui-glass-*`
variables instead.

---

## 16. Extending the language

The primitives above are the complete set of visual rules in the library. A component
composes them; it does not write a color, shadow, radius, duration, material recipe or
hairline of its own.

If a genuinely new visual rule is required:

1. add it to this document first, with its role and its when-to-use / when-not-to-use
   examples;
2. add it as a named primitive in `packages/ui/src/components/ui.common.ts`, and its tokens to
   `packages/ui/src/styles/tokens.ts`;
3. then consume the primitive in the component.

Not every local decision is a visual rule. **Layout, spacing, component-specific
padding, intrinsic dimensions, responsive arrangement and content typography are the
component's own anatomy** — decide them inside the component, exactly as `Button`'s
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