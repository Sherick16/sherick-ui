# Rendered visual-consistency audit

## Scope and evidence

Reviewed the production-built catalog against `DESIGN_LANGUAGE.md`, starting from `5ed76ff`.
This was a rendered review, not a source-only normalization pass. No subagents were used.

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

## Verification and release gate

Final `bun run verify`: **passed**. This includes lint, temporal ownership, workspace typechecks,
library/Next/Vite production builds, package and contrast checks, unchanged bundle budgets,
packed-tarball consumer verification, the deterministic style contract, and both browser suites:

- Showcase: **176 passed**, two opt-in review captures skipped in ordinary CI.
- No-Tailwind consumer: **6 passed**.
- The opt-in light/dark rendered reviews also passed separately and their captures were inspected.
- Deterministic contract: 93 specimens, 26 overlay recipes, 559 scoped rules, four token blocks.

The polish/verification gate is green; this is **not stable-release clearance**. Existing risks in
`VERIFICATION.md` remain: Base UI's open editable Combobox accessibility isolation gap, and the
recorded CodeBlock server/client Prism hydration mismatch. This pass does not resolve or conceal
either. Browser evidence here is Chromium, not a new Firefox/WebKit certification. No package was
published; delivery stays on the prerelease development line.
