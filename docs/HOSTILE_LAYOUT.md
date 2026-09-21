# Phase C — hostile-layout hardening

## Status

Phase C's automated composition matrix is complete. The full release gate passes, including
all three engines for the new hostile consumer. This is not a claim of exhaustive device,
assistive-technology or operating-system coverage; the remaining limits are explicit below.
No release was published.

## 1. Scenarios and ownership

`apps/no-tailwind/src/Hostile.tsx` at `/hostile` uses public package APIs and ordinary CSS,
not showcase/Tailwind repair wrappers. `tests/hostile.spec.ts` exercises:

- direct children of a 220px grid at 320/640/1280px viewports, in LTR and RTL;
- 220px flex rows with competing fields and actions;
- long labels, unbroken identifiers, descriptions, validation, table cells and code;
- local scrolling of tabs, toggle/segmented tracks, tables, Markdown tables and code;
- loading state geometry, accessible names and disabled state;
- all four physically named Drawer sides in RTL, short modals, and reachable first/last actions;
- Select, Combobox, Menu, Popover and Tooltip at all four viewport corners;
- nested fields, popups and menus inside Dialog/Drawer, hit testing, Escape order and focus restoration;
- a viewport reduction while editing, native Drawer PageDown, long toast content/actions,
  and notifications raised over an already open modal;
- RTL Slider endpoint geometry and keyboard direction, coarse-pointer tapping and target clearance;
- 200%/400% equivalent reflow and 200% root-font sizing.

Fields yield width; ordinary readable copy wraps; compact badge/chip/navigation/value slots
may truncate. Wide structured content scrolls at the object that owns it, not at the page.
Base UI continues to own keyboard mechanics, placement, portals, focus and dismissal.

## 2. Confirmed failures and root causes

The original `5f80ff7` baseline allowed automatic min-content widths and unbroken text to
inflate narrow columns (an isolated Input reached roughly 901px in a 220px grid). A segmented
track depended on its consumer to supply scrolling. Markdown tables could widen their prose.
Center alignment put the start of a tall dialog above its reachable scroll origin. Physical
Drawer attachments reversed under inherited RTL flex direction. A no-icon loading Button
added a spinner slot and gained 28px. CSS-only RTL mirrored Slider geometry without informing
Base's keyboard direction. Fixed tooltip width ignored remaining collision space. Toast width
and height did not respect its viewport insets, and a persistent toast portal could paint below
a later modal scrim. A fixed hit-area extension enlarged a 28px Chip dismiss mark to 48px rather
than the intended 44px. Drawer focus landed outside its scrolling reading region.

## 3. Smallest-authority fixes

- `ui.common.ts`: shared shrinkable labelled-field recipe; disclosures reuse the existing
  option-row recipe and wrap prose; hit expansion derives from the target floor rather than
  adding the same inset to every mark; explicit notification stacking role.
- Component roots/slots: yield automatic minimum widths; bounded compact labels; local
  ToggleGroup scrolling also fixes SegmentedControl. Markdown owns a table scroller.
- `DialogSurface.tsx`: auto block margins preserve normal centering but yield when oversized;
  physical side attachment survives RTL; top/bottom sheets use dynamic viewport units.
  Modal and Drawer footers wrap actions. Drawer passes its reading region to Base initial focus.
- `Button.tsx`: a no-icon spinner overlays the existing label footprint. One label subtree
  remains mounted and accessible; icon-bearing buttons still substitute in their icon slot.
- Tooltip uses Base's available width; Popover wraps identifiers; Toast content has a dynamic
  viewport scroll bound, correct inline insets and the canonical notification stacking role.
- Public DOM-free `DirectionProvider` delegates directly to Base's existing provider. No local
  navigation or direction state machine was added. Packed-package checks cover the export.

## 4. Eliminated workarounds

Removed the showcase's external SegmentedControl scrolling wrapper. Consumers do not need
per-field minimum-width patches, blanket page clipping, a wrapper around every prose/table
composition, or a Base UI import for RTL. The workbench-only direction export was removed
and its callers migrated to the public provider. No compatibility alias remains.

## 5. Deliberate consumer constraints

Consumers still own their application's grid sizing, fixed-width custom children and overrides.
A `className` that deliberately imposes a minimum width or clipping can defeat the defaults;
the library does not override consumer CSS with `!important`. Existing consumer-override tests
remain part of the release gate. Keep document `dir` and `DirectionProvider.direction` in sync.
Drawer sides are physical; source code is LTR. Expanded small-mark targets need surrounding
clearance: density-normal rows provide it, arbitrarily packed 40px rows do not. Compact
selection labels may ellipsize; essential long prose belongs in readable content. Tooltips
remain short supplemental hints, not scrollable documents or interactive forms.

## 6. Browser findings and limits

Chromium, Firefox and WebKit pass the same new matrix without engine-specific assertions or
component branches. Native text metrics and scrollbar geometry vary; assertions use containment
and relative geometry instead of screenshot equality across engines. Collapsed-toast controls
are exposed on engagement by Base UI, not by adding another local focus manager.

Reflow tests reduce the CSS viewport to the space left at 200%/400% zoom; they do not drive a
browser's zoom UI. Root-font scaling is a separate test. Coarse-pointer emulation is not a
physical phone, and shrinking the viewport is not a real soft keyboard. Actual mobile keyboards,
browser chrome/safe areas, browser zoom controls and screen-reader announcements still merit
pre-release device spot checks. No claim of those manual checks is made here.

On the local Arch-family host, WebKit required compatible ICU/XML/flite libraries extracted
under `/tmp` and a `WEBKIT_EXECUTABLE_PATH` wrapper. Host packages and repository runtime code
were not changed for this. CI uses Playwright's supported `install --with-deps` for all three
engines; no browser is silently skipped when unavailable.

## 7. Regression evidence

The new suite has 29 scenarios per engine (87 executions). It checks containment, actual
scroll movement, reachable endpoints, pointer interception, keyboard effects, focus restoration
and accessible names—not just whether a component mounted. Existing Chromium suites retain
contrast, optical balance, focus, forced-colors, motion/interruption, CSS isolation, consumer
class overrides and screenshot checks. Palette tokens, motion recipes and screenshot baselines
are unchanged. The deterministic HTML/CSS contract baseline was regenerated and reviewed for
the intended layout, hit-area and loading-mark changes only.

## 8. Verification

`WEBKIT_EXECUTABLE_PATH=/tmp/sherick-webkit bun run verify` passes locally:

- lint; temporal-ownership policy; package and both consumers' typechecks/builds;
- package/style/contrast checks; bundle and tree-shaking budgets; packed ESM/CommonJS/SSR/CSS checks;
- deterministic style contract;
- showcase: **201 passed**, two optional visual-review artifact captures skipped;
- no-Tailwind consumer: **93 passed** (87 hostile executions plus six existing Chromium tests).

The supported CI command remains `bun run verify` after browser installation. Bundle budgets
were **not increased**: reusing `list.option` for the disclosure row removed duplicated recipe
assembly and kept the hardening within the existing limits. No generated CSS was hand-edited.

## 9. Completion decision

The reproduced composition defects are fixed and locked into the existing verification layers.
No known failing automated gate or confirmed unfixed defect remains in the exercised matrix.
The physical-device/manual-zoom limitations above remain release-checklist work, not evidence
that every possible hostile host layout is supported.
