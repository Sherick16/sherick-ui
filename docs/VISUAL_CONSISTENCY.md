# Rendered visual-consistency audit

## Scope and evidence

Reviewed the production-built catalog against `DESIGN_LANGUAGE.md`, starting from `5ed76ff`.
This was a rendered review, not a source-only normalization pass.

**Method deviation.** The brief asked for the inspection to be fanned out by visual concern and
then synthesized across the tracks. It was not: the review ran as a single sequential pass, with
no subagents, and that is how a sibling inconsistency below was missed — `Alert` still
compensated only its top edge after `Toast`'s identical defect had been fixed in this same PR.
External review caught it. The follow-up therefore re-checked the rule across the library
instead of patching the one component it was reported against.

The showcase covers every public component family; `/verification/visual-consistency` adds
same-content sibling comparisons and real overlay triggers. Review captures cover both themes,
1280px sibling layouts, 1440px showcase sections, and 375px RTL layouts. Geometry regressions
also run at 320px. Hover, held press, keyboard focus, selected/current, disabled, loading,
read-only, invalid, expanded and collapsed states are exercised where meaningful by the
comparison fixture and the existing focused browser suites. This is representative state
coverage, not an exhaustive Cartesian product of every prop, theme and viewport.

| Catalog band | Reviewed components |
| --- | --- |
| Actions | Button, IconButton; text/tonal/filled, icon/loading/disabled and size specimens |
| Fields | Field, Input, Textarea, Search, NumberField, Select, Combobox |
| Selection and navigation | Checkbox, RadioGroup, Switch, Slider, Chip, ChipGroup, ToggleGroup, SegmentedControl, Tabs, NavItem, NavGroup |
| Feedback | Alert, Progress, Spinner, Skeleton, ToastProvider/ToastViewport and toast actions |
| Disclosure | Accordion, Collapsible, their open content, disabled rows and dividers |
| Display and content | Card, Badge, Avatar, Table, Divider, CodeBlock, Markdown |
| Floating | Tooltip, Menu, Popover, Dialog, AlertDialog, Drawer on all four sides; Select and Combobox lists |

Local before/after artifacts from this review are under `/tmp/sherick-polish/before/` and
`/tmp/sherick-polish/settled/`. These are disposable review evidence, not repository fixtures.
The permanent capture recipe is documented in `VERIFICATION.md`; it waits for painted opacity,
not just DOM visibility, before capturing a popup.

## Findings and corrections

| Concern | Finding | Canonical correction |
| --- | --- | --- |
| Geometry and density | NumberField was taller than its field siblings; its marks were smaller than neighbouring embedded controls. | Fit its existing 44px targets inside the normal 48px field; use 20px stepper marks and the quiet embedded-control state layer. |
| Shape hierarchy | Short tooltips became capsules, compact segments lacked nested corner hierarchy, and wide tabs used full pill ends. Inline alerts used card-sized corners. | Reuse `row` for hints/compact segments, `control` for alerts and tab contents, and `prominent` for the tab track. No radius values added. |
| Tone and text hierarchy | Select lacked the invalid field ladder; hover could erase an open field's engaged step. Badge/Card copy inherited semantic foreground; disclosure body copy competed with its trigger. | Share `state.field.invalid*` and engaged treatment; use neutral readable copy with semantic badge icons; give disclosure panels the shared supporting-copy step. |
| Material and elevation | Disabled/loading tonal actions and disabled chips lost their resting depth. Tabs authored a separate track fill. | Keep resting anatomy when disabled; reuse `selectable.surface/rest` for the tab track. Floating materials, lighting and elevation tokens remain unchanged. |
| Interaction states | Selected tabs/current navigation lost pointer feedback; inherited Field disability was inconsistent; composite parts dimmed twice; a disabled Select wrapper could still compress. | Keep quiet feedback over held tints, read effective Base state, and compose `state.disabledPart` once. Gate tactile compression in `ui.motion.ts`, without changing timing or amplitude. Tabs use the canonical inset keyboard ring. |
| Spacing and rhythm | Select's gap was on the popup rather than its List; Menu separators spanned past the content band; AlertDialog actions crowded its description; toast actions squeezed the copy. | Put spacing on the actual list, inset the public Divider, add footer breathing room and move toast actions below their copy. These remain component anatomy. |
| Optical balance and direction | Physical row alignment and Switch thumb travel did not mirror. Toast action placement needed to align the whole target rather than nudge the glyph. | Logical text alignment and thumb start/translation; compensate the text action's logical start padding as a whole. Keep targets, icon slots, first-line marks and existing optical corrections intact. |

The smallest shared authorities own repeated rules: `ui.common.ts` and `ui.motion.ts`.
Component files own only their anatomy and choice of recipe. `tokens.ts`, the CSS compiler,
public exports, dependencies and size-budget baselines did not change.

## Deliberate differences retained

- Drawer is attached to the viewport: square attachment corners, tighter exposed sheet corners.
  All four sides were reviewed in both themes; it should not acquire Dialog's free-floating shape.
- Dialog and AlertDialog remain the large hero material; anchored popups use acrylic, hints use
  denser acrylic, and grounded content stays matte. This is hierarchy, not inconsistency.
- Commands remain denser than selection options. Compact segments remain smaller than normal tabs.
- Badges and passive tags stay flat; toggle chips and selected segments remain tactile. Navigation
  uses a quieter current-destination tint than a selected value in a collection.
- Textarea remains multiline. Read-only values stay readable/browsable, not disabled-looking;
  only unavailable parts dim. Search has loading feedback, not an invented validation API.
- Checkbox/radio boundaries and Switch tracks remain stable. Spring arrival belongs to marks;
  thumbs and indicators relocate without overshoot. Reduced motion preserves feedback, not travel.
- A disclosure chevron belongs to its whole row; status marks and dismiss controls belong to the
  first readable line. Code content remains LTR inside an RTL document.
- No changes were warranted to Avatar, Progress, Spinner, Skeleton, rich-content typography,
  the well-depth model, or the existing hit-target/mark separation.

## Regression and baseline review

Added eighteen always-on both-theme browser checks in `visual-consistency.spec.ts`, plus two
opt-in artifact-producing reviews. The assertions measure geometry, computed paint and real
interaction rather than matching class strings. The narrow Tabs test now verifies an inset
keyboard ring at the scrolled edge instead of assuming an outward ring. The motion test's
settling helper accepts `transform: none` under reduced motion; its scale and bounding-box
assertions still require zero compression.

The deterministic baseline was regenerated with `bun --filter sherick-ui visual --update`.
Reviewed changes are the recipes/anatomy above and their generated utility rules. All four
token blocks compare identically to the old baseline. No palette, shadow, motion-duration or
curve token changed. Shared disabled classes are composed rather than duplicated, keeping the
existing bundle budget green without raising it.

Only `core-light-linux.png` and `core-dark-linux.png` changed in the browser baselines. The
intentional tab-track/corner/spacing changes were inspected against actual and difference images.
The refresh also records already-landed palette and settled Switch rendering that the older
screenshots predated; those are not new palette edits in this pass. Both Dialog screenshots
remain unchanged. Screenshot tolerance and accessibility rules were not relaxed.

## Follow-ups: the one-line rule and its siblings

### One-line toast balance

A reported one-line toast exposed excess bottom space from the 44px dismiss target. Its
top-only negative margin left 12px below title-only copy and 10px below description-only copy.
Compensating both vertical margins keeps the content at 16px above and below without shrinking
the target, moving its mark, or changing first-line alignment. Multiline and action toasts were
already content-height-driven and remain unchanged.

Twenty-four new cases in `toast.spec.ts` cover six content forms in both themes at 1280px and
375px, including equal vertical spacing, intact targets, first-line alignment, inset keyboard
focus and dismissal. Before the fix all eight single-line cases failed (28px/26px below versus
16px above); the sixteen multiline/action cases passed. After the fix all 24 passed, and the
full toast/optical-balance suite passed all 40 checks. Before/after captures were inspected.

### The same rule had not reached `Alert`

`Alert` carried the identical defect: `py-3.5` (14px), a `leading-6` copy line (24px) and the
same 44px dismissal, compensated only on the top (`-me-2 -mt-2.5`). A one-line alert therefore
read at 14px above and 24px below — the same 10px of extra bottom space, in the sibling
component that shares the rule.

`Alert` now gives its excess back on both vertical edges (`-my-2.5`), so a one-line alert
resolves to its copy's height. The 44×44 target, its mark's concentricity and first-line
alignment are unchanged, and the target still reaches into the surface's own padding rather
than shrinking to fit the line.

A new case in `optical-balance.spec.ts` sits beside the existing wrapped first-line test and
asserts that the copy occupies exactly one line, that the insets above and below are equal and
equal the surface's own padding, that the surface's height is the copy plus that padding, that
the target is 44×44, and that the dismissal stays centred on the first line. It was validated
against the defect first: reverting only the class reproduces 14px above / 24px below and fails
the case, while the existing wrapped and multiline cases still pass either way.

**Why it is the last one.** Every other 44px `density.target` in the library is positioned
rather than in flow — `DialogDismiss` and `Search`'s submit control are absolutely placed
inside a padded surface — so none of them can size a content row, and `Toast` was already
fixed. Re-checking the library for an in-flow, first-line, oversized target found no third
instance. The showcase now carries one closeable alert at each extent, compact and wrapped.

The deterministic refresh removes the now-unused top-only utility and moves the two closeable
alert specimens to the symmetric one; no browser screenshot baseline or token changed for
either follow-up.

### Flaky waits hardened

Two tests asserted something exact without waiting for the condition that makes it exact, and each
reddened the gate once. Neither is a product defect; both waits were widened to the assertion they
precede, so neither masks anything.

**A direction-flip read.** `a document's own asymmetry follows the writing direction` flipped the
document and compared the geometry in the same turn. The flip itself is sound — a probe confirmed
the swapped padding is observable in the same turn once the browser is idle, and the test passed
15/15 in isolation — but a loaded browser can still hand the previous direction to the next read,
which the test then reported as a missing swap (24px/0px instead of 0px/24px). It now awaits the
swap it asserts.

**A settle measured through a rounded read.** `motion.spec.ts` awaited a press settling with
`expect.poll(() => scaleOf(...)).toBe(1)` and then compared `boundingBox()` for exact equality.
`scaleOf` reads the scale through `toFixed(3)`, so it reports `1` for anything from 0.9995 up — a
fraction of a pixel before the box has actually finished returning. CI caught the window: the
field was still at scale 0.99966 (352px wide, read as 351.91px) after the poll had already passed.
Both occurrences now await the box the assertion is about and confirm the scale afterwards, so the
exact comparison is no longer racing a looser wait.

## Verification and release gate

Final `bun run verify`: **passed**. This includes lint, temporal ownership, workspace typechecks,
library/Next/Vite production builds, package and contrast checks, unchanged bundle budgets,
packed-tarball consumer verification, the deterministic style contract, and both browser suites:

- Showcase: **201 passed**, two opt-in review captures skipped in ordinary CI.
- No-Tailwind consumer: **6 passed**.
- The opt-in light/dark rendered reviews also passed separately and their captures were inspected.
- Deterministic contract: 93 specimens, 26 overlay recipes, 559 scoped rules, four token blocks.

The polish/verification gate was green, but it was **not stable-release clearance**. Phase D later
resolved the CodeBlock server/client Prism hydration mismatch and added Firefox/WebKit gate coverage.
The Base UI open editable Combobox isolation defect remains the stable-release blocker; its current
evidence and exact release condition live in `RELEASE.md`. The counts above are the point-in-time
Phase B evidence, not the current Phase E gate totals. No package was published in this phase.
