# v2.1 component contracts (unreleased)

This is additive work above stable `2.0.0`. Package version, publish configuration, five
subpaths, existing APIs, audited Base UI `1.8.0`, dependencies, tokens and motion owners
remain unchanged. No release or npm tag is part of this wave.

## Behavioral ownership

The audited Base UI exports no supported calendar, date-picker, tree, file-upload,
pagination or stepper primitive. Its temporal-adapter and composite **internals** are not
supported interfaces for this wave. Calendar date arithmetic, calendar/tree navigation,
file selection validation and small native navigation state therefore remain owned by
those components, not by a generic Sherick headless layer. Native inputs/buttons/links
own ordinary browser mechanics. Base Field owns field relationships; Base Popover owns
calendar popup positioning, focus, dismissal and lifecycle. Base Autocomplete explicitly
supports inline command pickers; it owns command filtering, highlight, ARIA and keyboard
activation. Base Dialog and the existing `DialogSurface` own palette modality.

No new material, token, motion rule, or dependency is needed. The canonical focus owner
adds the direct-parent selector form of the existing inset ring for nested tree rows. Component roots and portals
use `cn()`, existing material/shape/state/density/focus recipes and semantic motion intents.
A disabled subtree dims once. Selection/current state has semantic or textual evidence
besides color. Long content yields or wraps, and inherently wide content scrolls locally.
RTL applications keep document `dir` and `DirectionProvider` in sync.

## Shared API conventions

All components and public types below export from `sherick-ui`, not new subpaths. Modules
export their component as default. Refs are forwarded with React 18-compatible `forwardRef`.
`className` addresses the visible root; native root attributes are exposed where specified.
Base-backed callbacks retain their native event-details signatures. Component-owned domain
callbacks take the documented next domain value, not fabricated Base event details.
Consumers own network, routing, workflow and global application state.

## A — Date family

Exports: `Calendar`, `DatePicker`, `DateRangePicker`; `CalendarDate`, `DateRange`,
`CalendarProps`, `CalendarLabels`, `DatePickerProps`, `DateRangePickerProps`.

- `CalendarDate = string`: a valid, zero-padded Gregorian civil date `YYYY-MM-DD`, years
  `0001`–`9999`. No time or timezone is part of the value. Invalid dates are never selected.
  Arithmetic uses UTC calendar fields internally, never local timestamp offsets or DST.
- `DateRange = { start: CalendarDate | null; end: CalendarDate | null }`. Calendar range
  selection starts with `{start, end:null}`; a second selection sorts both endpoints.
  Selecting again after a complete range starts another range. A completed range cannot
  contain unavailable or out-of-bounds dates.
- `CalendarProps` is a discriminated union: `mode?: 'single'` uses
  `value?: CalendarDate|null`, `defaultValue?: CalendarDate|null`,
  `onValueChange?: (value: CalendarDate|null) => void`; `mode:'range'` uses the same names
  with `DateRange`. Empty range defaults to both endpoints null. Undefined means uncontrolled.
- Shared calendar props: `month?`, `defaultMonth?`, `onMonthChange?(month)` (same date format,
  normalized to day 01); `min?`, `max?` inclusive; `isDateUnavailable?(date):boolean`;
  `disabled?`, `invalid?`, `locale?:string` (deterministic default `en-US`);
  `weekStartsOn?:0|1|2|3|4|5|6` (default 1); `today?:CalendarDate` (default current UTC day;
  applications can pass their civil today for their locale); `labels?:Partial<CalendarLabels>`.
  Labels: `previousMonth`, `nextMonth`, `today`, `selectDate`, `selectRange`,
  `unavailableRange`. Defaults are English. Intl formats month/year, weekday and full-date
  accessible names with Gregorian calendar and UTC; locale never changes value semantics.
  Calendar additionally exposes native div attributes excluding conflicting value/change
  props and children; ref is its root div. An explicit accessible name overrides the default.
- One month grid with weekday headings, today (`aria-current='date'`) and selection
  (`aria-selected` on gridcells). One tabbable day, including unavailable-but-discoverable
  days marked `aria-disabled`; selection is refused on them. Arrow keys move by day/week,
  horizontal arrows mirror in RTL, Home/End move within the week, PageUp/PageDown move a
  month, Shift+PageUp/PageDown move a year, retaining/clamping day at month boundaries.
  Enter/Space selects. Month controls keep focus when pressed; keyboard month crossing
  retains day focus. Today navigates to today without silently selecting it. Bounds prevent
  escaping years 0001–9999. A controlled month that is rejected must not lose focus.
- Pickers expose the respective `value/defaultValue/onValueChange`, the constraints and
  locale/calendar options above (not standalone calendar `mode`, `month` or div props),
  `label:string`, `description?:ReactNode`, `error?:ReactNode`, `required?`, `disabled?`,
  `className?`, `id?`, `form?`, `open?`, `defaultOpen?`, `onOpenChange?` (Base Popover signature).
  Single has `name?`; range has `startName?`, `endName?`, `startLabel?:string` (Start date),
  `endLabel?:string` (End date). Ref points to single/start native input.
- Native `type=date` entry remains available (including native mobile UI), composing Base
  Field/Field.Control and the existing field recipes. A separate named calendar trigger
  opens the shared Calendar in a Base Popover. Range uses a native fieldset/legend plus
  independently labelled start/end fields. Native inputs own form submission, required,
  min/max validation; custom validity covers unavailable/reversed ranges. Editing can show
  invalid values with feedback; the calendar never selects one. Clearing uses null.
  A rejected native draft remains invalid until a fresh accepted edit/calendar selection,
  reset or controlled-value replacement; relaxing constraints does not silently accept it
  or emit callbacks. Constraint/enabled-state changes refresh Base's native custom validity
  even when the field's text is unchanged. Programmatic `new FormData()` does not validate;
  normal native submission remains blocked while a rejected draft is shown.
  Uncontrolled form reset restores defaults, including calendar selection; native reset does
  not emit value-change callbacks. Controlled values remain held. Base Field.Control does not
  bridge a native form reset to a date domain value, so the private date-field module listens
  on the input's actual owning form (including `form=`), after the cancelable reset event.
  This is date-field synchronization, not a generic form or controlled-state framework.
- Reuse the `Popover.tsx` shell/presence composition directly with Base public parts where
  `initialFocus` and `actionsRef.close()` are needed; no new overlay shell or open-state
  mirror. Initial popup focus is the active day via Base `initialFocus`; selection closes
  single/completed range through Base actions, Escape restores trigger focus. Popup is
  non-modal; it is labelled through Base Title. No animation inside the month grid.
- Focused evidence: leap days/year bounds, unavailable range, keyboard month/year crossing,
  controlled rejection and external updates, native entry/reset/FormData/invalid state,
  popup dismissal/restoration, RTL, narrow grid, locale labels and hydration.
- Excluded: TimeField, parsing prose, time selection, scheduling, timezone engines,
  multiple months, non-Gregorian calendars, shortcuts/presets.

## B — Command family

Exports: `Command`, `CommandPalette`; `CommandItem`, `CommandProps`, `CommandPaletteProps`.

- `CommandItem = { value:string; label:string; disabled?:boolean; group?:string;
  shortcut?:ReactNode; icon?:ReactNode; keywords?:string[] }`. Values are unique. Icons and
  shortcuts are metadata, not nested actions or registered keyboard shortcuts.
- `CommandProps`: `items:CommandItem[]`, `label:string`, `onAction?(value:string):void`,
  `value?:string`, `defaultValue?:string`, `onValueChange?` (Base Autocomplete query callback),
  `placeholder?:string`, `emptyMessage?:ReactNode`, `disabled?:boolean`, `locale?:string`,
  `filter?:((item:CommandItem,query:string)=>boolean)|null`, `className?`,
  `inputClassName?`, `id?`, `renderItem?:(item:CommandItem)=>ReactNode` (non-interactive content).
  Ref is the search input. Value is the query, never a retained action selection.
- Inline Base Autocomplete `open inline`, `autoHighlight='always'`, `keepHighlight`, native
  labelled input, Base groups/labels/collection and empty region. Default matching uses
  Base `useFilter` on label and keywords, not a fuzzy-search package. Activation fires once
  by pointer/Enter, does not submit surrounding forms, and does not replace query with the
  command label. Disabled actions stay discoverable/highlightable but cannot activate.
  Keep focus in the input; Base owns active-descendant wiring and keyboard navigation.
  Standalone Command remains available after activation/Escape. No local keyboard manager.
- `CommandPaletteProps` takes Command props except `className`/`id`, plus `title:string`,
  `description?:ReactNode`, `trigger?:ReactElement`, `open?`, `defaultOpen?`,
  `onOpenChange?` (Base Dialog signature), `className?` (dialog surface).
  Ref remains search input. Compose Base Dialog.Root/Trigger, existing DialogSurface,
  Base Title/Description in a compact header, and DialogDismiss; initialFocus points to search input.
  `actionsRef.close()` dismisses after action without maintaining another open state.
  Escape closes on the first press, focus returns to trigger/previous focus, uncontrolled
  query resets when palette unmounts; controlled query remains consumer-owned.
- Focused evidence: filtering/group/empty, repeated action activation and query retention,
  disabled action, keyboard/active-descendant, palette controlled/uncontrolled dismissal,
  first Escape and focus restoration, axe open state, narrow/long content and RTL.
- Excluded: global shortcuts, command history, routing, fetching, plugins, fuzzy infrastructure.

## C — Navigation family

Exports: `Pagination`, `Breadcrumb`; `PaginationProps`, `BreadcrumbItem`, `BreadcrumbProps`.

- `PaginationProps` extends native nav attributes (without children/defaultValue/onChange):
  `count:number` total pages (0 allowed), `value?:number`, `defaultValue?:number` (1),
  `onValueChange?(page:number):void`, `siblingCount?:number` (1), `disabled?:boolean`,
  `getPageHref?:(page:number)=>string`, `getPageLabel?:(page:number)=>string`,
  `previousLabel?:string`, `nextLabel?:string`. Ref is nav. Default nav name Pagination.
  Finite nonnegative count/sibling count are floored; invalid values normalize to 0/1.
  Totals above `Number.MAX_SAFE_INTEGER` are invalid: consecutive pages must remain distinct.
  Sibling count caps at 5, keeping every render bounded even for accidental huge prop values.
  Current page is clamped to available pages; zero pages has no current page or activation.
- Native nav/ol with real buttons, or anchors when getPageHref exists. Anchors preserve
  modified clicks/browser navigation; ordinary page activation reports callback without
  hijacking navigation. Disabled/boundary controls have no actionable href; they cannot
  activate. `aria-current='page'` identifies exactly the current page. Deterministic bounded
  set: first/last/current+sibling pages; a single missing page is shown, larger gaps are
  noninteractive ellipses hidden from AT. Previous/next remain reachable in narrow layouts;
  wrapping/local overflow never overflows the page. RTL mirrors directional glyphs, not
  numeric page identity. Native Tab/Enter/Space behavior, no roving-focus abstraction.
- Breadcrumb is passive/server-usable. `BreadcrumbItem = {label:ReactNode; href?:string}`;
  `BreadcrumbProps` extends native nav attrs without children, with `items:BreadcrumbItem[]`
  and `renderLink?:(item:BreadcrumbItem, props:AnchorHTMLAttributes<HTMLAnchorElement>)=>ReactNode`.
  Ref is nav, default name Breadcrumb. Native ordered list. Final item is current page,
  rendered as text with `aria-current='page'` even if href is supplied; intermediate hrefs
  are real anchors. Render escape hatch must spread supplied accessible/class/href props.
  Separators are decorative directional chevrons, mirror RTL. Long labels wrap and list
  yields to narrow parents; no automatic collapsing or router dependency.
- Focused evidence: count 0/1 and invalid/boundary inputs, bounded large-count gaps,
  controlled/uncontrolled page changes, href/native modified navigation, accessible current
  semantics, custom breadcrumb links, RTL/narrow/long labels and server markup.

## D — FileUpload

Exports: `FileUpload`; `FileUploadProps`, `FileRejection`.

- `FileUploadProps` extends div attributes excluding children/onChange/defaultValue:
  `label:string`, `description?:ReactNode`, `error?:ReactNode`, `files?:File[]`,
  `defaultFiles?:File[]`, `onFilesChange?:(files:File[])=>void`, `multiple?:boolean`,
  `accept?:string` (native comma-separated MIME/extensions), `maxSize?:number` bytes,
  `maxFiles?:number` (only multiple), `disabled?:boolean`, `onReject?:(items:FileRejection[])=>void`,
  `selectLabel?:string`, `removeLabel?:(file:File)=>string`, `clearLabel?:string`.
  Ref is native file input. `FileRejection={file:File; code:'type'|'size'|'count'; message:string}`.
- `files/defaultFiles` own the presented selection, NOT the file input's native value.
  Native picker is always uncontrolled and cleared after reading, permitting same-file
  reselection. There is deliberately no name/form/required submission contract: consumers
  construct FormData from onFilesChange; files are never mirrored into hidden string inputs
  or assigned to input.files. Native chooser restrictions remain in force.
- Click/keyboard opens native picker synchronously. Drop accepts files only, prevents browser
  navigation only over the owned drop zone, and uses the same validation as chooser. Multiple
  appends accepted files (dedupe name/size/type/lastModified); single replaces with the first
  accepted file and rejects extras. Type, per-file size and total count failures are reported
  and displayed with a live message; valid files in a mixed batch still enter. Empty MIME can
  match an extension but cannot establish a MIME-only match. Accept is UX, not server security.
- Native Field/label relationship where applicable; selected filenames are a semantic list,
  wrap including unbroken text, each removal is separately named with a full target.
  Removing a focused row transfers focus to the next removal or picker. Clear removes all.
  Drag state uses an existing held tone, and disabled disables picker/drop/removal/clear
  with no hover treatment. One opacity step, no fabricated progress.
- Focused evidence: chooser/drop parity, single/multiple/dedupe/reselection, mixed validation,
  max count, controlled rejection, disabled all paths, removal focus/live feedback and narrow
  filenames. No File constructor/read of browser globals during SSR.
- Excluded: uploads, network/storage, progress simulation, directories, previews/object URLs.

## E — Stepper

Exports: `Stepper`; `StepperProps`, `StepperItem`.

- One model for informative and interactive steps: `StepperItem={value:string;
  label:ReactNode; description?:ReactNode; complete?:boolean; disabled?:boolean}`.
- `StepperProps` extends nav attributes without children/defaultValue/onChange:
  `items:StepperItem[]`, `value:string|null`, `onValueChange?:(value:string)=>void`,
  `orientation?:'horizontal'|'vertical'` (horizontal), `disabled?:boolean`.
  Ref is nav, default name Progress steps. Current value is deliberately controlled:
  consumers own workflow; no wizard state or implied completion from item position.
- Native ordered list. Without callback: informative text, no focusable fake controls.
  With callback: native buttons, Tab order and Enter/Space, no tablist or panel contracts.
  Current publishes `aria-current='step'`; complete has a check and accessible Complete
  text; other steps retain their ordered numbers. Current wins over complete visually.
  Disabled is meaningful only for interactive steps, and cannot activate.
- Horizontal may wrap to avoid overflow; vertical wraps labels/descriptions. Logical
  alignment/gaps; no giant connecting rail, custom elevation or animation layer.
- Focused evidence: passive vs interactive semantics, current/complete state not color-only,
  disabled actions, controlled rejection, null/unknown current, many/long labels, RTL/narrow.
- Excluded: validation state machine, panels, automatic completion, wizard forms, error state.

## F — TreeView

Exports: `TreeView`; `TreeViewProps`, `TreeViewItem`.

- `TreeViewItem={value:string; label:string; icon?:ReactNode; disabled?:boolean;
  children?:TreeViewItem[]}`; unique values throughout the finite static tree.
- `TreeViewProps` extends div attributes without children/defaultValue/onChange:
  `items:TreeViewItem[]`, `label:string`, `value?:string|null`, `defaultValue?:string|null`,
  `onValueChange?:(value:string|null)=>void`, `expandedValues?:string[]`,
  `defaultExpandedValues?:string[]`, `onExpandedValuesChange?:(values:string[])=>void`,
  `disabled?:boolean`, `renderItem?:(item:TreeViewItem)=>ReactNode` (non-interactive label
  content only). Ref is root tree. Single selection only; selection does not follow focus.
- Narrow local tree implementation per APG, because Base lacks a supported primitive.
  `tree/treeitem/group` nesting, branch-only aria-expanded, aria-selected, named tree and
  independently named nodes (parent name must not concatenate descendants). One roving Tab
  stop, initial selected visible node or first visible node. Up/Down traverse visible nodes,
  Home/End reach first/last, forward arrow opens or enters first child, backward closes or
  reaches parent; forward/backward mirror RTL. Enter/Space selects. Typeahead matches visible
  labels, supports rapid characters/repeated letters without a focus/selection coupling.
- Disabled nodes remain discoverable/focusable but cannot select or toggle; disability is
  node-local, not implicitly inherited by already-visible descendants. Disabled whole tree
  has no actionable interactions and dims once. Arrow navigation may pass disabled rows.
  No nested buttons in treeitems: pointer chevron region toggles, row selects; keys supply
  equivalent behavior. Branch toggle has a 24px minimum pointer region within compact row.
- Collapse/external changes retain a valid visible Tab stop, move focus out of disappearing
  descendants to the nearest visible ancestor only if focus was in the tree, and never steal
  focus from outside. Controlled expansion rejection must not move focus to hidden nodes.
  Empty trees remain named and safe. Deep logical indentation is capped so labels retain
  usable space; nesting semantics remain complete. Local overflow/label wrapping or truncation
  does not create page overflow. Visible inset focus and selected tone come from shared recipes.
- Focused evidence: full APG traversal/typeahead, selection vs focus, controlled rejection,
  disabled branch/leaf, dynamic collapse/removal and external focus, ARIA hierarchy/names,
  RTL, deep/narrow/long content, SSR hydration and axe.
- Excluded: multi-select, checkbox tree, virtualization, drag reorder, lazy loading, networking.

## Implementation and verification ownership

Six independent source seams are isolated in worktrees. Unit A owns `Calendar.tsx`,
`DatePicker.tsx`, `DateRangePicker.tsx` and private date-family files; B owns `Command.tsx`
and `CommandPalette.tsx`; C owns `Pagination.tsx` and `Breadcrumb.tsx`; D/E/F own their
named files. Each owns `apps/showcase/components/v2-1/<unit>.tsx`, a dedicated
`app/verification/v2-1-<unit>/page.tsx`, and `tests/browser/v2-1-<unit>.spec.ts`.

Workers implement component modules/public types and those focused specimens/tests only.
The parent owns barrels, showcase registration, package smoke/packed/type fixtures,
documentation and shared-system/generated changes. Workers must not edit those surfaces,
install dependencies, change budgets or rebase/push/publish. They inspect adjacent patterns
before editing and run library typecheck, lint for their source, and motion policy; browser
specimens initially import their component source by relative path for isolated iteration.
The parent migrates them to package-root imports at integration and runs the browser checks
against the integrated published build. Tests use existing fixtures, hydration markers and
semantic/geometry assertions, not skipped checks or private implementation snapshots.

Every initial unit is implemented by DeepSeek V4.1 Flash and reviewed read-only by GPT-5.6
Sol High. The parent (GPT-6 Astra) verifies findings and owns every correction, focused
regression and integration. The complete diff receives independent architecture/API and
interaction/accessibility/design review tracks. The exact final tree must pass
`bun install --frozen-lockfile`, `bun run verify`, and `git diff --check` before PR delivery.

The shared publication fixtures exercise all ten components through installed package imports:
React 18/19 Vite and Next hydration, NodeNext/Bundler/CommonJS declarations, native forms,
portals and axe checks before/after invalid date/file entry. The no-Tailwind wave route runs
on Chromium, Firefox and WebKit, including RTL keyboard use, narrow themed portals and
reduced motion; forced-colors emulation is additionally asserted on Chromium.

The deterministic style-contract baseline adds 15 wave specimens and 35 net scoped utility
rules. Its existing 93 specimens, token blocks and overlay recipes are unchanged. The
forced-colors selection rule extends its existing declarations to calendar days and tree
rows; targeted fallbacks preserve direct-row focus and active-descendant highlighting.
The selected-files specimen pins owned-list normalization, and the interactive Stepper
specimen pins mark-only press motion. Test-only date bounds/forms and tree mutation probes
render only in their verification routes, not the showcase.

## Visual anatomy

The wave composes the existing language rather than adding new tokens or recipes:

- Date fields show one calendar affordance. Native date entry is clipped only at its trailing
  browser affordance; the input type, editing, validity and form behavior remain native. Firefox
  exposes no picker-indicator pseudo-element, so a WebKit-only icon rule is insufficient.
  The whole row receives field hover/focus feedback and tactile press. Base positions the popup
  against the field (the shared endpoint group for ranges), not the small trailing icon.
- A completed calendar range is one continuous selected-tone band per week, with rounded outer
  endpoints and stronger endpoint text. Single dates and incomplete ranges keep their circular
  mark. The selection and focus targets never move.
- Command has one search field with a fixed search-icon slot and a flat results list, not a
  second filled panel inside its host. Rows share an icon column when any command has an icon.
  Actions use pointer cursors and nonselectable labels; disabled rows retain Base's discoverable
  highlight without becoming actionable. The palette retains the shared acrylic dialog shell
  but uses a compact header. `placeholder` defaults to “Search commands…” and remains overridable.
- Pagination groups its destinations on a flat `matteHigh` surface, retains the quieter current
  navigation tint, and preserves 44px targets. Only number/glyph ink compresses on press.
  Breadcrumb uses compact navigation typography and explicit native-link decoration ownership.
- Horizontal steps use equal responsive columns, with a 32px mark above the label; vertical
  steps align marks to the first line and join them with the existing structural hairline.
  Descriptions are supporting copy. Neither target bounds nor focus boundaries compress.
- TreeView and FileUpload already use the intended row/well language. Their visual review does
  not justify a cosmetic rewrite. Showcase specimens size to content rather than stretching
  these components into empty neighboring panels; the date family gets room for its grids.

Screenshots must be inspected in addition to the deterministic style manifest. Computed classes,
passing API tests and an updated manifest do not establish that the rendered anatomy is good.
