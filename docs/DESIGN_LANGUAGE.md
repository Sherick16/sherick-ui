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
| `control`, `controlError` | text fields, the file drop target and the interior of an empty checkbox or radio: a **well** in the canvas tone, which sits below a card in both themes, so an input reads as sunk into its surface rather than as a pad raised from it; the invalid form changes only its placeholder tone | passive cards, buttons |
| `handle` | a small value-control part that must remain findable, even disabled | large surfaces |
| `acrylic`, `acrylicDense`, `acrylicHero` | anchored sheets, compact hints, viewport-owning overlays respectively | grounded content |

An anchored sheet carries enough of its own tone to cover content behind it; blur enriches
it but does not establish legibility. Use the material by what the surface **is**, not by
how important its content feels.

Media uses `matteHigh` behind images and a dark neutral `media` canvas behind video.
The latter keeps unloaded frames and letterboxing deliberate in either theme; it is not a
general-purpose dark surface for cards or controls. The frame takes `shape.surface`
and clips its contents; constrained media fits inside that frame without changing the
source's semantics. Video defaults to its source ratio and containment, never implicit cropping.

## 5. Elevation

| Recipe | Use | Not for |
| --- | --- | --- |
| `flat` | grounded passive surfaces | a recessed track |
| `raised` | tactile tonal actions at rest | hover or passive data |
| `control` | switch thumb or a held selection inside a track, list or calendar | keyboard highlight |
| `recessed` | grooves, tracks, a checkbox or radio at rest, and a raised control while pressed | fields or flat cards |
| `recessedTop` | the upper wall of an inset sheet continuing directly below a control, without a lower rim | standalone tracks or wells |
| `well` | a checkbox or radio while it is pressed: the floor sinks, the boundary stays | a resting mark, a wide groove |
| `floating` | real overlay surfaces | anything in document flow |

Actions follow one depth ladder: a text action sits flat, and tonal and filled actions are
`raised` at rest and `recessed` while held. The priority action is never flatter than the
secondary one beside it, so depth never contradicts the fill hierarchy. `raised` is a contact
shadow, not a float: a row of raised actions sits on the page.

Held choices combine `tone.selected` and `elevation.control`: selected segments, options,
tree rows, calendar days and time readings. A continuous date range makes one band per week rather than
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
edge. **Never outline a filled control or a card just to distinguish it.**

**A hollow control carries a rim.** A text field, the file drop target and an empty checkbox or
radio have no content that says what they are, and no neutral fill step or depth reaches the
3:1 a control's boundary needs. Each carries one 1.5px rim in the `rim` tone (`rim.field`, or the
mark's own rim), tuned to clear 3:1 on every surface by a small margin and no more, so it reads as
the lip of the well rather than as a line drawn around it. The rim is the only border a control
has, and it belongs to the hollow state only:

- hover, focus and an open popup step the rim to `ink-muted` while the well sinks a step; the
  focus ring still surrounds the control (§14);
- an invalid field turns its rim, and only its rim, to the danger tone — the fill stays the
  well, and the placeholder and message carry the error with it;
- a selected checkbox or radio is identified by its accent fill, and its rim fades into it;
- the drop target's rim is dashed (`rim.dashed`): a 7px mask over its own overlay, never the
  platform's `dashed` style, so the rhythm is fixed and the dashes follow the `control` corner.

When not to use it: a button, chip, card, alert, tab or segment — anything identified by its
fill, its label or its position in a track. A Switch track and a slider groove are identified by
their thumb and range, so they keep no rim.

## 9. Shape

| Role | Radius | Use |
| --- | --- | --- |
| `mark` | 6px | 20px checkbox box |
| `row` | 12px | command-density row, compact segment, navigation row or short hint |
| `control` | 16px | fields, alerts, tables, segment tracks and full-width option rows |
| `prominent` | 20px | tab tracks, code wells and compact floating status |
| `surface` | 24px | cards, panels and spacious anchored sheets |
| `sheet` | 16px | exposed corners of a viewport-attached Drawer |
| `expressive` | 28px | a dialog floating free of all edges |
| `pill`, `circle` | full | content-width actions, chips and badges; square round targets |

**A capsule acts; a rounded rectangle holds.** Buttons, chips and badges are pills; a segment
inside a track takes its track's nested corner instead.
Fields, alerts, tables and sheets are rounded rectangles clearly short of a capsule at their
own height (`control` is a third of a 48px field), so a field never reads as an almost-button
beside a real one. Do not give a container a pill, and do not give an action a container corner.

Choose shape by the object's own extent. A field radius on a 24px square would make it
a circle; a dialog radius on a drawer attached to the viewport would make the drawer
look like an oversized card. Nested corners are concentric: the inner radius is the outer
radius minus the inset between them. A compact segment nests its `row` corner in a
`control` track at 4px; a normal tab nests `control` in `prominent` at 4px; an option nests
`control` in a `surface` list sheet at 8px; a time reading nests `row` in the date popup's
`surface` sheet at 12px. Pagination is a recessed segmented track with
rounded-rectangle targets; its current page is a navigation destination (§10), so it is flat.
Do not use literal radii or invent per-theme corner offsets in components.

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

Each semantic role has three authored values: its foreground (the role token itself), a
**soft** container (`--sui-<role>-soft`) that tonal controls and soft surfaces are made of, and
a **selected** step (`--sui-<role>-selected`) one rung stronger. Soft and selected surfaces are
designed values, never a fraction of the foreground: the foreground is tuned for text contrast,
and a fraction of a deep accent is a greyed version of its hue. The neutral soft step is a step
*within* its container (`surface-high` over whatever holds it), so a neutral badge or tag stays
visible inside a card; a neutral card itself is the matte surface.

Primary marks interaction, and danger/warning/success carry meaning rather than decoration.
`--sui-accent` and `--sui-outline` are reserved: they are published for compatibility, no
component consumes them, and a new use needs a role written here first. Semantic color belongs to the relevant icon,
control or small region, not a whole table or page. Readable copy on passive semantic
regions keeps normal text emphasis.

**Where the reader is differs from what they chose.** A navigation destination — a current
navigation row, the current page of a pagination, any `aria-current` location — takes
`currentDestination`: the primary soft container, full ink and a touch of weight, flat. A held
value takes `tone.selected` with `elevation.control`. Tabs are the one deliberate exception:
a tab list is a held choice of *view* inside a recessed track, so its indicator is a held
selection like a segment's, and it is sized as a tab (normal density) rather than a segment.

### Type roles

Text takes a **role**, not a size chosen per component. The roles live in `type` in
`ui.common.ts`; a component owns only copy that no other family renders.

| Role | Size / line | Use |
| --- | --- | --- |
| `control` | by density (§13) | a control's own label or value; an option row matches the field that opened it |
| `supporting` | 13 / 20px | field descriptions, hints and errors (`fieldMessage`), a row's secondary line |
| `caption` | 12 / 16px | badges, group labels, calendar weekdays, a code language label |
| `title` | 15 / 22px semibold | the heading of a compact surface: popover, toast, command palette |
| `heading` | 20 / 28px semibold | the title of a viewport-owning surface: dialog, alert dialog, drawer |
| `numeric` | tabular figures | table cells, a number field, progress and pagination values |

A command palette is a utility surface whose content is its search, so it takes `title`, not
`heading`. Every role lands on a whole-pixel line box. Sans text inherits the host typeface
(the library is tuned for a neo-grotesque such as Inter and never sets one); code uses the
`--sui-font-mono` stack.

## 11. Interaction states

Hover is a tonal step over the resting fill. `stateLayer.quiet`, `tonal`, `filled` and
`track` composite the response without replacing that fill. `activeRow` makes keyboard
highlight equal to pointer hover on a collection row; keyboard focus also adds the inset
ring. Disabled rows lose interactive hover/press but remain discoverable by keyboard when
the primitive permits it, so a disabled highlighted row still shows navigation.

A raised control recesses while held; a flat or floating one retains its depth and
answers with the pressed state layer plus tactile motion. A neutral (`secondary`) tonal fill
takes the lighter `stateLayer.tonalNeutral` press: its label is ink, and a full ink veil on top
of the recess and compression turns the control a flat grey for the length of the click. Disabled controls keep resting
anatomy and take **one** 45% opacity step, with no pointer affordance. `state.disabledRow`
reads the disabled marker on a nested control; `disabledPart` avoids dimming a part twice
inside an already disabled field. A focus ring never substitutes for the state response.

All text fields share one well and one rim. Hover sinks the well a step and lifts the rim to
`ink-muted`; focus or an open popup sinks it fully, and an engaged field must not fall back to
hover strength under the pointer. Invalid fields keep that well ladder and hold a danger rim,
including validity inherited from Base Field. Only list-opening Select and Combobox fields compress on activation, and only
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
a selected one uses the primitive's pressed marker and `tone.selected`. A segment's selection
changes **in place** — the old fill and the new one exchange on the feedback timing — while a
tab indicator **relocates** across its track. The difference is deliberate for now: Base
`ToggleGroup` publishes no indicator geometry, and measuring segment positions locally would be
the second behaviour layer §16 forbids. A travelling segment indicator waits on that Base gap. A chip floats
on its own; a segment sits inside a track. A passive tag stays flat, and only a passive
tag may have an independent dismiss target. Select/Combobox options hold choices and may
rise; Menu commands perform actions and stay flat. They share row hover/highlight and
inset keyboard focus, but their row density differs. A destructive command tints its
own label, not the whole menu sheet.

RadioGroup's opt-in surface rows use the same held-choice tone and control elevation.
The complete row remains the label; supporting text and passive badges are consumer content.
The selection mark and target boundary stay still, and the original plain radio rows remain
available. Surface selection is not a new card or option-content framework.

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

A press answers inside a tap: its leg runs on the short `duration-tactile` (80ms), and the
release settles on the release timing. Its amplitude is a distance, so it is chosen by role
rather than written as one percentage for every width: a content-width control compresses 4%
(`motionTactile`), a control spanning a track such as a tab 1.5% (`motionTactileWide`), and a
list-opening field 0.7% (`motionTactileField`), which keeps every tier near two pixels per edge.
Rows — navigation, options, commands, disclosure and tree rows — answer with tone, not
compression. A row's highlight moves in one step (`motionRowLayer`): it marks where the
reader is, so arrowing through a list never leaves a fading trail.

Duration grows with travel in two steps. An indicator crossing a whole track takes
`motionRelocateLong` (`duration-travel`, 300ms), and a sheet crossing a viewport edge takes the
sheet timing (320ms in, 200ms out); short travel keeps the local and overlay timings. Every exit
accelerates away on `ease-exit`, including a disclosure panel closing. A known progress value
relocates to its new width rather than jumping.

The scrim fades with the surface it sits behind; it never appears or disappears in one frame.
A tooltip opens after a 500ms hover delay and closes at once, so a pointer passing over a row of
icons does not flash a hint for each. The three activity loops share one rhythm authored in
`tokens.ts`: a spinner turns once a second, a skeleton breathes once every two turns, and an
indeterminate bar sweeps on its own paced loop.

Known gap: an in-flow removal — a dismissed Alert, a removed tag Chip, a removed file row —
leaves in one frame, and the content below closes the space at once. Base provides no presence
lifecycle for in-flow lists, and components add no exit timers of their own, so this stays a
documented gap rather than a local fix in one component.

## 13. Density

| Step | Minimum height | Type | Use |
| --- | --- | --- | --- |
| `compact` | 2.5rem | 0.875rem | dense actions and rows |
| `normal` | 3rem | 0.9375rem / 1.375rem | default fields and controls |
| `prominent` | 3.5rem | 1.125rem | larger actions |
| `target` | 2.75rem square | inherited | standalone icon-only hit area |
| `part` | 2.75rem high, 2.25rem wide | inherited | embedded part of a composite field |

Density owns control height and type scale; each component owns its own padding. The
embedded `part` is narrower than a standalone target because its surrounding field is
already the larger target. Do not make an icon-only standalone button use `part`, shrink
hit targets for phone layouts or create a fourth size step to solve a local spacing issue.

A leading or trailing mark takes the `iconSlot` for the type step beside it: 16px beside a
14px label (`compact`), 20px beside 15px (`normal`), 24px beside 18px (`prominent`) and 14px
beside a 12px caption. An icon-only target keeps its own 20px mark inside the 44px target.

## 14. Accessibility and focus

A 2px `--sui-focus` ring is the visible focus language. `focusRing` surrounds a
standalone target, `focusRingInset` stays within a row or track, `focusRingWithin`
follows the input in a composite field, and `groupFocusRing` follows a wrapping control.
`focusRingHeld` keeps Select's trigger visibly engaged while its open list has DOM focus;
`parentFocusRingInset` traces only a tree item's direct row, not its descendants. A
plain text field follows the platform's `:focus-visible` on pointer *and* keyboard
focus; button and slider focus rings normally appear for keyboard focus. No second
ring is drawn inside the field's own rim.
A file drop target uses that same outline with a soft primary tonal fill while a file is
dragged over it, and its dashed rim takes the primary tone.

An icon-only action needs an accessible name independent of its tooltip, and a 44px
standalone target. Checkbox/radio marks keep a 20px visible footprint while a transparent hit
area reaches that floor; surrounding rows still need clearance. Labels,
errors and descriptions keep their Base Field relationships; Base primitives own ARIA,
keyboard mechanics, form participation and restoration where available. Forced colors
replace lost tone/depth with system-color boundaries for selection, highlight and focus; a rim is
a real border (or a masked fill with a system colour), so hollow controls keep theirs.
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
start/end properties so RTL reads equally well. A text action that shares an edge with text — a table cell's
action under its column header, a toast action under its copy — **hangs** its inline padding
outside that edge (a negative start margin equal to its padding), so its label, not its hit
area, lines up with the text. Code wells alone remain LTR. A local
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

## 20. Composition

The language above governs objects; these rules carry it to pages. They are guidance for
consumers and for the repository's own examples, not new primitives.

- **A surface sits on canvas.** A card is a matte surface on the canvas. Do not nest a card in a
  card to group content: inside a surface, group with spacing, a type role and an `edge.rule`.
  Specimens of surfaces are shown on a canvas band, not inside another card.
- **Headings step down, never up.** A page heading, then a section heading, then `type.title`
  for a surface's own heading. A heading inside a surface is never larger than the surface's
  title; below `title`, label a group with `caption` or a medium-weight supporting line.
- **A setting row.** A binary setting puts its label and description at the start and its
  Switch at the end of one row, rather than a switch alone on a line beneath its label.
- **A filter bar.** Filters, and the sort that orders their result, share one row of fields
  aligned on their bottom edge. A result count and a "clear" action sit on the line below,
  aligned with the content they describe. An action among fields is still an action: it keeps
  its capsule and its depth.
- **Actions.** One filled action per view. Secondary actions are tonal or text; a text action
  that shares an edge with text hangs its padding (§17).
- **Page backgrounds are full-bleed.** A page's canvas reaches the viewport edges and its
  content is centred within it; a column with its own background leaves a seam against the host.
