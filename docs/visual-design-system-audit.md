# Visual design-system audit

**Status:** analysis and recommendations only. No component, token or recipe changes were made in
this pass. [`DESIGN_LANGUAGE.md`](DESIGN_LANGUAGE.md) stays the canonical visual authority. Any item
below that adopts a new system-level rule must be written there first (AGENTS.md, "If a genuinely new
visual rule is required").

## Scope and method

- **Baseline:** `main` at `8f499ed` (package `sherick-ui` 2.x).
- **Rendered surfaces:** production builds of the library and the showcase (`next build && next start`):
  - the showcase home, all nine sections;
  - `/verification/visual-consistency`;
  - the copyable examples at `/examples/settings`, `/examples/resources` and `/examples/sidebar/overview`.
- **Browser:** Chromium through Playwright.
- **Themes:** explicit light and explicit dark (`sherick-ui-theme` in `localStorage`).
- **Viewports:** 1440px, 1280px and 375px.
- **States exercised:** rest, hover, held press, keyboard focus, selected/current, disabled, loading and
  invalid; open and closed Select, Combobox/date popup, Menu, Popover, Tooltip, Dialog, AlertDialog,
  Drawer (right and bottom), CommandPalette and a stacked toast group.
- **Measurements:** computed font size, weight, line height, box height, radius and padding for 26
  representative parts on the live page (the tables below quote them).
- **Source review:** `tokens.ts`, `ui.common.ts`, `ui.motion.ts` and every component a finding names.
  Where a finding says "renders as", the rendered page is the evidence and the source explains the cause.

Screenshots were disposable review captures and are not committed.

**Correction (implementation pass):** the original audit reported TreeView rows inheriting the
host's 16px. That measurement read the `treeitem` wrapper; the row and its label render at 14px
from `density.compact`. The claim has been removed below. Every state named here can be
reproduced from the showcase anchor or example route it cites.

---

## 1. Current design language

### What Sherick UI already is

Sherick UI has a real point of view, and it is recognisable in a single screenshot:

1. **A cool, soft, physical world.** The neutrals are one blue-grey hue family (h 255–260, chroma
   0.006–0.018). Light comes from above: tonal actions sit raised, tracks and wells are sunk, and
   anchored sheets are acrylic. The material / elevation / edge separation in `ui.common.ts` is the
   system's most mature idea. It shows up consistently: fields are borderless tone ladders, nothing
   filled is outlined, and edges appear only where two parts of one surface meet.
2. **Capsule geometry.** Buttons, chips and badges are pills. Fields, rows and sheets use generous
   radii that grow with extent (20 → 24 → 28 → 32px). Nested radii are concentric where it counts:
   a 28px list sheet holds 20px option rows at an 8px inset, and a 24px tab track holds a 20px
   indicator at a 4px inset.
3. **One interaction grammar.** A `currentColor` state layer composites over any fill. A row's
   keyboard highlight and pointer hover are the same tone. Focus is a single 2px ring in four
   placements. Motion is chosen by intent (`feedback`, `tactile`, `arrive`, `relocate`, …), not by
   duration. Of the language's layers, this one is the most complete.
4. **Comfortable proportions.** Controls default to 48px and cards pad 24px. It reads closer to a
   calm consumer-grade product than a dense admin console.

### Where the language becomes underdeveloped

The **physics** (material, depth, state, motion) is specified with unusual rigour. The **graphic
design** layer on top of it is not specified at all, or is derived by accident:

- **Typography has no system.** Eight different sizes render, and there is no type role. The
  typeface is whatever the host provides.
- **Colour for soft surfaces is derived, not designed.** Every tint is an alpha of a foreground
  token, and those foreground values were darkened for text contrast. As a result the soft semantic
  surfaces, selection tints and neutral soft surfaces are muddy or invisible.
- **Hierarchy signals conflict.** The secondary (tonal) action carries more depth than the primary
  (filled) action. "Current location" is expressed three ways. Near-pill fields sit beside pill
  buttons.
- **Composition is unguided.** The showcase and examples fall back on cards inside cards. They
  invent their own heading scales, and they show alignment problems that a composition rule would
  prevent.

The result is a system whose individual objects are well made, but whose pages don't yet feel
art-directed. The fixes below mostly **extend the existing language** into typography and colour
derivation, rather than changing its physics.

---

## 2. Findings

Findings are grouped by where the cause lives. Each one records what was observed, why it matters,
the cause, the recommendation, and what it affects. The confidence rating is about the diagnosis,
not the size of the change.

### A. Foundations (tokens, recipes, language)

#### A1. The secondary action out-lifts the primary action — high confidence

- **Observed.** `Button` gives `elevation.raised` only to `appearance="tonal"`
  (`Button.tsx`, `appearance === "tonal" && elevation.raised`). Filled buttons are flat. As rendered:
  - **Dialog:** a flat *Confirm* beside a text *Cancel*.
  - **Popover (Filters):** *Reset* raised, *Apply* flat.
  - **`/examples/settings`:** *Revoke all tokens* casts a shadow and *Save changes* does not.
  - **`/examples/resources`:** the *Statuses* filter trigger is the only raised object in a row of
    flat fields.
  - **Showcase `#feedback` and `#floating`:** the toast and sheet trigger rows are four raised
    shadowed pills each.
- **Why it matters.** Depth is the strongest attention signal this language has. §1 says "let one
  primary action hold the strong fill". The rendered hierarchy says the opposite: secondary actions
  float and the primary one sits on the page. Rows of tonal actions read as a cluster of floating
  chips, which is the main source of visual busyness on composed pages.
- **Cause.** `raised` is documented as "tactile tonal actions at rest" (§5) but nothing says what a
  filled action is. Light-mode `--sui-elevation-raised` also carries a 13px ambient blur
  (`0 4px 13px … / 0.09`), which reads as float rather than contact at 48px.
- **Recommendation.**
  1. Filled actions take the same tactile pair as tonal ones: `elevation.raised` at rest and
     `state.recess` while held. The strongest action becomes the most physical one.
  2. Tighten light-mode `raised` toward a contact shadow. For example, keep `0 1px 2px / 0.16` and
     reduce the ambient layer to about `0 2px 6px / 0.07`, so a row of tonal actions sits on the page
     rather than hovering over it. Dark mode already reads as contact and should be re-checked rather
     than retuned by assumption.
  3. Record in §5 that the action ladder is text (flat) < tonal (raised) ≤ filled (raised). Depth
     never inverts the fill hierarchy.
- **Affects:** `Button`, `IconButton` (filled appearance), `--sui-elevation-raised` (light), §5,
  browser baselines, and the contrast contract (the filled press path already measures on-colour
  through `filled` state steps; confirm the recess shadow does not move it).

#### A2. Soft surfaces are alpha-derived from contrast-tuned foregrounds, so they go muddy — high confidence

- **Observed.**
  - **Light theme:** `warning` is `0.388 0.082 75`, an olive-brown, and `success` is
    `0.381 0.086 160`, a forest green. Their 9% tints (`tone.soft.*`) render as:
    - the warning `Alert` (`#feedback`): a warm grey you can hardly tell from a neutral surface;
    - the success `Alert`: grey-green;
    - the "Ready"/"Active" badges (`#display`, `/examples/resources`): barely tinted.
  - **Dark theme:** the Warning and Danger badges resolve to nearly the same dark grey-brown.
  - **Selection:** `tone.selected.primary` is `primary/0.22`. In light it is 22% of a deep navy over
    near-white: a dusty steel blue on every held choice (segments, tabs, calendar days, tree rows,
    options, pagination, radio surface rows).
  - **Unused token:** `--sui-primary-soft` (`0.91 0.035 255`) is authored in both themes and consumed
    by nothing.
- **Why it matters.** Semantic soft surfaces are how a page says "this row is a warning" at a
  glance. A warning tint that reads as neutral fails that job. It also leans entirely on the icon,
  and badges usually have none (A6). Selection's greyish cast makes chosen things look disabled
  rather than held.
- **Cause.** [`PALETTE.md`](PALETTE.md) correctly deepened the semantic foregrounds to pass text
  contrast through every state. But every *surface* tint is `bg-<role>/[alpha]` of the same value,
  so each contrast retune silently recoloured every tinted surface. The alpha is also one number
  (0.09 or 0.12) for hues whose lightness and chroma differ widely. PALETTE.md rejected splitting
  foreground from *strong fill* (a 0.04 L difference), but it never considered a distinct *container*
  role for soft surfaces.
- **Recommendation.** Give each role a designed soft-surface value.
  - **New tokens.** Author `--sui-{danger,warning,success}-soft` beside the existing, currently unused
    `--sui-primary-soft`, in both themes.
    - Light: roughly L 0.93–0.95 with chroma 0.04–0.07, so warning reads amber, success reads green
      and danger reads rose.
    - Dark: roughly L 0.30–0.34 with chroma 0.04–0.06.
  - **Rewrite the soft tones to use them.**
    - `tone.soft.*` → `bg-sherick-<role>-soft` with the existing semantic foreground.
    - `tone.selected.*` → the soft value, one step stronger. Either author a
      `--sui-<role>-selected` value or composite the soft value with a fixed ink step. Measure both
      before choosing.
    - `tone.tonal.*` fills and the field error ladder (`state.field.invalid*`, `controlError`) can
      stay alpha-based. They sit on known surfaces and are already measured. Re-evaluate them only if
      the rendered comparison shows a mismatch with the new soft surfaces.
  - **Extend the contrast contract** (`contrast-contract.mjs`) with foreground-on-soft through the
    `quiet` and `tonal` state steps. Opaque containers make these compositions simpler to guarantee
    than the current alpha stack.
  - **Record the decision in `PALETTE.md`** as a new section: "container role", with the measured
    numbers.
- **Expected effect.** Status reads from colour again in both themes. Selection looks chosen rather
  than dimmed. Future text-contrast retunes stop recolouring surfaces.
- **Affects:** `tokens.ts`, `tone` in `ui.common.ts`, `recipeAlphas` (the soft/selected alphas turn
  into token pairs), `selectableRowSurface`, the contrast contract, `PALETTE.md`, §10, every
  soft/selected consumer (Alert, Badge, Card, Chip, ToggleGroup, SegmentedControl, Tabs, Select,
  Combobox, Menu options, TreeView, Calendar, Pagination, RadioGroup surface rows, Markdown
  blockquote), and baselines.
- **Versioning:** new theme variables are additive, so a **minor** bump.

#### A3. The neutral soft role equals the card fill, so neutral things vanish inside cards — high confidence

- **Observed.** `tone.soft.secondary` is `bg-sherick-surface/[0.78]`, the same recipe as
  `material.matte`, which is what a `Card` is. As rendered:
  - **Neutral `Badge`:** shows as bare bold text on any card or table ("Neutral" in `#display`,
    "Draft" in the Table specimen, "Archived" in `/examples/resources`).
  - **Neutral `Card`:** a default-variant `Card` inside a card is invisible (`#display`, "Neutral
    card").
  - **Tonality specimen:** the "Surface" and "Surface float" swatches are invisible on their own card.
- **Why it matters.** "Neutral" should mean "no semantic colour", not "no surface". A neutral badge
  that has lost its container stops being a badge. Its baseline and weight then sit oddly beside
  its tinted siblings.
- **Cause.** The neutral soft step is defined absolutely (a surface value) rather than relative to
  its container. The light ladder is also narrow: canvas 0.965, card ≈ 0.98, float 0.992 and high
  0.925 all fall inside ΔL 0.07.
- **Recommendation.** Define `tone.soft.secondary` as a *contained* step that shows on canvas, card
  and acrylic alike. `material.matteHigh` (`surface-high/0.72`) is the natural candidate and already
  exists. Leave `Card`'s default fill on `material.matte`, not `tone.soft.secondary`, so a card is a
  surface and a neutral badge is a step within it. Separately, consider widening the light ladder by
  about 0.01–0.015 L (canvas slightly darker, or surface slightly lighter). Measure it against the
  contrast contract before adopting; the ladder is documented as unchanged since the palette decision.
- **Affects:** `tone.soft.secondary`, `Card`, `Badge`, `Chip` (passive neutral tag), `recipeAlphas`,
  and optionally `canvas`/`surface` in `tokens.ts`.

#### A4. There is no type system — high confidence

- **Observed (measured).**

  | Part | Size / weight / line height |
  | --- | --- |
  | Button `md`, Input, Select trigger, Textarea, Tab | 15.2px / 400–500 / 22.8px (`density.normal` = `0.95rem`) |
  | Button `sm`, Segment, Chip, Nav item, TreeView row, Accordion row, Table cell, Command row, Select **option** | 14px / 400–500 / 20px |
  | Field description and error, Tooltip, Stepper sub-label, Command group label, Calendar weekday | 12px |
  | Badge | 12px / 600 |
  | CodeBlock language label | 11px uppercase, +0.08em tracking (the only 11px text and the only uppercase) |
  | Dialog and Drawer title | 20px / 600 / −0.02em |
  | CommandPalette title, Toast title | 14px / 500 |
  | Markdown h1–h3 | 30 / 24 / 20px |

  Other observations:
  - **Size changes between trigger and list.** A Select's trigger is 15.2px but its options are
    14px, so a value changes size between the list and the field.
  - **Duplicated message recipe.** The field-message recipe `mt-2 text-xs leading-5` is written out
    11 times across `Field`, `Input`, `Textarea`, `FileUpload` and `DateRangePicker`.
  - **Small helper text.** At 12px under 15.2px field text, helper copy reads as fine print
    (`/examples/settings`: "Shown to people in this workspace.", "Email a summary…").
  - **No font contract.** Sans inherits from the host, and the showcase's character comes from
    Inter via `next/font`. `font-mono` falls back to Tailwind's default stack, which rendered as a
    generic system mono on Linux.
  - **Tabular numerals are partial.** `tabular-nums` appears in Calendar, Progress, Stepper and
    Pagination, but not in `Table` cells or `NumberField`.
- **Why it matters.** Typography carries most of a product's perceived quality. Right now the type is
  chosen per component, so adjacent parts disagree:
  - a 15.2px field sits above a 12px hint;
  - a 14px option commits into a 15.2px trigger;
  - a 20px Dialog title and a 14px CommandPalette title head the same modal surface.

  The off-grid `0.95rem` produces fractional line boxes (22.8px), which undermines vertical rhythm.
- **Cause.** The language deliberately scopes "content typography" to components (§16). That is
  right for copy a component uniquely renders. But several roles recur across families and have
  no owner. They are shared anatomy exactly as `list.option` is:
  - field messages;
  - component titles;
  - group labels;
  - list rows;
  - numeric data.
- **Recommendation.** Extend §10 ("Tonal hierarchy") with **type roles**, add a `type` recipe group
  in `ui.common.ts`, and consume it:

  | Role | Proposed | Consumers |
  | --- | --- | --- |
  | `type.control.{compact,normal,prominent}` | 14/20, **15/22** (replace `0.95rem`), 18/26 | `density.*` (density keeps owning the step) |
  | `type.row` | the row's density step; a Select option matches its trigger's step | `list.option`, `list.command`, NavItem, disclosure trigger |
  | `type.supporting` | **13/20** | field description, error and hint; Stepper sub-label; Toast description (14/24 today, which should be decided consciously) |
  | `type.caption` | 12/16 medium | Badge, Tooltip, Command group label, Calendar weekday, CodeBlock language label (drop 11px and uppercase unless uppercase is adopted as a system-wide label treatment) |
  | `type.title` | 16/24 · 500–600 | CommandPalette title, Toast title, Popover heading (documented slot or pattern), card and section headings in examples |
  | `type.heading` | 20/28 · 600 · −0.02em | Dialog, AlertDialog and Drawer titles (already consistent) |
  | `type.numeric` | `tabular-nums` | Table cells (opt-in per column or default), NumberField, Progress value, Pagination (already), Calendar (already) |

  Separately, add a `--sui-font-mono` theme token with a curated stack for CodeBlock and inline code.
  For sans, document that Sherick inherits the host's typeface and is tuned for a neo-grotesque
  such as Inter. Do **not** ship a web font or set `font-family` on component roots; either would
  override host typography and conflict with the reset-free styling contract.
- **Expected effect.**
  - Hint text becomes readable without competing.
  - Titles on all modal surfaces agree.
  - Values stop resizing.
  - The layout rhythm lands on whole pixels.
- **Affects:** §10 and §13, `ui.common.ts` (`type`, `density`), `tokens.ts` (mono), Field and every
  field family member, Select/Combobox/Menu/Command lists, TreeView, Toast, CommandPalette, Badge,
  Tooltip, CodeBlock, Table, NumberField, examples and baselines.

#### A5. Palette roles that nothing uses — high confidence

- **Observed.** `--sui-accent`, `--sui-outline` and `--sui-primary-soft` are authored in both themes
  and published in `theme.css`. No component consumes them (a grep of `packages/ui/src` finds them only
  in `tokens.ts` and the Tailwind colour list). The showcase Tonality specimen still shows a teal
  "Accent" swatch, and §10 says "accent gives supporting emphasis", but no component expresses it.
  The showcase body's radial washes are the only place accent appears.
- **Why it matters.** Consumers can retune variables that change nothing. The documented palette
  promises a teal secondary voice that the product never speaks. Unowned tokens drift.
- **Recommendation.**
  - `primary-soft`: give it the container job in A2 (no rename needed).
  - `accent`: either assign it a real, narrow job (none is compelling today, and inventing one only
    to use the token is not recommended), or remove it from the Tonality specimen and from §10's
    wording, and mark it reserved.
  - `outline`: same treatment. It is superseded by `edge` and `detail`.
  - Removing a published `--sui-*` variable is a consumer-visible theme change, so it belongs in a
    major release. Documenting a token as "reserved/unused" can ship now.
- **Affects:** `tokens.ts`, §10, `PALETTE.md`, the showcase Tonality specimen, README theme docs.

#### A6. Badges carry meaning through a tint alone — high confidence

- **Observed.** After the Phase B change ([`VISUAL_CONSISTENCY.md`](VISUAL_CONSISTENCY.md)), badge
  copy is neutral `text.high` and semantic tone is carried by the tint and an optional icon. Most
  rendered badges have no icon, including every badge in `/examples/resources` and the Warning and
  Danger badges in `#display`. With A2's muddy tints, Warning, Danger and Success badges are hard to
  tell apart in dark mode and hard to read as warnings in light mode.
- **Why it matters.** §14: "Color alone never identifies meaning". Here, colour alone doesn't even
  identify it.
- **Recommendation.** After A2, re-evaluate the neutral-copy decision. Either restore semantic
  foreground on the new soft containers (easy to measure, since the container is opaque and designed
  for it) or keep neutral copy and give semantic variants a built-in leading mark. A 6px status dot in
  the variant's strong tone would be a new small visual rule for §10. Ship one of the two. Leave the
  neutral variant unmarked.
- **Affects:** `Badge`, possibly the passive tag in `Chip`, §10, examples.

#### A7. Soft geometry converges at compact sizes; near-pill fields sit beside pill buttons — medium confidence

- **Observed (measured).**
  - **Near-pill fields.** `shape.control` is 20px. On 48px fields that is 83% of the half-height,
    and those fields sit beside `shape.pill` buttons. `/examples/resources` puts a 20px-radius Search
    field, a pill *Statuses* button and a 20px-radius Select in one row. The three silhouettes are
    almost, but not quite, the same.
  - **Compact convergence.** At 40px, a 20px radius *is* a pill: Chip toggles measure 40px tall with
    a 20px radius. Compact fields, buttons, chips and one-line Alerts (52px tall, 20px radius) all
    converge on capsules.
- **Why it matters.** Near-identical silhouettes read as imprecision, not as a distinction. The eye
  can't use shape to tell an input from an action, which is the one thing geometry could do for free
  here.
- **Cause.** Radii are absolute per role, and `control` spans objects from 40px chips to 112px
  textareas and alerts.
- **Recommendation.** Decide deliberately between the options below, and prototype both on
  `/verification/visual-consistency` before choosing.
  - **Option A (recommended): capsules act, containers hold.**
    - Buttons, chips, badges and toggles stay pills; this is Sherick's identity.
    - `shape.control` steps down to a clearly non-capsule value for containers such as fields,
      alerts and tables, roughly 14–16px at 48px.
    - `row`, `mark` and `prominent` follow to keep the existing concentric pairs: indicator =
      track − inset.
  - **Option B:** single-line fields also become pills, and multi-line fields keep `control`. This
    is simpler, but it makes Input and Textarea diverge.

  Either way, write in §9 which silhouettes must differ and why.
- **Affects:** `shape` in `ui.common.ts`, §9, every field, Alert, Table, Tabs and SegmentedControl
  (nesting), Menu, baselines. **Large**, and it changes identity, so it needs a rendered sign-off.

#### A8. "Current location" is expressed three ways, and the language contradicts itself — high confidence

- **Observed.**
  - `NavItem` current: `tone.tonal.primary` (0.12), flat, weight 500.
  - `Tabs`: `tone.selected` (0.22) plus `elevation.control` inside a recessed track. It is visually
    identical to `SegmentedControl` and `ToggleGroup` except for size (`#selection`).
  - `Pagination` current page: `tone.selected` plus `elevation.control` in a recessed pill track.
  - `Breadcrumb` current: weight only.

  §10 says "a navigation destination uses a quieter tonal tint, weight and `aria-current`, not the
  selected-value treatment", while §9 prescribes a raised current page for Pagination.
- **Why it matters.** Users should be able to tell "this changes a value" from "this is where I am".
  Right now switching a view (Tabs) and picking a value (SegmentedControl) look the same. Moving
  between pages (Pagination) looks like selecting a value. The documentation rules disagree about
  which is correct, so the next component will pick at random.
- **Recommendation.**
  - Define one **`current`** treatment in §10 and `ui.common.ts`: a quiet primary tint, weight, flat.
  - Apply it to NavItem (already there), Pagination's current page (drop `elevation.control`; the
    recessed track can remain) and Breadcrumb (weight plus `text.high`, already there).
  - For Tabs, choose explicitly:
    - either keep the segmented look and record in §10 that tabs are a *held choice of view*, a
      deliberate exception;
    - or move the indicator to the `current` treatment.

  The key deliverable is removing the contradiction, not a particular look.
- **Affects:** §9, §10, `Pagination`, possibly `Tabs`, NavItem (no change), baselines.

#### A9. Grooves and tracks use two different fills — medium confidence

- **Observed.**
  - Tabs, SegmentedControl, ToggleGroup and Pagination tracks use `selectable.rest`
    (`matteHigh`, clearly visible).
  - Slider, Progress and Stepper grooves use `material.matteQuiet` (`surface/0.42`). On a
    card, the unfilled remainder of a Progress bar or Slider groove is barely perceptible
    (`#feedback` Progress, `#selection` Slider). The eye loses the scale's total extent.
- **Why it matters.** A progress bar's value only reads relative to its full track.
- **Cause.** The Slider comment explains that the groove is quieter "so a raised handle still
  separates". But the handle is the dark `material.handle`, so separation isn't the binding
  constraint.
- **Recommendation.** One groove fill for every sunk track: `selectable.rest`, or a single
  `material.groove` recipe documented in §4. Keep `matteQuiet` for dense data regions (Table,
  TreeView sheet).
- **Affects:** Slider, Progress, Stepper (its connector segments), §4 and §5.

#### A10. Neutral press goes muddy — medium confidence

- **Observed.** A pressed neutral tonal Button (`#buttons`, held) and the "Pressed" tile in the
  Interaction-states specimen turn a flat concrete grey. A tactile press stacks three signals:
  the recess shadow, a 4% scale, and a 15% `currentColor` (ink) veil.
- **Why it matters.** For light, airy surfaces the neutral press reads as "dirty/disabled" for the
  length of a click. The colour step is doing work that depth and scale already do.
- **Cause.** One `tonal` press alpha is shared by neutral and coloured fills. PALETTE.md kept the
  state steps because coloured labels need the headroom. Neutral ink on grey has ample contrast.
- **Recommendation.** Keep the steps for coloured fills. For the neutral (secondary) tonal fill only,
  reduce the press veil to about 0.10, since the recess and compression already say "pressed". This
  needs a small `stateLayer` variant and a §11 line. Leave hover alone.
- **Affects:** `stateLayer` and `recipeAlphas`, Button/IconButton (secondary tonal), Chip, §11.

#### A11. Icon size is not tied to density — medium confidence

- **Observed.**
  - Buttons use a fixed 20px icon slot at every size. A `sm` button pairs a 20px glyph with 14px
    text (`#buttons`, "Sizes"), and the icon outweighs the label.
  - NavItem uses 20px icons with 14px labels.
  - Chip, SegmentedControl, TreeView and the disclosure chevron use 16px with 14px text.
  - Badge uses 14px with 12px text.
- **Why it matters.** Icon-to-text ratio is one of the most visible proportion cues. Here it varies
  by component rather than by size.
- **Recommendation.** Make the icon slot a density property: compact → 16px, normal → 20px,
  prominent → 24px (and caption → 14px). Add it beside `density` in `ui.common.ts` and §13. NavItem
  becomes 18px or adopts the compact slot, depending on the row type from A4.
- **Affects:** `density`, Button, IconButton (the target is unchanged; only the glyph changes), Chip,
  NavItem, SegmentedControl, ToggleGroup, Menu and Command rows, Badge.

### B. Component-family findings

| # | Observed | Recommendation | Affects |
| --- | --- | --- | --- |
| B1 | **Value handles use three materials.** The Switch thumb is `bg-current` (charcoal off, white on in light; inverted in dark). The Slider handle is a charcoal 12×20px capsule beside a navy range. Checkbox and Radio fill the mark itself. | Keep Switch as it is (it is coherent). Align the Slider handle's *geometry* with the thumb family: a 20px circle, or document why the capsule differs. Consider an on-colour handle whenever it sits on the filled range. | Slider, §11 |
| B2 | **Field messages** are 12px, re-authored in five components (A4), and the error colour is a raw `text-sherick-danger` instead of `tone.text.danger`. | `type.supporting` plus a shared `fieldMessage.{description,error}` recipe. | Field, Input, Textarea, FileUpload, DateRangePicker |
| B3 | **Modal-family titles disagree.** Dialog and Drawer use 20/600. CommandPalette uses 14/500 plus a 12px description. | CommandPalette takes `type.heading`, or `type.title` if it should stay subordinate to its search field, but decide once for all modal surfaces. | CommandPalette, DialogHeader, Drawer |
| B4 | **List row sizes break at the boundary.** Select and Combobox options are 14px under a 15.2px trigger. | Rows take the density step of the control that opened them (A4 `type.row`). | `list.option` |
| B5 | **Large recessed wells read as outlined boxes.** CodeBlock (`material.matte` plus `elevation.recessed` at `shape.prominent`) renders a four-sided rim at 24px radius (`#content`). `recessed` is calibrated for 6–32px tracks. | Wide wells take `recessedTop` (the upper wall only, already in the language), or add a `recessed` scale note in §5. | CodeBlock, Markdown code, FileUpload list sheet |
| B6 | **Markdown blockquote looks like a selected callout.** It uses `tone.soft.primary` fill, a start border, and rounded end corners only. | A quote is content emphasis (§8): keep the accent rule and `text.medium`, and drop the tint and asymmetric radius (or use neutral `matteHigh`). | Markdown |
| B7 | **Inline code is a pill in primary text colour**, so it reads as a link or chip inside prose. | `shape.row` (or `mark`) with `text.high`, on the mono token from A4. | CodeBlock (`inline`) |
| B8 | **Stepper indices are bare 12px numerals** with no container, next to 14px labels. The current step is signalled only by a bar far above the label. | Give the index a caption-sized mark slot (A11) and first-line alignment (§17), and pair the current bar with `text.high` weight in the label. | Stepper |
| B9 | **Table.** Rows are 53–65px (`py-3` plus content). There is no numeric alignment and no `tabular-nums`. A text action in a cell starts 16–24px right of its column header (`/examples/resources`, "Action"). At 375px, trailing columns scroll away with no affordance ("Status" disappears). | `type.numeric` on cells. Document a **hanging text action** rule in §17: a text button aligned to a text column cancels its inline padding (Toast already does this with `-ms-4`). Consider an end-edge scroll affordance (a new visual rule; add it to §19 first). | Table, §17, §19, examples |

### C. Isolated component refinements (low risk)

- **Alert (warning).** The warning soft surface is the clearest single example of A2. After A2, verify
  that the warning alert reads as amber in light mode.
- **Popover heading.** The Filters specimen's heading ("Refine results") is the same 14px/500 as the
  field labels beneath it, so there's no hierarchy. Either document a heading pattern using
  `type.title` or add an optional title slot.
- **Calendar.** The "Today" action has no visible affordance at rest (a text button with no padding
  cue beside dense day cells). Give it `appearance="text"` alignment per the B9 hanging rule so it
  lines up with the day grid, not with its own padding.
- **FileUpload list sheet.** It is inset narrower than its drop zone and hangs beneath it
  (`#fields`, "Attachments"), so it reads as a drawer that slid out. Align its inline edges with the
  drop zone, or make the drop zone and list one surface with an `edge.rule` between them.

### D. Showcase and example issues (not design-system defects)

- **D1. "Jump to…" overlaps content.** At 1440px there is no persistent section navigation, and the
  floating *Jump to…* pill stays pinned top-left, covering table rows and section titles while
  scrolling (visible in every scrolled capture). Use a persistent side rail at wide widths (the
  margins are about 100px) and keep the pill for narrow viewports.
- **D2. Heading hierarchy is inverted.** Section titles are 36/600 and card titles 16/500, but
  sub-headings inside the Calendar card ("Single calendar", "Date field") are 18/400, *larger* than
  the card title that contains them. Adopt A4's roles in the showcase.
- **D3. Cards in cards.** Every specimen group is a card, so specimens that are themselves surfaces
  sit card-in-card:
  - Material tiles are nested three deep;
  - "Neutral card" is invisible inside a card;
  - Tonality swatches vanish.

  Put surface specimens on canvas-coloured bands, not inside cards.
- **D4. Two current destinations.** The NavGroup specimen marks two items as current at once
  ("Design language" and "Fields"). A specimen should show one current item plus a hover or keyboard
  state.
- **D5. Image specimen shows empty frame.** The contain-fit image leaves a large empty grey area
  under the photo. That's correct behaviour, but it reads as broken. Label it, or pair it with a
  cover-fit sibling at the same aspect.
- **D6. Example backgrounds.** `examples/settings/settings.css` and `resources.css` paint
  `--sui-canvas` on a centred column over the showcase body's radial gradient. This produces hard
  vertical edges 350px from each side. Either let the example inherit the page background or make
  the column full-bleed.
- **D7. `/examples/settings` switch placement.** The *Weekly summary* switch sits alone on a row
  under its label, with its 12px description underneath. A setting row (label and description at the
  start, control at the end) is the conventional composition and removes the orphaned switch.
- **D8. `/examples/resources` filter bar.**
  - The unlabeled *Statuses* trigger sits among labelled fields, so its top edge aligns with the
    labels, not the fields.
  - "13 projects" and *Sort by* form a second, loosely aligned row.
  - Put all filters on one row with the count baseline-aligned to the table header, or label the
    Statuses trigger.

---

## 3. Design-language opportunities

These are the higher-level moves that would make the system feel art-directed. Each builds on what
Sherick already does well.

1. **Give the physical model a typographic partner.** The material ladder has named roles and
   when/when-not guidance. Typography has nothing comparable. A small set of type roles (A4), five to
   seven of them tied to density, would make every composed page feel set rather than assembled.
   Target effect: labels, values, hints and titles relate by a consistent ratio (about 1.07 between
   adjacent steps: 13 → 14 → 15 → 16, with 20 as the heading leap). Hints become quiet but legible.
2. **Design colours for surfaces, not only for text.** Keep PALETTE.md's measured foregrounds, and
   add a soft/container value per role (A2) so tinted surfaces are *designed*: amber reads as amber,
   selection reads as a clear cool blue rather than steel grey, and dark mode gets distinct warm and
   cool tints. Target effect: status and selection are recognisable at a glance in both themes
   without leaning on icons.
3. **Make depth follow importance.** The physics is right, but its assignment to actions is inverted
   (A1). With filled ≥ tonal > text, and a contact-tight `raised`, the one primary action becomes the
   most tangible object in a view. That is exactly what the governing rule promises.
4. **Let silhouette mean something.** Capsule = act, rounded rectangle = hold (A7). This one rule
   makes Sherick's pills more distinctive, because they would stop being diluted by near-pill
   containers.
5. **Separate "where I am" from "what I chose".** One `current` treatment for navigation, one
   `selected` treatment for held values (A8). Components then read by *kind*, not only by size.
6. **Add composition guidance, not composition components.** Most of the ungainliness in section D
   comes from missing guidance, not missing components:
   - how a settings row is laid out;
   - how a filter bar aligns;
   - how text actions hang in columns;
   - when a surface belongs on canvas versus in a card.

   A short "Composition" chapter in `DESIGN_LANGUAGE.md`, with the examples built to it, would carry
   the language to pages. This stays consistent with the rule that the showcase demonstrates and never
   explains.

What should **not** change:

- the light-from-above model;
- borderless fields;
- the state-layer approach;
- the motion grammar;
- the pill action identity;
- the acrylic reserved for floating surfaces.

None of the findings argue for more shadows, more borders, a new colour family, a bundled web font,
or a new architectural layer.

---

## 4. Concrete improvement plan

Scope: **S** is a few recipes or one component with baselines. **M** is a recipe family plus several
components. **L** is a foundation change touching most components and needing rendered sign-off.

Every pass that changes the published package needs a version bump in `packages/ui/package.json`:
**patch** for pure visual corrections, **minor** when new theme variables or props are added. Update
visual baselines with reviewed diffs. Each pass that adds a rule updates `DESIGN_LANGUAGE.md` first.

### Pass 1: Foundational colour and depth (highest impact)

| ID | Problem | Change | Affects | Visual impact | Scope | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Muddy semantic and selection tints (A2) | Add `--sui-{danger,warning,success}-soft` and put `--sui-primary-soft` to work. Rewrite `tone.soft` and `tone.selected` to use them. Extend the contrast contract. Record the decision in PALETTE.md. | tokens, `tone`, `recipeAlphas`, `selectableRowSurface`, all soft/selected consumers | Status and selection readable at a glance in both themes | L | none |
| 1.2 | Neutral soft step invisible in cards (A3) | `tone.soft.secondary` → a contained step (`matteHigh`). `Card` default → `material.matte`. | `tone`, Card, Badge, Chip | Neutral badges and tags visible everywhere | S | best after 1.1 |
| 1.3 | Primary action flatter than secondary (A1) | Filled gets `raised` plus `state.recess`. Tighten light `--sui-elevation-raised`. Write the action ladder into §5. | Button, IconButton, tokens (light), §5 | Clear action hierarchy; calmer tonal rows | S–M | none |
| 1.4 | Badges signal by tint alone (A6) | After 1.1, restore semantic foreground on soft containers, or add a variant status dot (§10 rule). | Badge, §10 | Status legible without colour-only reliance | S | 1.1 |
| 1.5 | Unused palette roles (A5) | Put `primary-soft` to work (1.1). Document `accent` and `outline` as reserved, remove them from the Tonality specimen and §10 wording, and schedule removal for the next major. | tokens docs, §10, showcase | A palette that matches what renders | S | 1.1 |

### Pass 2: Typography system

| ID | Problem | Change | Affects | Visual impact | Scope | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| 2.1 | No type roles (A4) | Add type roles to §10 and §13, plus a `type` recipe group. `density.normal` → 15/22 (drop `0.95rem`). | ui.common, all density consumers | Whole-pixel rhythm; controls agree | M | none |
| 2.2 | 12px detached helper text (A4, B2) | `type.supporting` 13/20 plus a shared `fieldMessage` recipe. Use `tone.text.danger` for errors. | Field, Input, Textarea, FileUpload, DateRangePicker | Readable hints that stay subordinate | S | 2.1 |
| 2.3 | Rows resize at boundaries (B4) | `type.row` follows the opener's density. | `list.option`, `list.command`, NavItem, disclosure | Values don't jump size between list and field | S | 2.1 |
| 2.4 | Modal and surface titles disagree (B3, C) | `type.heading` for Dialog, AlertDialog, Drawer and CommandPalette; `type.title` for Toast and the Popover heading pattern. | CommandPalette, Toast, Popover docs | One voice across floating surfaces | S | 2.1 |
| 2.5 | Captions and labels ad hoc | `type.caption` for Badge, Tooltip, Command group label, Calendar weekday and CodeBlock label (drop 11px and uppercase). | those components | Consistent small text | S | 2.1 |
| 2.6 | Numeric data and mono | `type.numeric` for Table (opt-in per column or default) and NumberField. Add a `--sui-font-mono` token. | Table, NumberField, CodeBlock, tokens | Aligned figures; deliberate code face | S | 2.1 |

### Pass 3: Geometry and component-family consistency

| ID | Problem | Change | Affects | Visual impact | Scope | Depends on |
| --- | --- | --- | --- | --- | --- | --- |
| 3.1 | Near-pill containers beside pill actions (A7) | Prototype Option A (capsule = act, rounded rectangle = hold) vs Option B on the verification page; adopt one; update `shape` and the §9 nesting pairs. | `shape`, fields, Alert, Table, Tabs, Segmented, Menu | Distinctive, legible silhouettes | L | sign-off |
| 3.2 | Icon/text ratio varies by component (A11) | Icon slot by density (16/20/24, caption 14). | `density`, Button, IconButton, Chip, NavItem, Segmented, ToggleGroup, rows, Badge | Balanced proportions at every size | M | 2.1 |
| 3.3 | Three "current" treatments (A8) | Add a `current` role. Pagination current goes flat. Decide Tabs explicitly. Resolve the §9/§10 contradiction. | ui.common, Pagination, Tabs?, §9, §10 | Navigation and selection read as different kinds | M | 1.1 |
| 3.4 | Two groove fills (A9) | One sunk-track fill for Slider, Progress and Stepper. | Slider, Progress, Stepper, §4 | Full scale visible on cards | S | none |
| 3.5 | Muddy neutral press (A10) | Neutral-only tonal press at about 0.10. | `stateLayer`, Button, IconButton, Chip, §11 | Crisper press on light surfaces | S | none |
| 3.6 | Slider handle geometry (B1) | Circle handle aligned with the Switch thumb family, or a documented exception. | Slider, §11 | Coherent value-control family | S | none |

### Pass 4: Individual visual refinements

| ID | Problem | Change | Affects | Scope |
| --- | --- | --- | --- | --- |
| 4.1 | Large recessed wells read as rims (B5) | `recessedTop` for wide wells, plus a §5 scale note. | CodeBlock, FileUpload list | S |
| 4.2 | Blockquote looks selected (B6) | Accent rule and medium text only. | Markdown | S |
| 4.3 | Inline code reads as a chip or link (B7) | `shape.row`, `text.high`, mono token. | CodeBlock `inline` | S |
| 4.4 | Stepper index weak (B8) | Caption mark slot and first-line alignment. | Stepper | S |
| 4.5 | Table action alignment, row density, overflow (B9) | Hanging text-action rule (§17). Evaluate the row padding. Optional end-edge scroll affordance (§19 first). | Table, §17, §19 | S–M |
| 4.6 | FileUpload list offset (C) | Align the list with the drop zone, or make them one surface with an `edge.rule`. | FileUpload | S |
| 4.7 | Calendar "Today" alignment (C) | Hanging text action. | Calendar | S |

### Pass 5: Documentation, showcase and examples

| ID | Problem | Change | Scope |
| --- | --- | --- | --- |
| 5.1 | No composition guidance (§3.6) | Add a "Composition" chapter to DESIGN_LANGUAGE.md: setting rows, filter bars, hanging actions, surface-on-canvas vs card, page and section heading roles. | S |
| 5.2 | Showcase navigation overlaps content (D1) | Persistent side rail at wide widths; keep *Jump to…* for narrow. | S |
| 5.3 | Showcase heading inversion and card nesting (D2, D3) | Use type roles. Put surface specimens on canvas bands. | S–M |
| 5.4 | Specimen correctness (D4, D5) | One current NavItem; paired contain/cover image specimens. | S |
| 5.5 | Example composition (D6–D8) | Full-bleed or inherited background; setting-row switch; aligned filter bar. | S |

### Suggested sequencing

1. **Pass 1.3 and Pass 2.1** can start immediately and independently. Together they fix the most
   visible hierarchy problems.
2. **Pass 1.1** is the largest foundational change. Land it before 1.2, 1.4, 1.5 and 3.3, because
   those consume the container tokens.
3. **Pass 2.2–2.6** follow 2.1 and are mostly mechanical.
4. **Pass 3.1** needs a rendered comparison and sign-off before implementation. Schedule it once
   Passes 1 and 2 have settled, so the silhouette decision is made against the final type and colour.
5. **Pass 4** items can be picked individually at any point. **Pass 5** should follow the foundation
   passes, so the examples demonstrate the finished language.

### Verification for every pass

- Run `bun run verify`. Pay particular attention to:
  - the contrast contract (Pass 1);
  - `test:motion` (no temporal classes introduced);
  - bundle budgets (no baseline increase expected; the type recipes replace duplicated strings).
- Update deterministic visual baselines with reviewed diffs.
- Do a rendered review in both themes at 1440px and 375px, including open overlays. Pay particular
  attention to side-by-side sibling comparisons on `/verification/visual-consistency`.
