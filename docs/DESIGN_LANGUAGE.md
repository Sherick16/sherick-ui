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

**A host reset is not part of the language.** The private CSS compiler establishes border-box
geometry and removes native control rims only on explicitly Sherick-owned nodes, then the named
recipes supply their surface, edge and state. For example, a bare-document `Input` is rimless and
a `Divider` has its authored solid hairline. This baseline must not normalize a consumer button
or arbitrary children inside a `Card`. Global animation and math-font names are compiler-prefixed
so the language cannot replace a host's `spin`, `pulse` or KaTeX font. Timing and appearance remain
owned by the existing motion and visual recipes, not by these isolation mechanics.

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
| a recessed surface inverts it | the upper lip is shaded, the lower lip catches a faint bounce; how *deep* the recess is decides which of the two walls is legible, and the other stays a bounce |
| a structural edge is drawn | `--sui-edge`, a shade-tinted hairline |

`--sui-light-top` (the highlight color) and `--sui-light-bottom` (the shade color) are
the two values the elevation ladder composites from: `raised`, `floating`, `control`,
`recessed` and `well` are all built out of them, so re-tuning that pair re-lights every
shadow, highlight and pressed inset at once. They differ in **depth, never in kind**: `well` is
`recessed` with the wall the light makes legible drawn deeper, and its opposite wall left alone.

Depth is also what identifies a mark that has **no fill step to spare**. A wide groove reads
from its own tone, and a mark the size of a glyph has none: the deepest neutral step in the
palette is about 1.3:1 against the surface around it, so tone alone cannot carry it. `well` is
the answer — the same light, one rung further down — and because dark mode inverts the light it
inverts which wall is legible too: the *shaded* wall above carries it in light mode and the
*lit* wall below carries it in dark mode, each measuring at or above 3:1 against every surface a
mark can sit on (`bun run test` measures exactly that composition, and the rendered walls clear
it as well). The opposite wall stays a bounce in each theme.

Exactly one wall carries it, and at the **least strength that clears the requirement** — measured,
not felt: the shaded wall clears 3:1 in light mode and the lit wall in dark mode, and the other wall
is `recessed`'s own. A well should read as a *deeper* groove, not as a more dramatic one, so the
strength is spent on the boundary rather than on the whole interior. Nothing draws a line around the mark — a stroke
tracing all four sides of a matte control is not part of this language, and beside a `Switch`,
which draws none, it looks like exactly what it is. If a design wants an empty mark to sit at
*exactly* the recessed depth of a groove, then its tone has to carry the requirement instead, and
that is a palette decision: the neutral ladder would need a step about 3:1 from the surface around
it, which today it does not have.

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

Primitives: `flat`, `raised`, `floating`, `control`, `recessed`, `well`.

Depth is chosen by **anatomy**, never by state.

| Elevation | Role | Should be used for | Should not be used for |
| --- | --- | --- | --- |
| `flat` | at rest on the page | passive matte surfaces; wider surfaces such as cards | a well that is sunk by design — that is `recessed` |
| `raised` | a manipulated control lifted a hair above its own track | tactile tonal controls (tonal `Button`, `IconButton`) | passive surfaces, table rows, menu rows |
| `control` | the resting half of the tactile pair | a part the user moves — a switch thumb, a selected segment | wide surfaces, or a whole segmented control |
| `recessed` | the other half of the pair | grooves, tracks and wells, which are sunk by definition | raised or resting controls |
| `well` | the recessed recipe with **one** of its walls made deeper — a soft shade above in light mode, a soft light below in dark mode — while the opposite wall stays exactly as `recessed` draws it; no drawn edge anywhere | the *small* sunk mark whose entire identity is its depth — an empty checkbox box, an unselected radio circle | anything with a fill step to spare; a groove, a track, a field or a card, all of which read from their own tone |
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

Primitives: `overlay.scrim`, `overlay.popup`, `overlay.menu`, `overlay.tooltip`, `overlay.toast`,
`overlay.sheet`, `overlay.dialog`.

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
| `overlay.menu` | a compact command list | `shape.control` + `material.acrylic` + `elevation.floating` |
| `overlay.tooltip` | a compact hint, not a capsule control | `shape.row` + `material.acrylicDense` + `elevation.floating` |
| `overlay.toast` | a floating status surface | `shape.prominent` + `material.acrylic` + `elevation.floating` |
| `overlay.sheet` | a surface that owns the viewport and is attached to one edge of it (`Drawer`) | `shape.sheet` + `material.acrylicHero` + `elevation.floating` |
| `overlay.dialog` | a surface that owns the viewport with no edge to attach to (`Dialog`, `AlertDialog`) | `shape.expressive` + `material.acrylicHero` + `elevation.floating` |

A **sheet** is a `Dialog` with an edge, and the two differ only in the corner role they take.
`overlay.sheet` keeps `material.acrylicHero` — a sheet still has to read as the page's own plane —
and takes `shape.sheet`, which steps *below* `prominent` rather than above it. `shape.expressive`
is calibrated for a surface that floats free of every edge, and even `prominent` is the corner of a
compact floating control; a surface meeting a viewport edge is read as an extension of the page, so
a corner sized for a self-contained card makes it read as an oversized one. Which corners are
squared is the attachment's anatomy rather than the recipe's: the edge the sheet is attached to
stays square and the exposed corners keep `shape.sheet`.

A `Drawer` is therefore not a second modal system. It composes `overlay.sheet`, `overlay.scrim` and
the same `DialogSurface` a centered dialog does, so focus trapping, dismissal, scroll locking, the
portal and the scrim have exactly one implementation across `Dialog`, `AlertDialog` and `Drawer`.

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

Every interaction surface shares one stacking level (`stacking.float`), and **document order decides**
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

Application notifications are the exception: `stacking.notification` keeps the persistent
`ToastViewport` above interaction surfaces. Its portal may have mounted before a dialog even
when the notification was raised from inside that dialog; portal order cannot express that event.
Use this level only for the application toast stack, never to rank menus, popovers or dialogs.
For example, a save notification remains readable over its modal editor; a Select inside that
editor still uses `stacking.float` and Base's nested portal order.

Painting above a modal is permitted only with equivalent accessible interaction. Base's toast
viewport is a live region (exempt from modal `aria-hidden` isolation), and its F6 shortcut
enters the stack while ordinary Tab navigation stays within the modal. Tab reaches toast
actions and dismissal; leaving the stack restores the previous focus. Sherick advertises F6
through `aria-keyshortcuts` and keeps those behaviors with Base, not a local focus exemption
or portal reparenting mechanism. The hostile suite verifies this contract for Dialog and Drawer.

---

## 8. Edge — structural lines

Primitives: `edge.row` (the faintest), `edge.header` (the heaviest), `edge.rule` (between the two).
The tone alone is `edgeTone`; the two row roles also carry the direction their row draws.

The hairline is reserved for **where two parts of one surface actually meet**: stacked table rows,
the rule beneath a column header, a divider, a code section boundary. One tone serves every line, so
those all agree with each other, and the public `Divider` component renders exactly this tone so
consumers never reach for a hand-built border. `Divider`'s `weight` selects which of the three roles
it draws — the line between the rows of a stacked list, the general break inside a surface, or the
rule beneath a column header — so a caller names the join it is drawing instead of picking an
opacity.

A line is only ever as wide as the join it marks. A divider inside a padded stack is **inset to the
band the two parts share** rather than spanning the whole surface, and it keeps air on both sides,
so it reads as the boundary between two parts instead of a rule across a table. A line that belongs
to a group also **yields to the part beside it**: while a row whose content is not expanded is
hovered, the hairline next to it fades, so the boundary is visible while the group is scanned
without competing with the state the pointer is already showing. `Accordion` is the worked example
— an inset `Divider` at `edge.row`, fading beside a hovered section and held under an expanded one.

A quote is **not** one of these. `Markdown` marks a blockquote with a primary accent,
because a quote is content-level emphasis rather than a structural join between two
parts, and `Markdown`'s `hr` takes `edge.rule` for the same reason a divider does.

A 1px ring that traces a filled object is still a drawn border. Therefore:

- matte controls carry **no rim**: they are separated by tone and by light alone;
- fields add no line at all — their hover, focus, engaged and error states are tonality
  only, which is why no border appears and disappears as a user interacts;
- `edge.rule` needs its direction supplied at the call site (`border-t`, `border-l`);
- **an empty mark is identified by its depth, not by a line.** A checkbox box or a radio circle at
  rest is the one thing in the family with no content at all, and the neutral ladder cannot carry it
  either: the deepest step the palette has measures about 1.3:1 against the surface around it, where
  WCAG asks 3:1 of the information that identifies a component. A stroke tracing all four sides would
  answer that on paper and be a drawn border in fact — the one thing this section exists to prevent,
  and it reads as foreign next to a `Switch`, which has no such line. The mark is **sunk one rung
  deeper instead** (§5), and its depth is what says what it is. There is no exception to the rule
  above: nothing in the library draws a rim around a filled or matte control.

**Do:** use a hairline to separate sibling parts inside one surface.
**Do not** draw a rim around a filled control, outline a card for emphasis, or express an
interaction state with a border.

---

## 9. Shape grammar

Corner roles are semantic; nothing picks a radius of its own. Softness grows with the
size of the object and the emphasis it carries.

| Shape | Radius | Role | Should not be used for |
| --- | --- | --- | --- |
| `control` | 1.25rem | ordinary controls, dense data regions — fields, rows, options, chips, segments, tables | large surfaces |
| `mark` | 0.625rem | a compact square selection mark — the `Checkbox` box | anything the size of a field, which wants `control`; a full-width row, which wants `row`; a round mark, which is `circle` |
| `row` | 0.875rem | command-density rows, compact segments and short tooltip hints | anything the size of a field or larger, which wants `control` and up; a compact square, which wants `mark` |
| `prominent` | 1.5rem | prominent controls, compact floating surfaces | small inline controls |
| `surface` | 1.75rem | large surfaces — cards, selection sheets, panels | buttons and compact command menus |
| `sheet` | 1.25rem | a surface attached to one edge of the viewport — the exposed corners of a `Drawer` sheet | a free-floating surface, which is what `prominent`, `surface` and `expressive` are for |
| `expressive` | 2rem | an expressive surface that owns the viewport — a `Dialog`, tightened so it reads as a focused surface rather than a pillowy one | anything smaller than a dialog, and anything attached to an edge, which wants `sheet` |
| `pill` | full | fully rounded controls whose width follows their content, and the fully rounded form of a compact part at either ratio — a value control's capsule handle | a wide button with a fixed width |
| `circle` | full | fully rounded square targets | non-square targets |

**Do:** hold one role across a whole component family, so a switch and a segmented
control read as the same object at two scales.
**Do not** substitute a numeric radius, or assign different roles to equivalent siblings.

A role is chosen by the object's own extent, not by how important it feels. `control`'s
radius is right for anything the size of a field; on a 24px square or a 36px command row
it reaches the object's half-extent and the object stops being a rounded rectangle at all
and becomes a capsule. That is why a compact object takes a tighter step than `control`:
`mark` for a square that has to stay a square, `row` for a full-width row whose corner has
to stay proportional to its own height. A control-sized row keeps `control` at both ends. A tooltip's short hint takes `row` too:
`prominent` turns a single-line hint into a capsule, even though it is a sheet rather than a
button. An inline alert takes `control`, not the card-sized `surface` corner.

Nested tracks leave room for their contents: compact toggle segments take `row` inside a
`control` track; normal-sized tabs take `control` inside `prominent`. A tab track is not a
content-width pill. These are existing shape roles, not new radii or theme-dependent offsets.

---

## 10. Tonal hierarchy

### Surfaces and text

Canvas plus three surface levels (`--sui-surface`, `--sui-surface-high`,
`--sui-surface-float`) carry structure. **Two** text steps carry emphasis, and one non-text tone
carries furniture:

| Role | Recipe | Carries | Should not be used for |
| --- | --- | --- | --- |
| high | `text.high` | labels and values | dimmed furniture |
| medium | `text.medium` | supporting copy, descriptions, placeholders, hints, line numbers | primary labels, where it would soften hierarchy |
| detail | `detail.mark` / `detail.fill` | **non-text** furniture — a rail, a gutter, a mark's frame, secondary graphical detail | anything a reader has to read |

There is deliberately no third text step, and the language says so rather than leaving a trap.
A third step would have to sit between `medium` and the lightest surface a component composites
over; measured against those surfaces, the value that clears 4.5:1 is at or above `ink-muted`'s
own lightness, so a third *readable* step cannot exist as a distinct step at this surface range.
What used to be `text.low` / `--sui-ink-faint` is therefore `detail`: a non-text tone that answers
to the 3:1 WCAG asks of non-text information, sits visibly below `text.medium`, and is never a
foreground for text.

A surface level is a **tone, not a depth**. Depth comes from the elevation ladder.

### Color roles

The color roles a surface can take, in rising strength:

| Tone | Role | Should be used for | Should not be used for |
| --- | --- | --- | --- |
| `text` | foreground only | quiet rows and links | fills |
| `soft` | a de-emphasized tinted surface | alerts, badges, quiet cards | primary actions |
| `tonal` | a matte control fill at rest | tonal buttons, icon buttons, chips | surfaces that are not controls |
| `selected` | the fill a selected control holds | menu options, the selected segment of a segmented control | hover — hover is a state layer, not this tone; a navigation destination, which is a place rather than something the user chose |
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
| disabled | 45% opacity applied **once**, no pointer affordance, no interactive state at all; resting elevation is preserved | grey-on-grey colouring that breaks theme, or flattening a raised object |
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

A selected or current control still answers hover and press over its held tint. Tabs, navigation
rows and segments do not lose feedback just because they already hold the active destination.

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
the recessed depth of a groove and a non-spatial tone response, `selectable.markSurface` is the
same object one rung deeper — the `well` of a mark whose identity *is* its depth (§5) —
`selectable.rest` is the neutral matte step a *groove* holds until something in it is selected,
`selectable.mark` is the well fill an *empty* mark sits in, and `selectable.selected` /
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
| `effectiveDisabled` | the disabled step keyed on the primitive's native or `data-disabled` marker, including disability inherited from a Field |
| `disabledPart` | an independently disabled composite part dims at a bound or in read-only mode; inside an already disabled `group/field`, it keeps full local opacity so the composite dims only once |
| `engaged` | a part the pointer is on sits matte and settles back from it: a value control's handle takes its accent and a little size while hovered or dragged, so the accent marks the range and the pointer marks the handle. It is target geometry, not timing: `motionDirect` owns how it transitions, and while the pointer owns the position the handle's own travel is not interpolated at all |

**Do:** let tonality carry hover; let a raised control recess while it is held; let a
flat or floating control press through the state layer's active step and the tactile compression.
**Do not** use opacity for anything except disabled, or add depth to show a state.

### Toggle buttons: chips and segments

A chip and the segment of a `ToggleGroup` are one object at two sizes: a two-state control that
holds a **selection** rather than a value. Both take `tone.selected` from the primitive's own
pressed marker, so an uncontrolled toggle is styled from the same source of truth as a controlled
one.

`variant` names the tone the control takes **once it holds something**. At rest a toggle is the
neutral matte control step, and it is quiet on purpose: expression belongs to the held state, not
to the object that could hold it. That is what lets a row of eight filter chips stay calm with
two of them lit.

The two differ only in what surrounds them:

| | Surrounds it | At rest | Selected |
| --- | --- | --- | --- |
| a `Chip` | nothing — it is a control in its own right | the neutral matte control fill, raised | `tone.selected`; still raised |
| a `ToggleGroup.Item` | the recessed track the group owns | the track showing through, flat | `tone.selected`, raised inside the track |

Both answer a press the way the elevation table says: a raised object returns to the recessed
depth of its own track, so a chip presses back and a selected segment settles into the groove it
sits in, while an unselected segment is flat and presses through the state layer and the tactile
compression alone.

A chip's own group is a wrapping row with no track, because a chip is not a segment of one
object. It is still a group: it owns the shared value, the roving tab index and the arrow keys,
and a member disabled by its own prop or by the group takes the disabled cursor and loses its
interactive state.

**A tag is not a toggle.** A chip that holds no selection is read rather than manipulated, so it
stays flat, and its semantic tone lands on its fill and its icon while its copy keeps its normal
emphasis — the same rule §10 gives every semantic mark. Only a tag can be dismissed: a control
that both holds a value and deletes itself is one target with two meanings, and a button cannot
legally nest inside a button.

**Do:** hold one tone role across the family, so a chip and a segment read as the same object at
two sizes.
**Do not** tint a toggle's rest state with the tone it *could* take, change a chip's depth to
announce selection, or let a tag spring, raise or tint under the pointer.

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
  same thing happening — the pointer and the keyboard both say *which row you are on*;
- **the keyboard gets a second, separate signal.** Which row the pointer is on and which row the
  keyboard will act on are two different questions, and a 5% highlight cannot answer the second one
  on its own. A row therefore also takes the shared inset ring, gated on `:focus-visible`: Base gives
  the active row real DOM focus, and the platform reports that focus as visible when the keyboard put
  it there and not when a pointer did. So a pointer that opens a list and moves over a row gets the
  highlight and no ring, a keyboard that opens one and steps down it gets both, a selected row keeps
  its selection tint under the ring, and a disabled-but-navigable row still shows where the
  navigation is while saying it cannot be used;
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

**A navigation row is not a collection row.** A destination list is scanned the way a list is, so
it takes the same row: flat, the same `quiet` hover layer, the same `shape.row` corner proportional
to its own height, and the densest density step the ladder has. What differs is what being *current*
means. A collection row's selection step marks a value the user chose, and it is the strongest tone
a row can hold; a chapter heading is not a choice, so a navigation row takes `tone.tonal` — the
lightest accent tint there is — which keeps a column of eight destinations calm with one of them
lit. Everything else still says which one it is: its label returns to `text.high` with a touch of
weight, it stays flat, and the row publishes `aria-current`, which is what assistive technology
reads. A `NavGroup` is structure inside the surface it sits on and brings no surface of its own,
and its title takes the emphasis step a value takes — a section label rather than an eyebrow.

### Disclosure groups

An expandable region is also a small system, because the same object appears at two scopes — an
`Accordion` and a `Collapsible` — and it has to behave identically at both:

| Entry | Carries |
| --- | --- |
| `disclosure.trigger` | the row that opens the region: the same object `list.option` is, because a disclosure header is scanned and activated the same way a selectable row is |
| `disclosure.panel` | the measured region: it is clipped to the height its primitive reports, and the height is the only thing `motionDisclose` moves |

Panel copy defaults to the supporting-copy step (`text.medium`, small type, readable line-height),
not larger or stronger type than its trigger. Collection and disclosure rows align to the logical
start, and selection lists share the same inter-row gap. A menu divider stops at the rows' content
band, just as an accordion's does.

The two are one definition, not two designs that drift: an accordion item's row and a standalone
disclosure's row are the same object, and only the state contract behind them differs — a group
holds a value array, one disclosure holds a boolean. Both are the primitive's state; neither is
mirrored by the component.

A disclosure group's **own** structure is the group's, never a section's: the hairline between two
sections is a `Divider` at `edge.row`, and a section never draws its own edge. A group's line
follows the same economy §8 gives every structural line — inset to the band the row and the panel
share, air on both sides, and a yield while a neighbouring section is hovered without competing
with the state the pointer is already showing.

**Do:** let the primitive measure the region and let `motionDisclose` move it, so an accordion and
a disclosure expand by the same physical event.
**Do not** animate a panel's contents, stagger rows into view, or give a section its own border to
announce that it is open: the chevron turns, the region's height changes, and that is the whole
of it.

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
| `tactile` | a temporary physical answer to activation | `motionTactile`, `motionInkPress` | a button, an icon button, a stepper, a navigation row, a field that opens a list |
| `arrive` | a meaningful subordinate part appears or leaves | `motionArrive` | a checkbox tick, a radio dot, the selected mark in a `Select` or `Combobox` |
| `orient` | a persistent affordance changes orientation in place | `motionOrient` | the disclosure chevron of a `Select`, a `Combobox`, an `Accordion` row or a `Collapsible` |
| `relocate` | a persistent object travels between stable destinations | `motionRelocate` | a tab indicator, a switch thumb |
| `direct` | the pointer owns the geometry | `motionDirect` | a slider's handle and the fill it carries |
| `disclose` | in-flow content expands and collapses | `motionDisclose` | the measured region of an `Accordion` item or a `Collapsible` |
| `presence` | an independent surface enters or leaves | `motionPresenceAnchored`, `motionPresenceTooltip`, `motionPresenceModal`, `motionPresenceSheet`, `motionPresenceToast`, `motionPresenceScrim` | every popup, tooltip, dialog and sheet, the toast stack, and the plane behind a viewport-owning surface |
| `activity` | continuous movement that reports work | `motionActivitySpin`, `motionActivityPulse`, `motionActivityIndeterminate` | a spinner, a skeleton, the fill of a bar whose extent is not known |

**Dynamics live below the intents.** There are six, and a component never chooses one:
`swift` (immediate response: `--sui-duration-press`, `--sui-ease-press`), `settle` (strong
deceleration into a destination: `--sui-duration-release`, `--sui-ease-release`), `glide` (a
persistent object crossing the distance between two stable destinations: `--sui-ease-glide` with
the settle duration), `spring` (the one restrained overshoot: `--sui-ease-spring`), `exit`
(decisive acceleration away: `--sui-duration-overlay-exit`, `--sui-ease-exit`) and `continuous`
(a repeating loop: `--sui-duration-activity` with `linear`). The intent picks the dynamic; the
tokens in `src/styles/tokens.ts` are its only authored values, and they are also the whole of the
workbench speed control in the motion lab.

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
| `motionTactile` | 4% compression | a control whose outline is what the user sees, including a field that opens a list, whose field carries the press |
| `motionInkPress` | 12% compression **of the mark** | a control whose visible ink is much smaller than the target it is aimed at — a stepper, a dismiss control, a close control. The target keeps its geometry; the mark inside it takes the press |
| `motionPresenceAnchored` / `…Tooltip` | from 94% scale, 4px toward the anchor | any anchored surface |
| `motionPresenceModal` | from 96% scale, 12px rise | a surface that owns the viewport with no edge |
| `motionPresenceSheet` | a full own extent, out of the edge the surface is attached to | a `Drawer`: the same viewport-owning surface, placed against one edge, so it slides rather than lifting |
| `motionPresenceToast` | the stack's own geometry: a clamped height, a stepped-back offset, and a travel in the direction the stack grows from | the toast stack, where one node carries the arrival, the re-flow and the gesture together |
| `motionArrive` | from 50% scale | a selection mark |
| `motionActivityIndeterminate` | the track's own width, as a composited transform | the fill of a bar whose extent is not known |

The one loop is a **travel** rather than a zoom: its amplitude is measured against the track rather
than against the part that moves, so it does not depend on how wide that part happens to be, and it
is carried by a transform so an endless loop never sits on the layout path. It follows the writing
direction, because a transform is physical and the page is not.

Every one of these is a **centred zoom** or a directional grow: a press changes size in place and
never translates, and an anchored surface grows about the edge the primitive resolved for it.

A press travels about two pixels at the size of the ink it moves, and the compact step exists
because a 20px glyph inside a 44px target would never register two pixels of its own movement —
not because a smaller control deserves a livelier animation.

**A field that opens a list is a control, and presses like one.** A `Select`'s trigger and an
editable `Combobox`'s field are the same control in two forms, and the whole field answers a press
in both — one recipe, one amplitude, one timing, so pressing either reads as the same physical
event:

```
Select      press → whole field compresses → the list grows out of it
Combobox    press → whole field compresses → the list grows out of it
```

The field is the element that carries it because a press activates the whole chain: a descendant
being pressed is what makes the field itself match `:active`, which is also why a `Select` can
compress at all — the primitive suppresses the trigger's own active state, and its field's wrapper
is the only element left to answer. Composition follows from there:

- the field's **own affordances** — a clear control, a disclosure control — answer with tone alone,
  because a second compression nested inside the field's would read as two events for one press;
- **typing and focus** never match, so the field is perfectly still while it is used as a text
  field;
- a press that **places a caret or drags across a word** is the same press, and the field compresses
  for it too. That is accepted rather than special-cased: telling it apart would take pointer
  bookkeeping or an interaction state machine inside a component, for a case that reads as one
  interaction either way. A plain `Input` or `Textarea` opens nothing, so it stays feedback-only.

**A target the pointer is already on never moves.** A control whose visible ink is much smaller
than its target — a stepper, a dismiss control, a close control — compresses the *mark*, not the
target: a 44px target that became 38.7px while held would move the ground under a near-edge
release, and it would contradict the separation between a large hit area and small visible ink that
`density.target` and `hitArea` exist to keep. Its focus ring and state layer stay on the target, and
they stay still with it.

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

A press works the same way: when a control inside a composite field is pressed, the field is the
manipulated object and the control inside it answers with tone — one field-level compression, not
a control compressing inside a field that compresses too.

One recipe may carry several of those events on one node when the primitive reports them on that
node. A toast's transform is its arrival, its place in the stack and the drag the pointer owns,
all three read from what Base publishes — but they are one spatial owner (`motionPresenceToast`),
not three recipes composed, which is why an interrupted stack retargets from what is painted
instead of restarting.

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
way it is actually placed. A **logical** side resolves against the writing direction: `inline-start`
takes the popup to the anchor's physical left on a left-to-right page and its physical right on a
right-to-left one, and the four pixels of travel change sign with it, because they always move
*toward* the anchor. The direction is declared twice — document `dir` for CSS and Sherick's
public `DirectionProvider` (delegating to Base UI) for keyboard behavior and placement — exactly as `apps/showcase` does for its logical-side
specimens; the physical sides never depend on it. A tooltip is the same model on the local settle timing; a modal
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
| `presence` | opacity only, on the same timing, and an exit never lingers: a sheet is not carried out of its edge and the toast stack does not travel. |
| `activity` | a static status glyph |
| `disclose` | the layout state applies immediately — the region is open at its own height, in one step |

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

Composite parts do not inflate their field's density: a 44px stepper fits inside the normal 48px
field, just as a search submit does. Unfilled embedded controls use the quiet state layer, not the
tonal-button layer.

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
- `focusRing` draws the ring **outside** the shape, for a control that stands alone. It follows
  **keyboard** focus: a button does not announce itself when a pointer presses it.
- `focusRingInset` draws it **inside**, for a control nested in another surface where an
  outer ring would collide with the parent's edge.
- `focusRingHeld` is the ring of a control that **holds a value** and is itself the focusable
  element — a select trigger. It is worn whenever the control holds focus *however it was focused*,
  and while the surface it opened is on screen: a select hands the DOM focus to its list while that
  list is open, so the ring follows the control's engagement rather than the focus. This is what a
  native `select` shows, and it is the only focus indication the field has left once the list has
  taken over.
- `focusRingWithin` is the same ring for a value control whose focus lives in a borderless input
  **inside** it — a combobox field, a search field, a number field. It follows **visible** focus.
- `groupFocusRing` draws it from the wrapping control instead of the track it contains.
- `parentFocusRingInset` is the same inset ring on a direct child of the focused element.
  Use it for a tree row whose focusable treeitem also owns its nested group: the ring traces
  only that row, never the subtree. Do not use it for a directly focusable row (use
  `focusRingInset`) or arbitrary descendants, where an ancestor's focus would be ambiguous.

The whole rule, in one line: **the ring says where the keyboard will act**, so it appears when focus
arrived from the keyboard and stays quiet when a pointer did the focusing — *unless the platform
itself reports the pointer's focus as visible*, which it does for a text field and does not for a
button or a range input. The library follows the platform instead of fighting it, which is why the
ring lands differently by control and why every difference below is a platform fact rather than a
local preference:

| Control | Ring |
| --- | --- |
| a text field — `Input`, `Textarea`, `Search`, `NumberField`, an editable `Combobox` | **whenever it is focused**, pointer or keyboard: a focused text field is always `:focus-visible` |
| a `Select` trigger | **whenever it holds focus or its list is open** (`focusRingHeld`): a select hands the DOM focus to its list, so the ring follows the field's engagement — exactly as a native `select` does |
| a slider handle, a button, an icon button, a nav row, a menu item | **keyboard focus only**: a press, and a drag, already answer visibly |

That is what keeps a select trigger and an editable combobox field identical in every state —
neither ringed at rest, both ringed the moment either is used, both losing it together — while a
handle that the pointer is already moving keeps its ring for the keyboard.
- Fields use the outer ring only. No inner rim is added, so focus reads as one ring,
  never two.
- Where Base UI provides the widget primitive, Base UI owns roles, ARIA relationships,
  generated IDs, keyboard navigation, focus placement/restoration and composite-control
  form participation. Sherick UI owns the visible focus/state treatment layered onto
  that behavior. Do not duplicate Base's semantic machinery locally.
- Focus is visible on keyboard focus (`:focus-visible`), and never removed without a
  replacement indicator. A control that holds a value widens that to "while it is being used",
  as described above, because that is what the platform does for a native `select` and a native
  text field.
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

### The contrast contract

The authored palette meets WCAG AA. What that means is not a claim but a measurement: every
composition the language permits — each text role against each surface a component composites
over, a semantic foreground on its own tint and through its hover and pressed states, an on-colour
on its strong fill through the filled states, the marks that carry a selection, the error
placeholder, the non-text tones, and the focus indicator against every surface and every fill an
inset ring is drawn over — is measured from the published token values in both themes by
`bun run test`, with no allowlist. See [`VERIFICATION.md`](VERIFICATION.md) for the gate and
[`PALETTE.md`](PALETTE.md) for the values and the record of how they were chosen.

Three properties of the palette are load-bearing for that result, and they are what a future
change has to keep:

- **the accents are deep enough in light mode and light enough in dark mode to survive their own
  state layers.** A tonal control's label is the accent over a 9–12% tint of itself, and hover and
  press composite the accent over that fill again (0.09/0.15 for a tinted control, 0.05/0.09 for a
  text one, 0.18/0.26 for an opaque fill). The resting value is not the binding one; the pressed
  state is;
- **`primary`, `primary-strong` and `focus` move as one family.** The accent a label takes on a
  tint, the opaque fill that marks priority, and the ring are one hue at three depths, and a
  change to one of them is a change to all three;
- **there are two text steps and a non-text tone**, per §10. A third readable step cannot exist at
  these surfaces, and the tone that was pretending to be one is `detail`.

Colour is never the only carrier of meaning, and the contrast of a semantic tone is not what makes
a state legible on its own: a state also carries an icon, a label, a position or a border. That
rule still holds, and it is now backed rather than leaned on.

Do not "fix" a contrast measurement inside a component by darkening that component's label: the
roles above are the shared primitives, and a local color is exactly the kind of rule §16 forbids
inventing locally. When a pairing legitimately cannot be legible, the language changes — the role,
the tint, or the state step — and then the whole set is re-measured.

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

Not every local decision is a visual rule. **Layout, spacing, component-specific padding,
intrinsic dimensions, responsive arrangement, content typography and the small optical
corrections its own geometry needs are the component's own anatomy** — decide them inside
the component, exactly as `Button`'s size paddings are decided. They are not promoted into
global primitives, and "could this
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

## 17. Optical balance

Geometry is the starting point; **perceived balance is the acceptance criterion**. A part is
placed by what the eye reads, and the eye does not read box arithmetic: a mark carries its own
padding and its own whitespace, and copy that wraps has more than one centre. This section is the
vocabulary that rule is stated in. A component still decides its own anatomy — the numbers belong
where the geometry that causes them lives — but the reasoning is the language's, not each
component's.

### The visible mark and the interaction target

A control's target and the ink it shows are two objects, and the target is never traded for the
mark:

- the **target keeps its size and its concentricity**. A correction never shrinks a target, never
  moves one under a pointer that is already on it, and never drifts the mark inside it: a mark that
  no longer sits at the centre of its own target is a mark whose state layer and focus ring no
  longer surround it, which is a worse defect than the one being corrected. What moves is the
  **whole control** — mark, state layer, ring and hit area together;
- **placing a control belongs to the surface's anatomy.** A chip gives its dismiss control's target
  padding back at its end edge; a header sets its close control on the title's first line. In both
  the surface is placing the control, and the control keeps its size, its concentricity and its
  pointer-answerable area while it moves;
- **padding that exists only to enlarge a target is compensated at the edge, and whitespace
  inside a mark's own artwork is not.** The six pixels a chip's dismiss control holds around its
  glyph are target padding, so they are given back at the end edge. The two units of empty viewBox
  a chevron ships with are the artwork's, so a chevron is placed by its box and never nudged so its
  ink meets a line of text. Artwork with unusual internal whitespace is the artwork's
  responsibility.

### Icon slots are geometry, not content

A slot is a decision, not an accident of whatever was passed in:

- the slot fixes its mark's **box size** and holds it (`shrink-0`), so swapping one mark for
  another — an icon for a loading mark, a tick for a dash — cannot change the control's width or
  its balance. The box is the contract: a `ReactNode` mark is centred in it whatever it is, and it
  is the slot — not the mark — that owns the geometry;
- direct SVG artwork is sized by the **slot's own contract** (`[&>svg]:size-*`) rather than by
  every call site, so all the marks in one control are one size. Artwork nested inside another node
  is the caller's to size, as its internal whitespace is: the slot centres it and does not reach
  into it;
- a slot aligns its **box**, not the ink inside it, which is what lets a row of controls agree with
  each other.

### Two ends, one perceived distance

The two ends of a control are not obliged to share one number:

- a **text-only** control is symmetric, because symmetric inline padding is what centers its label;
- a control with a **leading mark** measures its start padding to the mark's box, and one with a
  **trailing affordance** measures its end padding to the affordance's box, so both ends read at
  the same distance even though one holds a 20px mark and the other a 28px target;
- **every asymmetry the library authors is logical.** A correction writes its own asymmetry on a
  writing-direction property — `ps`/`pe`, `ms`/`me`, `text-start`/`text-end`, `border-s`/`border-e`
  — so a right-to-left page is the same design rather than a second one, and a physical side
  (`left-4`, `pl-6` …) is a defect rather than a shortcut. The one surface this does not describe
  is a **code well**: source code is read left to right whatever the document says, so `CodeBlock`
  declares its own direction and the gutter inside it is physical on purpose;
- a control that owns a **trailing cluster** — a combobox field and its two parts — places that
  cluster with its own inline padding rather than pinning it to a physical edge, so the cluster
  stays at the field's end whichever way the page reads.

### Multiline copy holds its first line

A status mark or an affordance beside copy that can wrap aligns to the **first readable line**,
not to the centre of the block; a one-line row is the degenerate case of the same rule, so the two
never disagree:

- the row lays its parts out from the top (`items-start`) and the mark's slot takes the **first
  line's own height**, so the mark is centred on that line with no magic offset and a row that has
  not wrapped is unchanged;
- a target taller than the line it belongs to — a 44px dismissal beside a 24px line — is offset by
  the difference between them, because that difference is the geometry, and a number chosen by feel
  would drift the moment the line height changed;
- which line is first is a fact the component owns: a toast with a title aligns its mark and its
  dismissal to the title's line, and the same toast without one aligns them to the description's.

**The rule is about a mark that belongs to a line, not about one that owns a row.** A disclosure
chevron is the affordance of the whole region its row opens, so it stays centred on the row when the
row's label wraps; a status icon, a field's embedded mark and a dismissal all belong to the first
line and follow it. Which of the two an affordance is, is a fact about what it does rather than
about where it sits.

### A state substitution keeps the slot it replaces

A control that swaps its mark for a state — an icon for a loading spinner — renders the substitute
at the **same size the slot had**, so entering and leaving the state neither shrinks the mark nor
changes the control's width. The substitute's own ink may still be lighter than the icon's; that
is the artwork's business, as above.

### Corrections are small, contextual and tied to a fact

An optical correction is a consequence of a component's own anatomy — a line height, a target
size, the padding a dismiss control owns — and it is written down beside that anatomy:

- it is **not** a global offset token, a blanket `translate-y-px` or a per-theme number: the
  library has no `--optical-offset` and should not grow one, because one number cannot be right
  for a 16px glyph beside a 24px line and a 28px target beside a 14px one;
- where a part already carries a transform for its state or motion — a disclosure chevron's
  rotation, a selection mark's arrival — an optical adjustment is never stacked onto that same
  node: it moves a nested element or it is not made;
- focus, hit-area and interaction-boundary geometry are never a correction's subject.

If several components genuinely end up with the same slot or the same correction, that is the
point at which the smallest useful recipe is extracted; until then the decision stays where its
anatomy lives.

---

## 18. The showcase

> **The development showcase demonstrates the system; it does not explain it. Design
> rationale belongs in this document.**

The showcase exists for visual comparison, interaction and state testing, theme testing,
component discovery and regression inspection. It shows specimens and their labels; it
does not argue for them. Rules, rationale and explanation belong here.

A foundation card isolates **one primitive at a time**: the depth ladder is shown against a
single neutral fill, so a pairing inside a specimen card is not a recommendation to compose
it, and a specimen may outline a fill that would otherwise be invisible against the card.

The page is organised **one concern per section**, and a section is named for its concern
rather than for a component: foundations, buttons, fields, selection, feedback, disclosure,
display, floating surfaces and content. A control's meaningful states appear beside that
control — a button at rest beside the same button loading, a chip with and without a leading
mark or a dismiss control — because a section of their own would make a property the whole
library shares look like a feature of it. A property like optical balance is a rule in this
document and a state of every control, never a section of the page. A component may appear as
*content* inside another section (a popover's body, a table cell), but it is specimened once.

## 19. Constrained layout and content

Components yield their automatic minimum width in flex/grid composition. `fieldLayout` owns
the labelled-field column: it shrinks with its container and wraps explanatory copy, including
unbroken identifiers. Native text inputs retain single-line editing/scrolling. Disclosures and
readable surfaces also wrap copy; a badge, chip, navigation row or selection-list value may
truncate within its bounded slot. Do not truncate explanatory body copy to hide overflow.

Tabs, toggle/segmented tracks, tables and code wells own inherently wide content through local
scrolling. Consumers still own application grid columns and explicit fixed-width children, but
must not need a scrolling wrapper around a standard track. Code remains unwrapped and LTR.

Modal centering must yield to a reachable scroll origin when content exceeds the viewport.
Toast content may scroll at the dynamic viewport limit; it is never sized from the height its
primitive measures. Tooltip content is a short supplemental hint, not a long document or an
interactive form; use Popover for those. A loading Button without an icon overlays its spinner
on the retained label footprint; icon-bearing buttons substitute within their existing slot.