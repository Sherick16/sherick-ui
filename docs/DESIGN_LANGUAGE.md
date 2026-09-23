# Sherick UI design language

**Quiet by default, expressive where it matters.** Grounded content is matte and legible;
color, motion and depth are reserved for selection, manipulation and surfaces that float.
Consistency means using the same roles, not giving every component identical anatomy.

This is the canonical visual language. `packages/ui/src/components/ui.common.ts` owns reusable
visual recipes, `ui.motion.ts` owns temporal recipes, and `src/styles/tokens.ts` owns authored
theme values. Components own layout, spacing, padding, intrinsic size, responsive arrangement,
content typography and corrections caused by their own geometry. The private CSS compiler and
consumer integration are described in [ARCHITECTURE.md](ARCHITECTURE.md); validation is in
[VERIFICATION.md](VERIFICATION.md). The showcase demonstrates states, not design rationale.

## 1. Governing rule

Start at flat matte. Lift a control only when it is manipulated; recess a track or well
because it is sunk; use acrylic only when a surface actually floats above the page. A hover
or keyboard highlight never earns a new level of depth. Let one primary action hold the
strong fill in a view rather than making every control compete for attention.

## 2. Material, elevation and edge

These roles are independent: **material** fills a surface, **elevation** gives it distance
from the page, and **edge** marks a structural join. A card may be matte and flat, a tonal
button matte and raised, and a switch track matte and recessed. A material contains no
shadow, radius or rim. Add a line only where two parts of the same surface meet.

## 3. Light model

Light comes from directly above. Upper edges catch light, shadows fall down, and a recess
shows a shaded upper wall and a quieter lower bounce (reversed in dark mode). The shared
`--sui-light-top` / `--sui-light-bottom` pair lights the elevation ladder; acrylic has
separate theme-calibrated fill and lighting tokens following the same direction. Do not add
a sideways shadow or an upward-lit gradient to one component.

## 4. Material

| Recipe | Use | Not for |
| --- | --- | --- |
| `canvas` | application background | nested content |
| `matteQuiet`, `matte`, `matteHigh` | quiet, ordinary and stronger grounded surfaces | floating UI |
| `matteInset` | a passive sheet tucked beneath a stronger control, visible but quieter than that control | independent cards or fields |
| `control`, `controlError` | text fields and their invalid state | passive cards |
| `handle` | a small value-control part that must remain findable, even disabled | large surfaces |
| `acrylic`, `acrylicDense`, `acrylicHero` | anchored sheets, compact hints, viewport-owning overlays respectively | grounded content |

An anchored sheet carries enough of its own tone to cover content behind it; blur enriches
it but does not establish legibility. Use the material by what the surface **is**, not by
how important its content feels.

## 5. Elevation

| Recipe | Use | Not for |
| --- | --- | --- |
| `flat` | grounded passive surfaces | a recessed track |
| `raised` | tactile tonal actions at rest | hover or passive data |
| `control` | switch thumb or a held selection inside a track, list or calendar | keyboard highlight |
| `recessed` | grooves, tracks and a raised control while pressed | fields or flat cards |
| `recessedTop` | the upper wall of an inset sheet continuing directly below a control, without a lower rim | standalone tracks or wells |
| `well` | a small empty checkbox/radio mark whose recessed wall identifies it | a wide groove with its own fill |
| `floating` | real overlay surfaces | anything in document flow |

Held choices combine `tone.selected` and `elevation.control`: selected segments, options,
tree rows and calendar days. A continuous date range makes one band per week rather than
seven separately elevated cells. The mark itself, a check or a date, remains another
selection signal. Navigation-only current rows and unselected commands stay flat. A small
empty selection mark uses a deeper well, **not** a four-sided outline.

## 6. Acrylic

`acrylic` belongs to Select/Combobox lists, menus, popovers and floating status surfaces;
`acrylicDense` to compact hints; `acrylicHero` to dialogs and edge-attached drawers. The
large sheet is calmer and more self-contained than the small one; the scrim separates it
from the page. Retune acrylic at the theme owner, never by giving one popup a custom blur
or fill. Cards, tables and fields stay matte.

## 7. Floating shells

| Shell recipe | Surface |
| --- | --- |
| `overlay.popup` | rounded anchored option list or structured popover |
| `overlay.menu` | tighter command list |
| `overlay.tooltip` | short dense hint, not a capsule control |
| `overlay.toast` | independent floating status |
| `overlay.sheet` | viewport-attached Drawer, square at the attached edge |
| `overlay.dialog` | free-floating Dialog or AlertDialog |
| `overlay.scrim` | the plane behind a viewport-owning surface |

Each shell composes material, elevation and shape. Base UI owns popup placement, focus,
portal, dismissal and mount lifecycle; `ui.motion.ts` owns visual presence on the popup,
not on its Positioner. Anchored entrances follow the resolved side and origin, including
a collision flip. Dialog and Drawer share one modal surface; attachment changes the
corners and entrance, not modal mechanics. Interaction surfaces share `stacking.float` so
later nested portals paint over their parent; `stacking.notification` keeps the persistent
ToastViewport above them, with Base's F6 keyboard route into its live region.

## 8. Edge

`edge.row` is the faint join between stacked rows, `edge.rule` an internal section break,
and `edge.header` the stronger rule under a header. The public `Divider` chooses those
roles by `weight`. Inset a divider to the content band it separates; let a row's line
yield to a hovered neighbour. A quote's accent is content emphasis, not a structural
edge. **Never outline a filled control or a card just to distinguish it.** Fields change
tone rather than drawing and removing borders on focus or error.

## 9. Shape

| Role | Use |
| --- | --- |
| `mark` | small square checkbox |
| `row` | command-density row, compact segment or short hint |
| `control` | fields, ordinary controls and full-width option rows |
| `prominent` | prominent controls, tab tracks and compact floating status |
| `surface` | cards, panels and spacious anchored sheets |
| `sheet` | exposed corners of a viewport-attached Drawer |
| `expressive` | a dialog floating free of all edges |
| `pill`, `circle` | content-width round controls and square round targets |

Choose shape by the object's own extent. A field radius on a 24px square would make it
a circle; a dialog radius on a drawer attached to the viewport would make the drawer
look like an oversized card. A compact segment nests its `row` corner in a `control`
track; a normal tab nests `control` in `prominent`. Pagination is also a recessed
segmented track, with rounded-rectangle targets and a raised current page. Do not use
literal radii or invent per-theme corner offsets in components.

## 10. Tonal hierarchy

There are **two readable text roles**: `text.high` for labels and values, `text.medium`
for descriptions, placeholders and supporting copy. `detail.mark` and `detail.fill`
are non-text furniture roles, never a third step for readable text. Surface tones
(`canvas`, `surface`, `surface-high`, `surface-float`) are not elevations.

| Tone | Meaning |
| --- | --- |
| `text` | foreground on a quiet row or link |
| `soft` | restrained tinted information, alert, badge or quiet card |
| `tonal` | matte tactile control fill |
| `selected` | a held choice, not a hover or a location in navigation |
| `strong` | priority action or a semantic mark with sufficient contrast |
| `strongChecked` | a strong fill driven by the primitive's checked marker |

Primary marks interaction, accent gives supporting emphasis, and danger/warning/success
carry meaning rather than decoration. Semantic color belongs to the relevant icon,
control or small region, not a whole table or page. Readable copy on passive semantic
regions keeps normal text emphasis. A navigation destination uses a quieter tonal tint,
weight and `aria-current`, not the selected-value treatment of a list option.

## 11. Interaction states

Hover is a tonal step over the resting fill. `stateLayer.quiet`, `tonal`, `filled` and
`track` composite the response without replacing that fill. `activeRow` makes keyboard
highlight equal to pointer hover on a collection row; keyboard focus also adds the inset
ring. Disabled rows lose interactive hover/press but remain discoverable by keyboard when
the primitive permits it, so a disabled highlighted row still shows navigation.

A raised control recesses while held; a flat or floating one retains its depth and
answers with the pressed state layer plus tactile motion. Disabled controls keep resting
anatomy and take **one** 45% opacity step, with no pointer affordance. `state.disabledRow`
reads the disabled marker on a nested control; `disabledPart` avoids dimming a part twice
inside an already disabled field. A focus ring never substitutes for the state response.

All text fields share a borderless control fill that rises in tone on hover, then while
focused or open; an engaged field must not fall back to hover strength under the pointer.
Invalid fields follow the same ladder in danger tone, including validity inherited from
Base Field. Only list-opening Select and Combobox fields compress on activation; typing
and focus never compress an ordinary Input or Textarea. Date entry is native and its
separate calendar glyph, not its text field, owns the popup press.

Checkboxes, radios, switch tracks and slider grooves retain their recessed boundaries
through state changes. Their selection fills or marks arrive **inside** the boundary;
switch thumbs move, but tracks do not bounce. The accent belongs to a slider's range;
its matte handle remains separable from that range, including when disabled.

Chips and ToggleGroup segments both hold selection: an unselected toggle stays neutral,
a selected one uses the primitive's pressed marker and `tone.selected`. A chip floats
on its own; a segment sits inside a track. A passive tag stays flat, and only a passive
tag may have an independent dismiss target. Select/Combobox options hold choices and may
rise; Menu commands perform actions and stay flat. They share row hover/highlight and
inset keyboard focus, but their row density differs. A destructive command tints its
own label, not the whole menu sheet.

Accordion and Collapsible share the same disclosure row and supporting-copy panel.
The chevron describes the whole region, so it stays centered on the row even when the
label wraps. Only the panel height and chevron orientation change; sections do not
animate their copy or grow a new rim.

## 12. Motion

One module, `ui.motion.ts`, chooses timing, easing and amplitude by **intent**:

| Intent | Use |
| --- | --- |
| `feedback` | non-spatial tone, focus and highlight |
| `tactile` | press/release; compact mark-only press when its target must stay still |
| `arrive` | a newly made selection mark; the sole restrained spring |
| `orient` | chevron turning in place |
| `relocate` | tab indicator or switch thumb traveling between stable destinations |
| `direct` | pointer-owned slider geometry without interpolation |
| `disclose` | measured in-flow panel height |
| `presence` | popup, tooltip, modal, sheet, toast and scrim entrances/exits |
| `activity` | spinner, skeleton or indeterminate progress |

A component decides **what** changes; motion decides **how** it moves. One node has one
spatial owner, though feedback may accompany it. A pointer's target never moves beneath
it: small dismiss and stepper glyphs compress inside stable hit areas. Boundaries of
checkboxes and radios stay still. Stable selections do not bounce, while a mark being
made may spring. A dragged handle follows the pointer without lag. Base owns overlay
lifecycle and placement; Sherick adds no exit timer or parallel presence state. Under
reduced motion, states remain visible immediately and spatial travel is removed; a
loading glyph becomes static. Do not author literal duration/easing/transition/animation
classes or keyframes in components.

## 13. Density

| Step | Minimum height | Type | Use |
| --- | --- | --- | --- |
| `compact` | 2.5rem | 0.875rem | dense actions and rows |
| `normal` | 3rem | 0.95rem | default fields and controls |
| `prominent` | 3.5rem | 1.125rem | larger actions |
| `target` | 2.75rem square | inherited | standalone icon-only hit area |
| `part` | 2.75rem high, 2.25rem wide | inherited | embedded part of a composite field |

Density owns control height and type scale; each component owns its own padding. The
embedded `part` is narrower than a standalone target because its surrounding field is
already the larger target. Do not make an icon-only standalone button use `part`, shrink
hit targets for phone layouts or create a fourth size step to solve a local spacing issue.

## 14. Accessibility and focus

A 2px `--sui-focus` ring is the visible focus language. `focusRing` surrounds a
standalone target, `focusRingInset` stays within a row or track, `focusRingWithin`
follows the input in a composite field, and `groupFocusRing` follows a wrapping control.
`focusRingHeld` keeps Select's trigger visibly engaged while its open list has DOM focus;
`parentFocusRingInset` traces only a tree item's direct row, not its descendants. A
plain text field follows the platform's `:focus-visible` on pointer *and* keyboard
focus; button and slider focus rings normally appear for keyboard focus. No second
inner field rim is added.

An icon-only action needs an accessible name independent of its tooltip, and a 44px
standalone target. Checkbox/radio marks may keep a smaller visible footprint while a
transparent hit area reaches that floor; surrounding rows still need clearance. Labels,
errors and descriptions keep their Base Field relationships; Base primitives own ARIA,
keyboard mechanics, form participation and restoration where available. Forced colors
replace lost tone/depth with system-color boundaries for selection, highlight and focus.
The measured AA contrast contract covers both themes, text/semantic/focus compositions,
small marks and state layers; see [PALETTE.md](PALETTE.md) and [VERIFICATION.md](VERIFICATION.md).
Color alone never identifies meaning.

## 15. Theming

The authored values live in `src/styles/tokens.ts`: light and dark are calibrated
separately, with system dark generated from the same dark object. An absent root theme
attribute follows `prefers-color-scheme`; `data-sherick-theme="light"` and `"dark"`
force a mode. Consumers retune `--sui-*` variables at document/root level. Nested theme
islands are not promised because overlays portal outside local subtrees. See the
[README](../README.md#light-dark-and-system-themes) for the consumer contract.

## 16. Extending the language

Reuse the existing role first. If a genuinely new system-level rule is needed, document
its role and when-to-use / when-not-to-use here, then add a common or motion recipe and
any needed runtime token before using it in a component. Colors, material, elevation,
shape, structural edges, state layers, focus and motion are system-level. Layout, gaps,
component padding, intrinsic dimensions, responsive arrangement, copy type and a small
optical correction belong to the component. Never create a second behavior layer over
Base UI for widget mechanics it already supplies.

## 17. Optical balance

Center the **visible mark** within its slot and keep the target, state layer, focus ring
and hit area concentric. Compensate target padding by placing the *whole target* within
its parent, not by nudging the icon under the pointer. Slots fix an icon's box size so
an icon-to-spinner substitution does not alter a button's width. Align a status mark
or dismiss target to the first readable line of wrapping copy; a disclosure chevron
instead belongs to its whole row. Leading and trailing marks can need different
logical padding even when a text-only control is symmetric. Write asymmetry in logical
start/end properties so RTL reads equally well. Code wells alone remain LTR. A local
correction should follow the actual geometry, not a global optical-offset token.

## 18. Showcase

The showcase groups design language, buttons, fields, selection/navigation, feedback,
disclosure, display, floating surfaces and content. Meaningful states live beside their
component, with space to compare siblings, rather than in separate state-only galleries.
It is a development workbench for visual and interaction review, not a substitute for
this document or a promise that every prop combination has a specimen.

## 19. Constrained layout and content

Controls yield automatic minimum width in flex/grid composition. Labels, descriptions,
errors and ordinary prose wrap, including long identifiers; compact value slots may
truncate. Tabs, segmented/toggle tracks, tables and code wells scroll within themselves.
Pagination retains previous/current/next and total in a narrow container; Stepper becomes
vertical rather than clipping stages. Container width, not just viewport width, drives
these changes. Dialogs preserve a reachable scroll origin when taller than the viewport;
toasts stay inside the dynamic viewport. Tooltips are short hints, not forms. Native
date input remains editable and its calendar is an anchored popup. A file chooser shows
one affordance, constraints once, selected files as quiet rows, and visible rejection
feedback; it does not invent upload progress.
