# Sherick UI design language

**Quiet by default, expressive where it matters.** Grounded content is matte and legible;
color, motion and depth are reserved for selection, manipulation and surfaces that float.
Consistency means using the same roles, not giving every component identical anatomy.

**Graphite and iris.** The page is a near-white canvas; content sits on white sheets; copy is a
graphite ink; and one vivid iris violet is spent only on what the reader acts on — the priority
action, a made selection, a value's range, the focus ring. The neutrals carry only a bare trace of
the accent's hue, so they read as true greys that belong to the accent's family rather than as a
tinted wash, and shadows are a graphite umbra for the same reason. Dark mode is a graphite room,
not inverted light: sheets are lit a step above the floor, the accent glows rather than shouts, and
a floating edge is a line of light. The palette record, with every measured composition, is
[PALETTE.md](PALETTE.md).

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
shadow, radius or rim. Add a line only where two parts of the same surface meet, or where a
hollow control needs its rim (§8).

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
| `matteQuiet`, `matte`, `matteHigh` | quiet, ordinary and stronger grounded surfaces; every sunk track (slider groove, progress track, segment track) is `matteHigh`, so its full extent stays visible on a card | floating UI |
| `matteInset` | a passive sheet tucked beneath a stronger control, visible but quieter than that control | independent cards or fields |
| `control`, `controlError` | text fields and the file drop target: an opaque **tray** in the `surface-high` tone, which under the pointer and while engaged sinks to `tray-deep`; the invalid form is the danger soft surface, with a danger placeholder. (An empty checkbox or radio keeps its canvas-toned well.) | passive cards, buttons |
| `handle` | a small value-control part that must remain findable, even disabled | large surfaces |
| `acrylic`, `acrylicDense`, `acrylicHero` | anchored sheets, compact hints, viewport-owning overlays respectively | grounded content |

An anchored sheet carries enough of its own tone to cover content behind it, with no blur of its
own (§6): its legibility is its fill. Use the material by what the surface **is**, not by
how important its content feels.

Media uses `matteHigh` behind images and a dark neutral `media` canvas behind video.
The latter keeps unloaded frames and letterboxing deliberate in either theme; it is not a
general-purpose dark surface for cards or controls. The frame takes `shape.surface`
and clips its contents; constrained media fits inside that frame without changing the
source's semantics. Video defaults to its source ratio and containment, never implicit cropping.

A code well is the `matteHigh` step too, sunk beneath the block's `recessedTop` wall, so it reads as a
recess on a card and on the page alike. Its tone is a quiet step over the card, not a translucent wash.

## 5. Elevation

| Recipe | Use | Not for |
| --- | --- | --- |
| `flat` | grounded passive surfaces | a recessed track |
| `raised` | tactile tonal actions at rest | hover or passive data |
| `control` | switch thumb, a puck held in a track, or a held selection inside a list or calendar | keyboard highlight |
| `recessed` | grooves, tracks, a checkbox or radio at rest, and a raised control while pressed | fields or flat cards |
| `recessedTop` | the upper wall of an inset sheet continuing directly below a control, without a lower rim | standalone tracks or wells |
| `well` | a checkbox or radio while it is pressed: the floor sinks, the boundary stays | a resting mark, a wide groove |
| `floating` | real overlay surfaces | anything in document flow |

Actions follow one depth ladder: a text action sits flat, and tonal and filled actions are
`raised` at rest and `recessed` while held. `raised` carries the light model's lit upper lip — one
inset line of `light-top` — so a filled action reads as a key rather than a flat swatch; `control`
adds a half-pixel contact edge so a white puck keeps its outline on a pale track; and
`floating` holds a hairline contact edge (an umbra line in light, a line of light in dark) so a
white sheet over a white card never loses its boundary. These lines belong to the elevation, not to
the component: no component draws a rim to separate a surface. The priority action is never flatter than the
secondary one beside it, so depth never contradicts the fill hierarchy. `raised` is a contact
shadow, not a float: a row of raised actions sits on the page. `raised` and `floating` also draw a
system-coloured outline under forced colors (§14), because forced colors removes the shadow that carries
their boundary.

Held choices take `elevation.control`, and their fill depends on what holds them. **A choice
held in a track is a puck**: the selected segment of a ToggleGroup or SegmentedControl, the Tabs
indicator and a value chip in a multiple Combobox's field tray take `puck` — the one surface lit above every sheet in both themes — and the label takes
the variant's text tone, so the lift says "this one" and the colour says which family it belongs
to. **A choice held in a sheet is a tint**: options, tree rows, calendar days and time readings
combine `tone.selected` with the same elevation, because a list sheet is already the brightest
surface and a white row on it would vanish. A continuous date range makes one band per week rather than
seven separately elevated cells. The mark itself, a check or a date, remains another
selection signal. Navigation-only current rows and unselected commands stay flat. An empty
selection mark is identified by its rim (§8), not by its depth: depth alone cannot reach 3:1
on a 20px mark without turning it into a shaded orb.

## 6. Acrylic

`acrylic` belongs to Select/Combobox lists, menus, popovers and floating status surfaces;
`acrylicDense` to compact hints; `acrylicHero` to dialogs and edge-attached drawers. The
large sheet is calmer and more self-contained than the small one; the scrim separates it
from the page. Retune acrylic at the theme owner, never by giving one popup a custom blur
or fill. Cards, tables and fields stay matte.

The glass carries **no backdrop filter**. Every presence recipe animates the popup node itself, and a
backdrop filter on an animated node re-blurs the page on every frame (§12). The glass fills are 98 to 99%
opaque, so the blur they had showed only a percent or two of the page behind. Only the plane behind a
viewport-owning surface blurs, and that plane is the scrim (§7).

## 7. Floating shells

| Shell recipe | Surface |
| --- | --- |
| `overlay.popup` | rounded anchored option list or structured popover |
| `overlay.menu` | tighter command list |
| `overlay.tooltip` | short dense hint, not a capsule control |
| `overlay.toast` | independent floating status |
| `overlay.sheet` | viewport-attached Drawer, square at the attached edge |
| `overlay.dialog` | free-floating Dialog or AlertDialog |
| `overlay.scrim` | the plane behind a viewport-owning surface; its blur sits on the plane and its tint is the plane's `::before`, which is what fades (§12) |

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
edge. **Never outline a filled control or a card just to distinguish it.**

**A hollow control carries a rim.** The file drop target and an empty checkbox or radio have no
content that says what they are, and no neutral fill step or depth reaches the 3:1 a control's
boundary needs. Each carries one 1.5px rim in the `rim` tone, tuned to clear 3:1 by a small margin
and no more. The rim is the only border a control has, and it belongs to the hollow state only.

**A text field is not hollow, and draws no line.** Its label names it, and its value or
placeholder and its parts — a chevron, a clear target, a calendar glyph, a stepper — show what it
is and where it is. WCAG 1.4.11 asks for 3:1 only from the visual information that is *required*
to identify a control, and a field identified by its label and content needs no 3:1 edge. A drawn
underline or box on every field is what made a form read as a stack of ruled inputs; the tray
alone says "something goes here".

- the tray is opaque `surface-high`, the same on a card and on the page; the pointer, focus and an
  open popup sink it to `tray-deep`, and the focus ring (§14) is what says the field is engaged;
- an invalid field is the danger tray — the danger soft surface — with a danger placeholder and the
  message beneath, which carries the error in words;
- `rim.field` is a transparent border on every side: forced colors discards the tray and repaints
  the border in a system colour, so a field there keeps its whole outline;
- a bare text field with no placeholder and no part is the one field its tray alone identifies:
  give it a placeholder or a part where the form allows, and never place it where the tray is lost
  (on a `surface-high` fill);
- a selected checkbox or radio is identified by its accent fill, and its rim fades into it;
- a surface choice row (§11) has no visible rim in any state: the mark it houses says which row
  is chosen, and its transparent overlay keeps the row's outline in forced colors;
- the drop target's rim is dashed (`rim.dashed`): a 7px mask over its own overlay, never the
  platform's `dashed` style, so the rhythm is fixed and the dashes follow the `control` corner.

When not to use it: a button, chip, card, alert, tab or segment — anything identified by its
fill, its label or its position in a track. A Switch track and a slider groove are identified by
their thumb and range, so they keep no rim.

## 9. Shape

| Role | Radius | Use |
| --- | --- | --- |
| `mark` | 6px | 20px checkbox box |
| `row` | 8px | command-density row, compact segment, navigation row or short hint |
| `control` | 12px | fields, alerts, tables, segment tracks and full-width option rows |
| `prominent` | 16px | tab tracks, code wells and compact floating status |
| `surface` | 20px | cards, panels and spacious anchored sheets |
| `sheet` | 12px | exposed corners of a viewport-attached Drawer |
| `expressive` | 24px | a dialog floating free of all edges |
| `pill`, `circle` | full | content-width actions, chips and badges; square round targets |

**A capsule acts; a rounded rectangle holds.** Buttons, chips and badges are pills; a segment
inside a track takes its track's nested corner instead.
Fields, alerts, tables and sheets are rounded rectangles clearly short of a capsule at their
own height (`control` is a quarter of a 48px field), so a field never reads as an almost-button
beside a real one. The container corners are deliberately crisp: the contrast between a soft
capsule that acts and a precise rectangle that holds is the library's silhouette. Do not give a container a pill, and do not give an action a container corner.

Choose shape by the object's own extent. A field radius on a 24px square would make it
a circle; a dialog radius on a drawer attached to the viewport would make the drawer
look like an oversized card. Nested corners are concentric: the inner radius is the outer
radius minus the inset between them. A compact segment nests its 8px `row` corner in a
12px `control` track at 4px; a normal tab nests 12px `control` in 16px `prominent` at 4px; an option
nests `control` in a 20px `surface` list sheet at 8px; a time reading nests `row` in the date popup's
`surface` sheet at 12px. Pagination is a recessed segmented track with
rounded-rectangle targets; its current page is a navigation destination (§10), so it is flat.
Do not use literal radii or invent per-theme corner offsets in components.

**A sheet's inset follows from its corners.** A sheet that holds rows insets them by its corner
minus theirs, so the two curves stay concentric: a Select or Combobox list is 8px (20 − 12), the
date popup 12px (20 − 8) and a Menu 4px (12 − 8). A sheet that holds content rather than rows —
a Popover, a Card — insets it by at least its own corner (Popover 20px, Card 24px), so copy never
sits inside the curve. A list's row then carries the remainder of its field's text inset: 8px of
sheet and 12px of row put every option label on the trigger's own 20px edge, so an open list
reads as the field opening rather than as a second surface beside it.

## 10. Tonal hierarchy

There are **two readable text roles**: `text.high` for labels and values, `text.medium`
for descriptions, placeholders and supporting copy. `detail.mark` and `detail.fill`
are non-text furniture roles, never a third step for readable text. Surface tones
(`canvas`, `surface`, `surface-high`, `tray-deep`, `surface-float`, `puck`) are not elevations.
`tray-deep` belongs only to a text field under the pointer or engaged (§8). `puck` is the
brightest surface in both themes and belongs only to a choice held in a track (§5).

| Tone | Meaning |
| --- | --- |
| `text` | foreground on a quiet row or link |
| `soft` | restrained tinted information, alert, badge or quiet card |
| `tonal` | matte tactile control fill |
| `selected` | a held choice, not a hover or a location in navigation |
| `strong` | priority action or a semantic mark with sufficient contrast |
| `strongChecked` | a strong fill driven by the primitive's checked marker |

Each semantic role has three authored values: its foreground (the role token itself), a
**soft** container (`--sui-<role>-soft`) that tonal controls and soft surfaces are made of, and
a **selected** step (`--sui-<role>-selected`) one rung stronger. Soft and selected surfaces are
designed values, never a fraction of the foreground: the foreground is tuned for text contrast,
and a fraction of a deep accent is a greyed version of its hue. The neutral soft step is a step
*within* its container (`surface-high` over whatever holds it), so a neutral badge or tag stays
visible inside a card; a neutral card itself is the matte surface.

Supporting copy inside a row that holds a selection takes full ink (`selectableRowSupporting`):
`text.medium` is measured against resting surfaces and falls just short of 4.5:1 on the selected
step, so the supporting type step, not a dimmer tone, keeps it subordinate there.

Primary marks interaction, and danger/warning/success carry meaning rather than decoration.
**Spend iris where the reader acts, not where they read.** Passive information is neutral by
default: an Alert rests on the neutral soft surface with only its status mark in the accent, and a
Badge is neutral. A semantic variant is chosen because the colour says something, never to make a
passive surface stand out; a tinted Card says something about its content. Iris then remains what
it is in the thesis — the priority action, a made selection, a value's range and the focus ring.
`--sui-accent` and `--sui-outline` are reserved: they are published for compatibility, no
component consumes them, and a new use needs a role written here first. Semantic color belongs to the relevant icon,
control or small region, not a whole table or page. Readable copy on passive semantic
regions keeps normal text emphasis.

**Where the reader is differs from what they chose.** A navigation destination stays flat and
takes `currentDestination` in one of two forms. A row on a sheet — a current navigation row —
takes `currentDestination.row`: the primary soft container, full ink and a touch of weight. A
destination inside a recessed track — a pagination's current page, a Stepper's current mark —
takes `currentDestination.inTrack`: the soft step is the groove's own lightness, so there the fill
steps up to `selected` and the label takes the accent, and the label, not the fill, says "you are
here". A text trail marks its location with ink and weight alone: a Breadcrumb's last item is the
page, not a row, and takes no fill. A Stepper's track segment is the workflow's range, not its
location, and keeps the range's fill. A held
value takes `tone.selected` with `elevation.control`. Tabs are the one deliberate exception:
a tab list is a held choice of *view* inside a recessed track, so its indicator is the same puck
a segment is, and it is sized as a tab (normal density) rather than a segment.

### Type roles

Text takes a **role**, not a size chosen per component. The roles live in `type` in
`ui.common.ts`; a component owns only copy that no other family renders.

| Role | Size / line | Use |
| --- | --- | --- |
| `control` | by density (§13) | a control's own label or value; an option row matches the field that opened it |
| `label` | 14 / 20px medium | the name above a control (`fieldLabel`), a progress label, a column header, a calendar's month |
| `body` | 14 / 24px | a sentence inside a component: an alert, a toast's description, a dialog's description and content, an open disclosure panel |
| `supporting` | 13 / 20px | field descriptions, hints and errors (`fieldMessage`), a row's secondary line |
| `caption` | 12 / 16px | badges, group labels (an option group's heading is `list.groupLabel`), calendar weekdays, a code language label |
| `title` | 16 / 24px semibold | the heading of a compact surface: card, popover, toast, command palette |
| `heading` | 20 / 28px semibold | the title of a viewport-owning surface: dialog, alert dialog, drawer |
| `numeric` | 14 / 20px, tabular figures | table cells, a number field, progress and pagination values |

A command palette is a utility surface whose content is its search, so it takes `title`, not
`heading`. A title is one step above the 15px control text it usually sits over, so it reads as a
heading by size and not by weight alone. Long-form Markdown keeps its own reading rhythm; `body` is
the rhythm of copy *in* an interface. Headings balance their lines (`text-balance` on `title` and `heading`), and running copy avoids a
one-word last line (`text-pretty` on `body`, `supporting` and `caption`). The roles carry both, so no
component sets its own wrap. A figure carries its own 14px size in the `numeric` role, so a table cell,
a stepper value or a time reading writes no size of its own. Every role lands on a whole-pixel line box. Sans text inherits the host typeface
(the library is tuned for a neo-grotesque such as Inter and never sets one); code uses the
`--sui-font-mono` stack.

## 11. Interaction states

Hover is a tonal step over the resting fill. `stateLayer.quiet`, `tonal`, `filled` and
`track` composite the response without replacing that fill. Hover is a pointer response: every `hover:` step
compiles inside `(hover: hover)`, so a tap on a touch screen leaves no hover tone behind, and a touch
answers with press and focus instead (§12). A part embedded in a field — a
combobox's clear and trigger, a number field's steppers, a search field's submit, a date field's
calendar glyph — takes `stateLayer.fieldPart`: a 32px circle centred in its target, so the hover
never paints a column the height of the field. Two parts side by side are 32px wide
(`density.part`) and read as one cluster. `activeRow` makes keyboard
highlight equal to pointer hover on a collection row; keyboard focus also adds the inset
ring. Disabled rows lose interactive hover/press but remain discoverable by keyboard when
the primitive permits it, so a disabled highlighted row still shows navigation.

A raised control recesses while held; a flat or floating one retains its depth and
answers with the pressed state layer plus tactile motion. A neutral (`secondary`) tonal fill
takes the lighter `stateLayer.tonalNeutral` press: its label is ink, and a full ink veil on top
of the recess and compression turns the control a flat grey for the length of the click. Disabled controls keep resting
anatomy and take **one** 45% opacity step, with no pointer affordance. A control that stays focusable while disabled
sets `aria-disabled="true"` and takes that same single step, so it dims once. A **busy** control — a
loading button or icon button — keeps full strength and keeps its focus: `aria-busy="true"` (`state.busy`)
gives it the progress cursor and withholds its hover layer and its press, and the spinner in its slot is
what says the work is running. It stays focusable and carries `aria-disabled="true"` as well, so it keeps its place in the tab order while its click stays blocked. Its label is never dimmed while it works. `state.disabledRow`
reads the disabled marker on a nested control; `disabledPart` avoids dimming a part twice
inside an already disabled field. A focus ring never substitutes for the state response.

All text fields share one tray and draw no line. Hover sinks the tray to `tray-deep`; focus or an
open popup holds the same step and adds the focus ring, so an engaged field cannot fall back under
the pointer. Invalid fields hold the danger tray through every state, including validity inherited from Base Field. Only list-opening Select and Combobox fields compress on activation, and only
by the gentle field tier (§12); typing
and focus never compress an ordinary Input or Textarea. Date entry is native and its
separate calendar glyph, not its text field, owns the popup press.

Checkboxes, radios, switch tracks and slider grooves retain their boundaries through state
changes. Their selection fills or marks arrive **inside** the boundary; switch thumbs move, but
tracks do not bounce. A checkbox or radio is a 20px mark: empty, it is a well with a rim; hover
lifts the rim and lays the light `stateLayer.mark` step inside it; a press sinks it to the
`well` rung without moving it; checked, mixed and selected marks are the strong accent edge to
edge, flat, with a tick, a minus or a light dot. The accent belongs to a slider's range;
its matte handle remains separable from that range, including when disabled.

Chips and ToggleGroup segments both hold selection: an unselected toggle stays neutral,
a selected chip uses the primitive's pressed marker and `tone.selected`, and a selected segment
is the track's puck (§5). A segment's selection
changes **in place** — the old fill and the new one exchange on the feedback timing — while a
tab indicator **relocates** across its track. The difference is deliberate for now: Base
`ToggleGroup` publishes no indicator geometry, and measuring segment positions locally would be
the second behaviour layer §16 forbids. A travelling segment indicator waits on that Base gap. The gap is the same for tabs: Base `Tabs.Indicator` publishes only
`data-activation-direction`, which persists after a selection, so the tab indicator also travels when the tab list
is resized. No selection-only attribute exists yet, and the indicator keeps its transition until Base publishes one.
A chip floats
on its own; a segment sits inside a track. A passive tag stays flat, and only a passive
tag may have an independent dismiss target. Select/Combobox options hold choices and may
rise. A Select's unselected check mark holds its slot at zero opacity, so a choice made while the list is open
springs in beside its label without moving that label; Menu commands perform actions and stay flat. They share row hover/highlight and
inset keyboard focus, but their row density differs. A destructive command tints its
own label, not the whole menu sheet. A quiet target whose label rises on hover and on keyboard focus, such
as a dismiss glyph, takes `state.quietInk`: its ink rises from `text.medium` to `text.high`, and no state
layer is drawn behind it.

RadioGroup's opt-in surface rows rest on the `matteHigh` tray, so every choice reads as a target
before any is chosen, and the row that holds the selection takes the primary *soft* surface and stays
flat. The mark the row houses is what says "this one"; an accent rim around the row repeated it, and
the selected step and a lift turned a whole card into an accent block that outshouted the priority
action beside it. The resting tray stays light enough
that an empty mark's rim still clears 3:1 against it.
The complete row remains the label; passive badges are consumer content. The selection mark and
target boundary stay still, and the original plain radio rows remain available. Surface selection
is not a new card or option-content framework. `CheckboxGroup` is the same row with a checkbox
mark: one anatomy (`choice-row.tsx`) serves both, so a radio card and a checkbox card cannot
drift. A choice's `description` is supporting copy on the row: the label names the control and the
description describes it, so a reader hears "Aurora Casino, checkbox, aurora.example" rather than
one run-on name, and a press on the supporting line still makes the choice.

An option list may be filed under headings — channels under their category. A heading is a
`caption` in `text.medium` at the option's own start edge (`list.groupLabel`); it takes no state
layer, highlight or focus because the reader never lands on it, and the primitive names the group
from it. Groups are separated by the space above each heading, never by a rule or a nested sheet.
An option outside every group is listed where it stands, as Discord lists an uncategorised
channel above the first category.

A multiple Combobox holds its chosen values as chips inside the field. A value chip is a held
choice riding in the field's tray, so it is the tray's puck — the white (dark: lifted graphite) pill
at `elevation.control`, full-ink copy; a neutral tonal pill is the tray's own tone and a row of them
reads as one band — at 28px so one line of chips rides the field's
48px resting height; more chips wrap and the field grows downward rather than squeezing the query.
Once chips lead the field, its start inset drops to the chips' own block inset. The dismiss target
is a 24px circle nested at the chip's 2px end inset, its glyph takes the press, and a read-only or
disabled chip has none. When the arrow keys walk into the chips the focused chip wears the inset
ring inside the field's own ring. Choosing keeps the list open, so several values are chosen from
one opening. A creatable list leads with an "Add" row for text that names nothing yet, adds one
entry per pasted line, and refuses a duplicate with a supporting-tone report under the field
rather than doubling it or quietly removing the existing value.

A unit beside a value — `€ 0.10`, `15 ×`, `2 × tickets`, `https://` — is supporting copy at the
value's own size in `text.medium`: quieter than the value, never smaller. In a NumberField the
value and its units are one centred figure, so the input is exactly as wide as its text; in an
Input the affixes sit at the field's ends. A press on a unit places the caret in the value.

Accordion and Collapsible share the same disclosure row and supporting-copy panel; a TreeView
branch opens its group through the same measured panel and the same `disclose` motion.
The chevron describes the whole region, so it stays centered on the row even when the
label wraps. Only the panel height and chevron orientation change; sections do not
animate their copy or grow a new rim.

## 12. Motion

One module, `ui.motion.ts`, chooses timing, easing and amplitude by **intent**:

| Intent | Use |
| --- | --- |
| `feedback` | non-spatial tone, focus and highlight |
| `tactile` | press/release in three amplitude tiers by role; compact mark-only press when its target must stay still |
| `arrive` | a newly made selection mark; the sole restrained spring |
| `orient` | chevron turning in place |
| `relocate` | tab indicator or switch thumb traveling between stable destinations |
| `direct` | pointer-owned slider geometry without interpolation |
| `disclose` | measured in-flow panel height |
| `presence` | popup, tooltip, modal, sheet, toast and scrim entrances/exits; a surface opened from the keyboard takes the quick utility tier (`motionPresenceUtility`) |
| `activity` | spinner, skeleton or indeterminate progress; under reduced motion it keeps an opacity loop |

A component decides **what** changes; motion decides **how** it moves. One node has one
spatial owner, though feedback may accompany it. A pointer's target never moves beneath
it: small dismiss and stepper glyphs compress inside stable hit areas. Boundaries of
checkboxes and radios stay still. Stable selections do not bounce, while a mark being
made may spring. A dragged handle follows the pointer without lag. Base owns overlay
lifecycle and placement; Sherick adds no exit timer or parallel presence state. Under
reduced motion, states remain visible immediately and spatial travel is removed; a
loading glyph keeps its loop as an opacity change. Do not author literal duration/easing/transition/animation
classes or keyframes in components.

A press answers inside a tap: its leg runs on the short `duration-tactile` (80ms), and the
release settles on the release timing. Its amplitude is a distance, so it is chosen by role
rather than written as one percentage for every width: a content-width control compresses 4%
(`motionTactile`), a control spanning a track such as a tab 1.5% (`motionTactileWide`), and a
list-opening field 0.7% (`motionTactileField`), which keeps every tier near two pixels per edge.
A content-width control stretched to its container (`w-full`) is no longer content-width and takes
the wide tier. A ghost IconButton shows only its 20px mark, so the mark takes the press
(`motionInkPress`) and the 44px target stays still; a tonal or acrylic IconButton is a visible disc
and presses like a button.
Rows — navigation, options, commands, disclosure and tree rows — answer with tone, not
compression. A row's highlight moves in one step (`motionRowLayer`): it marks where the
reader is, so arrowing through a list never leaves a fading trail.

Duration grows with travel in two steps. An indicator crossing a whole track takes
`motionRelocateLong` (`duration-travel`, 300ms), and a sheet crossing a viewport edge takes the
sheet timing (320ms in, 200ms out); short travel keeps the local and overlay timings. Every exit
accelerates away on `ease-exit`, including a disclosure panel closing. A known progress value
relocates to its new width rather than jumping.

The scrim fades with the surface it sits behind; it never appears or disappears in one frame. Its blur
sits on the plane, and only the tint fades, on the plane's own `::before`; under `(pointer: coarse)` the
blur is dropped altogether.

**Budget.** A presence recipe never animates a node that carries `backdrop-filter`: every frame of that
animation re-blurs the page behind it. A tooltip that Base opens during its warm-up (`data-instant`,
because another tooltip has just closed) takes no timing at all, so the next hint is already where the
reader moved to.
A tooltip opens after a 500ms hover delay and closes at once, so a pointer passing over a row of
icons does not flash a hint for each. The three activity loops share one rhythm authored in
`tokens.ts`: a spinner turns once a second, a skeleton breathes once every two turns, and an
indeterminate bar sweeps on its own paced loop. Under reduced motion each loop becomes its opacity form:
the spinner breathes on a two-second loop (`motionActivitySpin`), a skeleton pulses at half its amplitude,
and an indeterminate bar holds at the full width of its track and breathes
(`motionActivityIndeterminateReduced`). Reduced motion removes travel and rotation, never the signal that
work is running.

Known gap: an in-flow removal — a dismissed Alert, a removed tag Chip, a removed value chip, a
removed file row —
leaves in one frame, and the content below closes the space at once. Base provides no presence
lifecycle for in-flow lists, and components add no exit timers of their own, so this stays a
documented gap rather than a local fix in one component.

## 13. Density and iconography

| Step | Minimum height | Type | Use |
| --- | --- | --- | --- |
| `compact` | 2.5rem | 0.875rem | dense actions and rows |
| `normal` | 3rem | 0.9375rem / 1.375rem | default fields and controls |
| `prominent` | 3.5rem | 1.125rem | larger actions |
| `target` | 2.75rem square | inherited | standalone icon-only hit area |
| `part` | 2.75rem high, 2rem wide | inherited | embedded part of a composite field |

Density owns control height and type scale; each component owns its own padding. The
embedded `part` is narrower than a standalone target because its surrounding field is
already the larger target. Do not make an icon-only standalone button use `part`, shrink
hit targets for phone layouts or create a fourth size step to solve a local spacing issue.

A leading or trailing mark takes the `iconSlot` for the type step beside it: 16px beside a
14px label (`compact`), 20px beside 15px (`normal`), 24px beside 18px (`prominent`) and 14px
beside a 12px caption. An icon-only target keeps its own 20px mark inside the 44px target. `iconSlot` is the only sizing source for
such a mark: a command row takes `list.commandIcon` (16px beside its 14px label) and a disclosure row takes
`disclosure.chevron` (20px beside 15px). One exception is recorded: the Alert status mark is a 20px
first-line mark beside 14px copy, because §17 aligns it to the first line of wrapping copy, so it takes the
normal slot. If review rejects that exception, the mark becomes 16px.

### Surface insets

A surface's inset is component anatomy, but surfaces of one role share one inset. The inset grows
with how much a surface holds and how long it is read:

| Surface | Inset | Why |
| --- | --- | --- |
| `Menu` | 4px around its rows | the rows carry their own padding; the sheet only frames them |
| `Tooltip` | 12px inline, 8px block | one short hint, read at a glance |
| `Alert` | 16px inline, 14px block | a status in the page flow, kept slimmer than a card; a one-line alert is 52px high |
| `Toast` | 16px | a brief message beside the work, not over it |
| `Popover`, `CommandPalette` | 20px | an anchored or command sheet that holds a few parts |
| `Card` | 24px | a matte surface that groups a section of a page |
| `Dialog`, `Drawer`, `AlertDialog` | 24px inline (28px from `sm`), 20px top and bottom | a modal surface read in full; the header reserves 64px at its end for the dismissal target |

`Drawer` and `AlertDialog` build on the dialog's own header, description and footer, so the three
cannot drift apart. A footer after a padded `DialogContent` opens 4px above itself, because the body
already gives 20px; after a description or a sheet's own content it opens 16px. Do not invent a new
inset for one instance; choose the role in this table that the surface plays.

**Header rhythm.** A title and the supporting line beneath it are one gap apart, and that gap is the only
one between them: `headingRhythm.title` (4px) for a title-role surface — a card, a popover, a toast or a
command palette — and `headingRhythm.heading` (8px) for a dialog, alert dialog or drawer heading. The gap
sits on the supporting line, and no header takes its own padding on that edge. A command palette takes
the Popover corner (20px) and the Popover inset, because it is an anchored sheet of a few parts.

### Iconography

The library draws one family, Hugeicons' stroke set, and holds it to three rules.

- **One rendered stroke.** The artwork is drawn on a 24-unit grid, so a stroke written in its own
  units renders thinner as a slot shrinks: the same set measured 1.0px in a 16px dismiss and
  1.25px in a 20px close. Every glyph the library draws takes `iconStroke.glyph`, a 1.5px stroke in
  screen pixels at every slot, close to the stem of the medium label beside it. The tick and minus
  inside a filled checkbox take the slightly heavier `iconStroke.mark` (1.75px), because they *are*
  the selection mark on the strong accent rather than a hairline drawn on it. Artwork a consumer
  hands into a slot keeps its own weight.
- **One vocabulary.** A chevron moves *through* a sequence — paging, months, crumbs, tree branches,
  disclosure — and turns in place to say open or closed. A stemmed arrow *leaves*: an external
  link, a step out of the current flow. One meaning takes one glyph: information, success and
  danger are circled marks, and warning is the triangle in every feedback surface, so its
  silhouette differs from its neighbours before its colour does.
- **Two dismiss marks, one target.** A dismiss inside a compact surface or control — a chip, an
  alert, a toast, a combobox's clear — is 16px; a standalone close that owns a full 44px target — a
  dialog's close, a file row's removal — is 20px. Both keep the 44px target, so only the mark changes size; `DismissButton`
is the one internal implementation of that rule.

When not to use: do not draw a second icon family, do not set a per-icon `strokeWidth`, and do not
use a stemmed arrow for paging.

**An IconButton's vocabulary.** An IconButton takes a `size` and an `appearance`. `size` is `target` (the
default: a 20px mark in the 44px target) or `compact` (a 16px mark in the same 44px target, beside 14px
copy). `appearance` is `tonal` (the default, a raised disc), `filled` (a strong fill, for the one priority
action in a view), `text` (a flat target whose name is `text`, as a Button's is; it replaces `ghost`) or
`acrylic` (a floating disc). An icon-only target never shrinks below the 44px floor, whatever its mark.

## 14. Accessibility and focus

A 2px `--sui-focus` ring is the visible focus language. `focusRing` surrounds a
standalone target, `focusRingInset` stays within a row or track, `focusRingWithin`
follows the input in a composite field, and `groupFocusRing` follows a wrapping control.
`focusRingHeld` keeps Select's trigger visibly engaged while its open list has DOM focus;
`parentFocusRingInset` traces only a tree item's direct row, not its descendants. A
plain text field follows the platform's `:focus-visible` on pointer *and* keyboard
focus; button and slider focus rings normally appear for keyboard focus. No second
ring is drawn inside the field.
A file drop target uses that same outline with a soft primary tonal fill while a file is
dragged over it, and its dashed rim takes the primary tone.

An icon-only action needs an accessible name independent of its tooltip, and a 44px
standalone target. Checkbox/radio marks keep a 20px visible footprint while a transparent hit
area reaches that floor; surrounding rows still need clearance. Labels,
errors and descriptions keep their Base Field relationships; Base primitives own ARIA,
keyboard mechanics, form participation and restoration where available. Forced colors
replace lost tone/depth with system-color boundaries for selection, highlight and focus. A Switch track takes
`forced-colors:border`, and its thumb opts out of forced-color adjustment and paints `Highlight` in both states; a rim is
a real border (or a masked fill with a system colour), so hollow controls keep theirs. A shell that separates by depth alone carries its boundary in its recipe:
`elevation.floating` and `elevation.raised` both include `forcedBoundary`, a system-coloured outline, so
overlays and raised actions keep their edge. A control that draws no outline of its own writes
`[outline-style:none]`, never `outline-none` or a bare `outline-0`: a transparent two-pixel outline is
painted as a box in forced colors, and a zero width does not stop the browser's own `:focus-visible`
ring, whose `auto` style ignores width. A style of `none` paints nothing in either mode.
The measured AA contrast contract covers both themes, text/semantic/focus compositions,
small marks and state layers; see [PALETTE.md](PALETTE.md) and [VERIFICATION.md](VERIFICATION.md).
Color alone never identifies meaning.

A unit beside a value is presentation and is hidden from assistive technology, so the field's
label names the unit ("Price per ticket (€)"). A form reports errors where they are: on submit,
focus moves to the first invalid field in document order, whose error is part of its description,
and an error returned by a server does the same. A status a combobox reports while its list is open
is made from inside the list, because the primitive hides everything outside an open list.

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

Before a rule is accepted, check it against this list:

- a shell or a raised action has its forced-colors boundary in its recipe, and no resting control uses
  `outline-none` or a bare `outline-0`;
- a hover response is written with `hover:` (pointer only), and a touch answers with press or focus;
- a presence recipe animates no node that carries `backdrop-filter`;
- an activity loop keeps an opacity form under reduced motion;
- a mark, a dismiss or a command icon takes its size from `iconSlot`, never from a literal size.

## 17. Optical balance

Center the **visible mark** within its slot and keep the target, state layer, focus ring
and hit area concentric. Compensate target padding by placing the *whole target* within
its parent, not by nudging the icon under the pointer. Slots fix an icon's box size so
an icon-to-spinner substitution does not alter a button's width. Align a status mark
or dismiss target to the first readable line of wrapping copy; a disclosure chevron
instead belongs to its whole row. Leading and trailing marks can need different
logical padding even when a text-only control is symmetric. Write asymmetry in logical
start/end properties so RTL reads equally well. A text action that shares an edge with text — a table cell's
action under its column header, a toast action under its copy — **hangs** its inline padding
outside that edge (a negative start margin equal to its padding), so its label, not its hit
area, lines up with the text. Code wells alone remain LTR. A row with a hover or selection fill hangs the same way. A TreeView row hangs its fill into the list's own padding, so the label aligns with the title beside it; a Stepper keeps each step's padding inside its own box, because a step list has to fit whatever column it is given (§19); an Accordion join is the top border of each section after the first, with no hang of its own. A disclosure row
hangs its 16px inset past both edges of its column, and its panel hangs with it, so the label, the
chevron and the copy it opens share the edges of the content beside them. Its parent owns at least
1rem of padding on each side for the fill to reach into; flush against a viewport edge, the row
would scroll the page. A table's cells and the table's
scroll wrapper hang likewise, and the wrapper keeps its own overflow. A local
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
date input remains editable and its calendar is an anchored popup. Chips inside a multiple
Combobox wrap within the field, and a long chip truncates rather than widening it. A file chooser shows
one affordance, constraints once, selected files as quiet rows, and visible rejection
feedback; it does not invent upload progress.

An overflowing track — Tabs, ToggleGroup, SegmentedControl — says that more lies beyond its edge with an
edge fade on that side, so the cue belongs to the track and is not a control. A table's end edge gets no
such cue: that was considered and declined (audit item 4.5), and a table says it scrolls through its own
scroll wrapper alone.

## 20. Composition

The language above governs objects; these rules carry it to pages. They are guidance for
consumers and for the repository's own examples, not new primitives.

- **A surface sits on canvas.** A card is a matte surface on the canvas. Do not nest a card in a
  card to group content: inside a surface, group with spacing, a type role and an `edge.rule`.
  Specimens of surfaces are shown on a canvas band, not inside another card.
- **Headings step down, never up.** A page heading, then a section heading, then the surface's
  own title — `Card.Title`, `Popover.Title`, a dialog's header — which sets the `title` or
  `heading` role for you. A heading inside a surface is never larger than the surface's title;
  below the title, label a group with a smaller medium-weight line, as a NavGroup does.
- **A setting row.** A binary setting puts its label and description at the start and its
  Switch at the end of one row, rather than a switch alone on a line beneath its label.
- **A filter bar.** Filters, and the sort that orders their result, share one row of fields
  aligned on their bottom edge. A result count and a "clear" action sit on the line below,
  aligned with the content they describe. An action among fields is still an action: it keeps
  its capsule and its depth.
- **A form.** Fields stand in one column (`Form`), each with its label above and its message
  below, and a unit named in the label. The submit action closes the column; it never answers a
  press with nothing — the first invalid field takes focus.
- **Actions.** One filled action per view. Secondary actions are tonal or text; a text action
  that shares an edge with text hangs its padding (§17). Status beside the action — an Alert, a
  Badge — stays neutral unless its colour carries meaning (§10).
- **Page backgrounds are full-bleed.** A page's canvas reaches the viewport edges and its
  content is centred within it; a column with its own background leaves a seam against the host.
