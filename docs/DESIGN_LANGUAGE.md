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
surface's standard **material + elevation + shape**, so every floating surface in the library
resolves the same way and stays consistent with the material, elevation, acrylic and shape
rules above. `overlay.scrim` is the one recipe that is not a shell: it is the plane a
viewport-owning surface sits on, and it carries a fill and a blur rather than a material, a
depth or a corner.

| Recipe | Shell | Composes |
| --- | --- | --- |
| `overlay.scrim` | the plane behind a surface that owns the viewport | a scrim fill plus a backdrop blur — no material, elevation or shape of its own |
| `overlay.popup` | an anchored surface with room to breathe: a selection list (`Select`, `Combobox`) or structured content (`Popover`) | `shape.surface` + `material.acrylic` + `elevation.floating` |
| `overlay.menu` | a compact list of commands (`Menu`) | `shape.control` + `material.acrylic` + `elevation.floating` |
| `overlay.tooltip` | a small anchored hint | `shape.prominent` + `material.acrylicDense` + `elevation.floating` |
| `overlay.dialog` | the dialog that owns the viewport | `shape.expressive` + `material.acrylicHero` + `elevation.floating` |

The recipes own only the **visual shell**. Base UI owns popup presence, portals, focus
management, pointer/focus suppression while closing, outside interaction, Escape dismissal
and anchored positioning; the presence recipe in `ui.motion.ts` owns how the surface enters
and leaves. A Base-backed component composes a shell and a presence recipe and nothing else:
Sherick UI does not maintain a second overlay lifecycle, and the shell never depends on the
primitive's open state.

Rules:

- **a new menu, tooltip or dialog consumes one of these recipes** rather than
  reconstructing floating-surface classes by hand: pick `overlay.popup` for an anchored surface
  with room to breathe, `overlay.menu` for a compact list of commands, `overlay.tooltip` for a
  hint, and `overlay.dialog` plus `overlay.scrim` for a surface that owns the viewport — and let
  the recipe own the material, the elevation and the shape, with the matching presence recipe
  in §12 owning how it enters and leaves;
- a shell that needs a different combination is a **new recipe** — add it to this
  document and to `overlay` in `packages/ui/src/components/ui.common.ts` before anything uses it;
- behavior remains the Base primitive's responsibility; do not add Sherick-specific
  portal, focus-trap, dismissal, positioning or presence infrastructure around it.

### The entrance follows the placement

An anchored surface does **not** assume it is below its trigger. The presence recipe reads both
halves of its entrance geometry from the primitive at the moment it is placed:

- the **origin** is `--transform-origin`, which Base publishes on the positioner: the anchor
  edge, resolved after collision handling. A surface above its trigger therefore grows out of
  its own *bottom* edge, and one beside it grows out of its side;
- the **travel** is 4px *into* that edge, selected from the popup's own `data-side`: down into
  place from above, up into place from below, sideways when it is anchored to a side.
  `motionPresenceModal` is anchored to the viewport rather than to a control, so it has no side
  and rises from a small lift of its own.

**Do:** expose a `side` and let the recipe place the entrance — every anchored surface in the
library shares one policy, including a popup Base flips above its trigger to keep it on screen.
**Do not** write `origin-top` or a fixed lift into a component, and do not add per-component
motion for an anchored surface: a surface that animates as if it were below its trigger when it
is not is a surface that looks like it moved the wrong way.

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
| `strongChecked` | the same fills, keyed on the control's own selection marker | a control that holds its selection in the primitive — a `Switch` | a control whose selection the application owns as a prop |

A fill step is composited over whatever sits beneath it, so one tone reads correctly on
the canvas, inside a card and on an acrylic sheet.

`strongChecked` exists because a fill that follows selection has to be written out literally to be
compiled, and because an uncontrolled control has no prop to read: a `Switch` that is not told
whether it is on still has to take its fill from the same source of truth as one that is, so the
checked fill is a role keyed on the marker rather than a conditional at the call site.

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
| pressed | a raised control returning to the recessed depth of its own track (`state.recess`), plus the tactile compression the motion system owns; a flat control stays flat and presses through the state layer's active step and the same compression | a color swap alone |
| selected | a selected tone; depth comes from anatomy — a segment inside a groove is raised, a row in a list stays flat | depth alone |
| disabled | 45% opacity, no pointer affordance, no interactive state at all | grey-on-grey colouring that breaks theme |
| focus | the shared focus ring | any other indicator |

How far a press travels is **motion amplitude**, not a state this table owns: it belongs with
the tactile intent in §12, because a press travels about two pixels at the size of the ink it moves
and every control has to agree on that distance.

**A selection mark's boundary does not move.** Expression belongs to the contents of that boundary
— the mark arriving on a spring — while the press itself is carried by the state layer and a
compression small enough not to read as the control jumping. This is the same division the slider
does not follow, because there the handle moving *is* the interaction.

State layers: replacing `background-color` on hover erases whatever fill a control owns,
so states are composited by a `currentColor`-tinted overlay instead. Opacity carries the
state, so it fades on the feedback recipe rather than snapping.

| Layer | Hover / active opacity | Applies to |
| --- | --- | --- |
| `quiet` | 0.05 / 0.09 | ghost controls, navigation rows, and every collection row. Both interactive steps are gated on the primitive's own disabled marker as well as the native attribute, so a row disabled by a list neither tints under the pointer nor presses |
| `tonal` | 0.09 / 0.15 | tinted matte controls — tonal buttons, icon buttons, acrylic buttons |
| `filled` | 0.18 / 0.26 | opaque accent fills |
| `track` | 0.18 / 0.26 | a switch track, where hover and press arrive from the wrapping button via `group-*` |
| `activeRow` | 0.05 | a collection row highlighted by keyboard or pointer navigation, from Base UI's `data-highlighted`. It pairs with `quiet` on the same row, so highlight and hover are the same tone at the same strength — asserted on the rendered layer in the browser suite. It is deliberately *not* gated on the disabled marker: a disabled row stays navigable and has to show where the navigation is |

Fields are a single borderless family: a matte `surface-high` fill that steps up once on
:hover and once more while engaged, no ring and no lift. `state.field.*` covers hover,
focus, focus-within, engaged and their error counterparts. A control that reads its
validity from the field it sits in rather than from a prop takes the same error ladder
through `state.field.invalid*`, which is one tonality keyed on the field's own
`data-invalid` attribute and deliberately outranks the prop-keyed step it overlaps.
The tone is the whole of a plain text field's response, and a field that opens a list — a
`Select` trigger, an editable `Combobox` field — adds the tactile press in §12 to it, because it
is a control the user presses as well as a place text goes. Both forms press identically: the
field is what compresses.

**Selection is a recessed surface that fills.** A switch track, a checkbox box, a radio
circle and a slider groove are one object at four sizes: `selectable.surface` gives them
the recessed depth of a groove and a non-spatial tone response, `selectable.rest` is the
neutral matte step they hold until they are selected, and `selectable.selected` /
`selectable.indeterminate` are the accent they take once they are — keyed on the
primitive's own selection attribute, so an uncontrolled control is styled from the same
source of truth as a controlled one. Selection never changes their depth: tone carries it,
exactly as it carries hover. Each of them states hover and press through the wrapping
control's state layer, because whether those layers apply while the control is disabled is
decided where the disabled state is known.

The mark inside that surface — a tick, a dash, a dot — exists **only while the control is
selected**, and it arrives under `motionArrive` from the middle of the surface rather than
appearing, so a made selection lands.

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
| `engaged` | a part the pointer is on sits matte and settles back from it: a value control's handle takes its accent and a little size while hovered or dragged, so the accent marks the range and the pointer marks the handle. It is target geometry, not timing: `motionDirect` owns how it transitions, and while the pointer owns the position the handle's own travel is not interpolated at all |

**Do:** let tonality carry hover; let a raised control recess while it is held; let a
flat or floating control press through the state layer's active step and the tactile compression.
**Do not** use opacity for anything except disabled, or add depth to show a state.

### Collection rows

A **collection row** is one line in a list the user scans — a `Select` option, a `Combobox`
option, a `Menu` command. It is its own small system inside the one above, because the same
object appears at two densities and has to behave identically at both:

| Entry | Carries |
| --- | --- |
| `list.option` | a row in a selection list: full width, one line, chosen rather than performed |
| `list.command` | the same row at the density a list of short actions wants — a command is scanned, not read |
| `list.sheet` | the sheet a list of rows sits in: it never exceeds what the viewport leaves it, and scrolls inside itself rather than growing. The width is the list's own decision — a control's list is never narrower than the control it came from and grows to fit its own content until the viewport clamp, and a command list only ever grows to its commands and no narrower than a short list of actions needs |

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
- **a row that cannot be used takes no hover and no press.** The primitive's own `data-disabled`
  marker gates both interactive steps — a row is a `div`, so `:active` matches it while the
  pointer is down on it and `:disabled` never does — and the muted tone is the rest of what says
  so. It **keeps the navigation highlight**: a disabled option or command stays reachable by
  keyboard so it can be discovered and announced as unavailable, and a reader still has to see
  which row the navigation is on when it arrives there. Disabled means "cannot be chosen or
  performed", never "cannot be found", so `activeRow` is deliberately *not* gated on the marker.

A row is **flat**: depth never announces hover, highlight or selection, because the row sits in
a list rather than on the page.

### Pressed, precisely

A press is never a single recipe, because a control's anatomy decides what it can do.
The rule is:

- a **raised / tactile** control (tonal `Button`, tonal `IconButton`) returns to the
  recessed depth while it is held, and comes back up on release;
- a **flat** control (filled or text `Button`, ghost `IconButton`, a menu option, a
  table row) does not change depth at all: the press is the state layer's active step
  plus the tactile compression;
- a **floating** control keeps its elevation while it is held — an acrylic `IconButton`
  presses through its state layer, never by losing altitude;
- a **groove** is recessed at rest because it is sunk by design, not because it is being
  pressed: a switch track sits at the recessed depth permanently and takes
  `stateLayer.track`, so its hover and press arrive from the wrapping button, while a
  segmented track is recessed for the same static reason and takes each segment's own
  tactile compression as its press feedback. A track answers a press with tone only: the thumb
  moving is the physical event, and a track that also shrank would compete with it;
- **selection** depth stays anatomy-dependent: the selected segment of a segmented
  control is raised inside its recessed track, while a selected row in a list stays flat.

---

## 12. Motion

Motion is chosen by **what a part is doing**, never by which component it belongs to. The
library has nine intents, and one module owns the timing behind all of them
(`packages/ui/src/components/ui.motion.ts`).

| Intent | What it is | Recipe | Used for |
| --- | --- | --- | --- |
| `feedback` | a non-spatial state response | `motionFeedback` | hover, focus, a field's tone, a row's highlight, a filled surface |
| `tactile` | a temporary physical answer to activation | `motionTactile`, `motionTactileCompact` | a button, an icon button, a stepper, a navigation row, a field that opens a list |
| `arrive` | a meaningful subordinate part appears or leaves | `motionArrive` | a checkbox tick, a radio dot, the selected mark in a `Select` or `Combobox` |
| `orient` | a persistent affordance changes orientation in place | `motionOrient` | the disclosure chevron of a `Select` or `Combobox` |
| `relocate` | a persistent object travels between stable destinations | `motionRelocate` | a tab indicator, a switch thumb |
| `direct` | the pointer owns the geometry | `motionDirect` | a slider's handle and the fill it carries |
| `disclose` | in-flow content expands and collapses | — reserved | nothing yet: it lands with the first disclosure primitive |
| `presence` | an independent surface enters or leaves | `motionPresenceAnchored`, `motionPresenceTooltip`, `motionPresenceModal`, `motionPresenceScrim` | every popup, tooltip and dialog, and the plane behind a viewport-owning surface |
| `activity` | continuous movement that reports work | `motionActivitySpin`, `motionActivityPulse` | a spinner, a skeleton |

**Dynamics live below the intents.** There are six, and a component never chooses one:
`swift` (immediate response: `--sui-duration-press`, `--sui-ease-press`), `settle` (strong
deceleration into a destination: `--sui-duration-release`, `--sui-ease-release`), `glide` (a
persistent object crossing the distance between two stable destinations: `--sui-ease-glide` with
the settle duration), `spring` (the one restrained overshoot: `--sui-ease-spring`), `exit`
(decisive acceleration away: `--sui-duration-overlay-exit`, `--sui-ease-exit`) and `continuous`
(a repeating loop). The intent picks the dynamic; the tokens in `src/styles/tokens.ts` are its
only authored values, and they are also the whole of the workbench speed control in the motion
lab.

`settle` is an **arrival** curve: it spends 90% of a travel in the first third of its time, which
is exactly right for a control letting go of a press and exactly wrong for an object that has to
cross a distance. A tab indicator that moved on it would teleport and then creep, so `relocate`
takes `glide` instead — it leaves the old position gently, crosses the middle of the travel in the
middle of the time, and settles at the end, so the travel itself is what the eye sees.

### Amplitude is part of the motion system

How far something moves is the same kind of decision as how fast it moves, and it is owned in the
same place. A component says *what participates*; the motion recipe says *how far, how fast and how
it settles*.

| Recipe | Amplitude | For |
| --- | --- | --- |
| `motionTactile` | 4% compression | a control whose outline is what the user sees, including a field that opens a list |
| `motionTactileCompact` | 12% compression | a control whose visible ink is much smaller than the target it is aimed at — a stepper, a dismiss control, a close control |
| `motionPresenceAnchored` / `…Tooltip` | from 94% scale, 4px toward the anchor | any anchored surface |
| `motionPresenceModal` | from 96% scale, 12px rise | a surface that owns the viewport |
| `motionArrive` | from 50% scale | a selection mark |

Every one of these is a **centred zoom** or a directional grow: a press changes size in place and
never translates, and an anchored surface grows about the edge the primitive resolved for it.

A press travels about two pixels at the size of the ink it moves, and the compact step exists
because a 20px glyph inside a 44px target would never register two pixels of its own movement —
not because a smaller control deserves a livelier animation.

**A field that opens a list is a control, and presses like one.** A `Select`'s trigger and an
editable `Combobox`'s field are the same control in two forms, so they take `motionTactile` as a
whole: the *field* compresses, not the small affordances inside it, because the field is what the
user is aiming at and a second compression nested inside the first would read as two events. A
press activates the whole chain, which is what lets the field be the element that carries the
answer — and typing, focus, hover and text selection never activate it, so a field stays perfectly
still while it is used as a text field. A plain `Input` or `Textarea` is not a control you press to
open anything, so it stays feedback-only.

**Spring is not a general family.** It is reserved for an event that has to be acknowledged —
a mark that is *made*. A tab indicator, a slider handle, a switch thumb and a dialog never
overshoot: relocation and large surfaces settle, and a value that passes its own destination
and comes back reads as a defect.

### One spatial owner per node

A node carries **one** spatial intent, and may carry non-spatial feedback beside it. Two
spatial recipes never compose: a popup does not bounce while its trigger springs, and a
selected row does not scale while the list around it relocates.

Opening a `Select` is therefore one dominant motion and one supporting motion, not four:

- dominant: the popup's presence;
- supporting: the chevron's orientation;
- non-spatial: the trigger's tone.

A press works the same way: when a control inside a composite field is pressed, the pressed
control is the manipulated object and the field only echoes it — the control takes the compact
compression because its ink is small, and the field takes the compression of the control it is,
which is what makes a searchable field and a select trigger feel like two variants of one thing.

There is no staggering, no per-row entrance, no label choreography and no generic layout
animation: filtering a `Combobox` replaces the list immediately, tab panels switch
immediately, and a surface whose content changes height changes height.

**Stable boundaries stay stable.** A checkbox box, a radio circle and a switch track are the
control's identity, so their geometry never scales, translates or springs. The press is
carried by the state layer, and the expression happens *inside* the boundary, where the mark
arrives.

**Direct manipulation has zero latency.** While a pointer owns a geometry, that property is
removed from the transition list entirely, so a slider's handle cannot lag behind the finger.
A keyboard or programmatic step is not direct, so it settles.

### Presence is Base's lifecycle

An independent surface describes three states — settled, `data-starting-style` and
`data-ending-style` — and lets the primitive decide when the node mounts and unmounts. Sherick
keeps no timer, mirrors no `open` state and does no animation-completion bookkeeping. Base UI's
positioner owns placement and its popup owns presence, so collision flipping and repositioning
never replay an entrance, and an initially-open surface rendered by the server never animates
in after hydration.

The entrance is authored as a **transition** rather than a keyframe, and that is what makes
interruption work: open → close → open retargets from the value that is currently painted
instead of restarting from a keyframe's `from`. For the same reason no component writes an
exit timer; Base keeps the node mounted until the transition it started has finished.

Anchored surfaces read their direction from what the primitive resolved — `--transform-origin`
for the edge and `data-side` for which edge that is — so one recipe serves a `Select`, a
`Combobox`, a `Menu`, a `Popover` and a `Tooltip`, and a popup flipped by collision enters the
way it is actually placed. A tooltip is the same model on the local settle timing; a modal
surface is anchored to the viewport, has no side and never bounces; a scrim animates opacity
only, because a blur or a filter is never animated.

The entrance takes the **glide** curve rather than the arrival curve, and that is what makes the
grow visible at all. Opacity and scale run on the same curve: on a front-loaded one they both jump
in the first frames, so the surface is already half grown by the time it is visible — a pop. On the
glide curve the surface is seen while it is still small, so the eye reads it opening out of its
anchor, and the four pixels of travel only support what the scale is doing.

### Reduced motion

Reduced motion removes interpolation and travel, not state:

| Intent | Under `prefers-reduced-motion: reduce` |
| --- | --- |
| `feedback` | the response still arrives, instantly |
| `tactile` | no compression and no travel; the tone and depth response stays |
| `arrive` | the mark lands in one step |
| `orient` | the target orientation applies immediately |
| `relocate` | the destination applies immediately |
| `direct` | unchanged — the pointer already owns the geometry |
| `presence` | opacity only, on the same timing, and an exit never lingers |
| `activity` | a static status glyph |
| `disclose` | immediate layout state, when it exists |

**Do not** write a literal duration, easing, `transition-*` list or animation in a component,
and do not treat reduced motion as "no visual state at all".

---

## 13. Density

Three control steps, plus one accessible hit-target floor. Density owns **height and the
type step**, so controls of one density share a rhythm.

| Step | Min height | Type step | Role |
| --- | --- | --- | --- |
| `compact` | 2.5rem | 0.875rem | dense desktop UI |
| `normal` | 3rem | 0.95rem | the default rhythm |
| `prominent` | 3.5rem | 1.125rem | the largest step, still compact by consumer-app standards |
| `target` | 2.75rem square | inherits | the minimum interactive target for an icon-only control that stands on its own |
| `part` | 2.75rem tall, 2.25rem wide | inherits | one control **inside** a composite field — the trailing controls a `Combobox` owns |

Anatomy owns **padding**, not density: a button is gripped at its ends, a field holds
text, and neither is derived from the other — one density can carry two paddings, so
padding is written with the component rather than in these tokens. `Button` is the
worked example: its `sm` / `md` / `lg` sizes are `density.compact` + `px-4 py-2`,
`density.normal` + `px-6 py-3` and `density.prominent` + `px-8 py-4`.

**`part` is the one step below the floor, and it is not a loose target.** A composite field
is the target: the pointer is already in it, and the two controls at its trailing edge are
gripped as one cluster rather than as two buttons beside a field — at the full width each one
reads as a separate control. So a part keeps the floor's *height*, because it has to sit in
the field's row, and takes only the width its own glyph needs. It still clears the 24px
pointer-target minimum WCAG AA asks for.

The library targets dense desktop and product UI, so even the prominent step stays
compact. Body copy, headings and labels are content rather than controls and set their
own type.

**Do:** use `target` for a control that is the whole target of its own action, and `part`
only for a control that is one part of a composite field.
**Do not** invent a fourth size step, scale a control by transform, derive a button's
inline padding from a field's, or reach for `part` to make a standalone control denser.

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
- `prefers-reduced-motion` is respected by every motion intent; see §12.
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
easing and intents.

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