# Sherick UI design language

The canonical source of truth for Sherick UI's visual language. Every reusable visual
rule lives here.

Two files implement it and neither invents a rule of its own:

| Layer | File | Contains |
| --- | --- | --- |
| Recipes | `components/UI/ui.common.ts` | the named primitives a component composes |
| Tokens | `theme.css` | the values those primitives resolve to, per theme |

If this document and any other file disagree — a README paragraph, a showcase caption,
a code comment — this document wins and the other file is corrected.

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
    -> recessed depth for tracks, grooves and wells, and while pressed
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

**Do:** combine freely — `material.matteHigh` + `elevation.control` + `shape.control`
on a switch thumb.
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
the only two lighting values in the system. The elevation ladder, the pressed states and
the acrylic gradients all composite from them, so re-tuning those two values re-lights
the entire library.

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
| `matteHigh` | the second matte step | nesting inside another matte surface; the resting state of a control | a page background |
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

Primitives: `flat`, `raised`, `floating`, `control`, `recessed` (published alias
`pressed`).

Depth is chosen by **anatomy**, never by state.

| Elevation | Role | Should be used for | Should not be used for |
| --- | --- | --- | --- |
| `flat` | at rest on the page | every passive matte surface; wider surfaces such as cards | — |
| `raised` | a manipulated control lifted a hair above its own track | tactile tonal controls (`ActionButton` tonal, `IconButton`) | passive surfaces, table rows, menu rows |
| `control` | the resting half of the tactile pair | a part the user moves — a switch thumb, a selected segment | wide surfaces, or a whole segmented control |
| `recessed` | the other half of the pair | grooves, tracks and wells, which are sunk by definition | raised or resting controls |
| `pressed` | the same depth, named for the moment a control reaches it by being held | published alias only; prefer `recessed` when the surface is simply sunk | new code — use `recessed` |
| `floating` | a surface that genuinely sits above the application | acrylic overlays: menus, tooltips, dialogs | matte surfaces sitting on the page |

The tactile pair (`control` / `recessed`) is deliberately shallower than the tonal
ladder and geometry-neutral: a restrained echo of neumorphism, never a neumorphic
surface.

**Do:** let a control press back into the track beneath it — `state.recess` on a raised
control, which lands at the same depth a groove sits at.
**Do not** add depth to show hover, selection or disabled. "No control gains depth
merely to announce a state."

---

## 6. Acrylic — the floating material

Acrylic is only correct for UI that floats above the application. Three recipes exist,
and the difference between them is opacity, blur and how much of the sheet is its own
tone rather than the defocused page behind it.

- `acrylic` — menus and popups. Translucent, gradient-lit, blurred.
- `acrylicDense` — small floating surfaces (tooltips). Same sheet, higher opacity,
  because a small surface has little room to stay legible.
- `acrylicHero` — the large overlay sheet (dialogs). Markedly more opaque and calmer:
  a surface that owns the viewport must read first as a physical surface and only
  secondarily as glass. The scrim behind it does the separating, the blur only
  defocuses, and the gradient is a restrained top-to-bottom light rather than a frosted
  haze. Its tone sits above the floating surface level in every theme, which is how it
  separates in dark mode without leaning on its shadow; `--sui-overlay-fill` tunes how
  much of the sheet is its own tone.

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

## 7. Edge — structural lines

Primitives: `row` (the faintest), `header` (the heaviest), `rule` (between the two).

The hairline is reserved for **where two parts of one surface actually meet**: stacked
table rows, the rule beneath a column header, a divider, a code section boundary, a
quote. One tone serves every line, so those all agree with each other.

A 1px ring that traces a filled object is still a drawn border. Therefore:

- matte controls carry **no rim**: they are separated by tone and by light alone;
- fields add no line at all — their hover, focus, engaged and error states are tonality
  only, which is why no border appears and disappears as a user interacts;
- `edge.rule` needs its direction supplied at the call site (`border-t`, `border-l`).

**Do:** use a hairline to separate sibling parts inside one surface.
**Do not** draw a rim around a filled control, outline a card for emphasis, or express an
interaction state with a border.

---

## 8. Shape grammar

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

## 9. Tonal hierarchy

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

## 10. Interaction states

One language, applied the same way everywhere:

| State | Expressed by | Never expressed by |
| --- | --- | --- |
| rest | the material at whatever elevation the anatomy calls for | — |
| hover | one tonality step — a state layer over the fill, or a step up the surface ladder | depth, a new border, a size change |
| pressed | recessed into the control's own track, plus a slight compression (`state.press`) | a color swap alone |
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
| `track` | 0.18 / 0.26 | tracks, where hover arrives from the wrapping button via `group-*` |
| `activeRow` | data attribute | a menu row highlighted by keyboard navigation |

Fields are a single borderless family: a matte `surface-high` fill that steps up once on
hover and once more while engaged, no ring and no lift. `state.field.*` covers hover,
focus, focus-within, engaged and their error counterparts.

**Do:** let tonality carry hover and a recess carry pressed.
**Do not** use opacity for anything except disabled, or add depth to show a state.

---

## 11. Motion

Three families, no exceptions. A component picks a family, never a duration.

| Family | Role | Tokens | Should be used for |
| --- | --- | --- | --- |
| `press` | a tonality change with no physical travel, fast and decisive in both directions | `--sui-duration-press`, `--sui-ease-press` | hover, focus, an engaged field |
| `release` | a tactile control: every property a tactile control can animate — colour, shadow, transform, and the size a selection or a thumb travels with | `--sui-duration-release`, `--sui-ease-release`, plus the press pair on `active:` | any control whose transform changes |
| overlay | entrance and exit for anything that floats, plus a matching scrim family for the plane behind it | `--sui-duration-overlay`, `--sui-duration-overlay-exit`, `--sui-ease-release`, `--sui-ease-exit` | menus, tooltips, dialogs and their scrims |

`release` takes the press timing while it is held (`active:`), so the press lands
immediately, and the release timing carries the settle, so letting go is expressive.

Rules:

- a control whose transform changes **must** use `release`; `press` is for pure tonality
  and colour transitions that never move or resize anything;
- floating overlays share one entrance and one exit through `useOverlayPresence` while
  each keeps its own geometry — a menu grows from its trigger, a tooltip grows out of the
  edge it is anchored to, a dialog rises into place;
- the overlay exit window is read from `--sui-duration-overlay-exit` rather than copied
  beside it, is released on `animationend`, and is skipped entirely under
  `prefers-reduced-motion`, so a closing overlay never lingers;
- every family is neutralised under `prefers-reduced-motion`, and `release` additionally
  drops its transform;
- loading feedback (`animate-spin`, `animate-pulse`) sits outside these families: it
  reports progress rather than responding to interaction.

**Do not** write a literal duration, easing or `transition-*` list in a component, or
animate a property no family covers.

---

## 12. Density

Three control steps, plus one accessible hit-target floor. Density owns **height and the
type step**, so controls of one density share a rhythm.

| Step | Role |
| --- | --- |
| `compact` | dense desktop UI |
| `normal` | the default rhythm |
| `prominent` | the largest step, still compact by consumer-app standards |
| `target` | the minimum interactive target for an icon-only control |

Anatomy owns **padding**, not density: a button is gripped at its ends, a field holds
text, and neither is derived from the other — one density can carry two paddings.

The library targets dense desktop and product UI, so even the prominent step stays
compact. Body copy, headings and labels are content rather than controls and set their
own type.

**Do not** invent a fourth size step, scale a control by transform, or derive a button's
inline padding from a field's.

---

## 13. Accessibility and focus

- One visible focus language everywhere: a 2px ring in `--sui-focus`.
- `focusRing` draws the ring **outside** the shape, for a control that stands alone.
- `focusRingInset` draws it **inside**, for a control nested in another surface where an
  outer ring would collide with the parent's edge.
- Fields use the outer ring only. No inner rim is added, so focus reads as one ring,
  never two.
- Focus is visible on keyboard focus (`:focus-visible`), and never removed without a
  replacement indicator.
- Every interactive state above is reachable by keyboard and by pointer; `disabled`
  removes interactivity entirely rather than merely dimming it.
- Icon-only controls carry a label (`aria-label` or a tooltip) and meet the `target`
  hit-area floor.
- `prefers-reduced-motion` is respected by every motion family.
- The component runtime is font-agnostic; typography is the consumer's decision.
- Color is never the only carrier of meaning: a semantic state also carries an icon, a
  label or a position.

---

## 14. Theming

Tokens are grouped as one small system in `theme.css`: tonality, lighting, elevation,
material and motion. Theme selection is CSS-only — no attribute follows
`prefers-color-scheme`, while `data-sherick-theme="light"` or `"dark"` force one.

Consumers retune the library by overriding variables, not by forking component styles.
Retinting `--sui-light-top` / `--sui-light-bottom` re-lights every shadow, pressed state,
edge highlight and acrylic gradient at once.

---

## 15. Extending the language

The primitives above are the complete set of visual rules in the library. A component
composes them; it does not write a color, shadow, radius, duration, material recipe or
hairline of its own.

If a genuinely new visual rule is required:

1. add it to this document first, with its role and its when-to-use / when-not-to-use
   examples;
2. add it as a named primitive in `components/UI/ui.common.ts`, and its tokens to
   `theme.css`;
3. then consume the primitive in the component.

Extending the language is the intended path. Implementing a rule locally — a one-off
shadow, a literal color, an inline radius, a bespoke transition — is not. A local rule
makes the language non-canonical: the next component cannot reuse the decision, the next
theme cannot retint it, and no verification can catch it.

---

## 16. The showcase

> **The development showcase demonstrates the system; it does not explain it. Design
> rationale belongs in this document.**

The showcase exists for visual comparison, interaction and state testing, theme testing,
component discovery and regression inspection. It shows specimens and their labels; it
does not argue for them. Rules, rationale and explanation belong here.
