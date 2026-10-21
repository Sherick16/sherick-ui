# Sherick UI

Sherick UI is a React 18/19 component library in graphite and iris, with
deliberate shape contrast and restrained motion. It is **quiet by default, expressive where it matters**.
[The design language](docs/DESIGN_LANGUAGE.md) defines its visual roles; [Base UI](https://base-ui.com/)
owns generic widget behavior and accessibility where a primitive is available.

**Release status:** `2.0.0` established the stable line; `1.x` is frozen. This
checkout's package version is `2.7.0`. Verified `main` stages releases for maintainer
approval; check npm for the installed version. See the [release contract](docs/RELEASE.md).

## Installation

```bash
bun add sherick-ui
```

Import host/framework/reset CSS **before** the complete Sherick stylesheet:

```tsx
import "./app.css";
import "sherick-ui/styles.css";
```

If selector-level overrides are needed, load a separate app override stylesheet afterward.
The published stylesheet is compiled, scoped and reset-free; consumers do not need Tailwind,
a Sherick preset or package-content scanning. `sherick-ui/theme.css` supplies only tokens
for applications that do not use the components. See the
[styling contract](docs/RELEASE.md#styling-import-contract).

## Light, dark and system themes

With no root `data-sherick-theme` attribute, the library follows
`prefers-color-scheme`. Set the attribute to `"light"` or `"dark"` to force a mode, or
remove it to return to system mode:

```ts
document.documentElement.dataset.sherickTheme = "dark";
document.documentElement.removeAttribute("data-sherick-theme");
```

Apply a saved choice before first paint to avoid a flash. When a user switches theme
while the page is open, controls animate their tone on the library's feedback timing
while page surfaces change at once, so for a moment the old theme's controls sit on the
new theme's page. Suppress transitions for the one frame in which the attribute changes:

```ts
const root = document.documentElement;
root.setAttribute("data-theme-switching", "");
root.dataset.sherickTheme = "dark";
requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute("data-theme-switching")));
```

```css
/* In the host stylesheet: */
[data-theme-switching] *,
[data-theme-switching] *::before,
[data-theme-switching] *::after {
  transition: none !important;
}
```

 Consumers customize through
root-level `--sui-*` CSS variables, not nested theme islands (portals leave their
trigger subtree). The [token source](packages/ui/src/styles/tokens.ts) is the authority
for default values; the [palette record](docs/PALETTE.md) explains the contrast
constraints. Example overrides must be rechecked with the contrast gate, especially
accent values on their own hover/pressed tints.

For RTL, set both `<html dir="rtl">` and `<DirectionProvider direction="rtl">`; keep them
in sync. Drawer sides remain physical and code content remains LTR.

## Usage

```tsx
import { Button, Input, Select } from "sherick-ui";
import "sherick-ui/styles.css";

export function Example() {
  return (
    <>
      <Input label="Email" name="email" type="email" required />
      <Select
        aria-label="Project"
        options={[
          { label: "Design system", value: "design" },
          { label: "Dashboard", value: "dashboard" },
        ]}
        defaultValue="design"
      />
      <Button appearance="filled">Save</Button>
    </>
  );
}
```

`Button` has `filled`, `tonal` and `text` appearances and `sm`, `md`, `lg` sizes.
Components accept relevant native props and refs; Base-backed controls retain their
own `onValueChange`, `onCheckedChange` or `onOpenChange` contracts rather than inventing
Sherick callback shims. Consult component types and the showcase for further examples.

## Components

The stable core barrel exports:

- actions/display: `Button`, `IconButton`, `Alert`, `Avatar`, `Badge`, `Card`, `Media`,
  `Divider`, `Skeleton`, `Spinner`, `Table` and `Progress`;
- forms/selection: `Field`, `Input`, `Textarea`, `Search`, `NumberField`, `Select`,
  `Combobox`, `Checkbox`, `RadioGroup`, `Slider`, `Switch`, `Chip`, `ChipGroup`,
  `ToggleGroup` and `SegmentedControl`;
- navigation/disclosure: `NavGroup`, `NavItem`, `Tabs`, `Accordion`, `Collapsible`;
- floating surfaces: `Dialog`, `AlertDialog`, `Drawer`, `Menu`, `Popover`, `Tooltip`,
  `ToastProvider`, `ToastViewport`, `useToast`, `createToastManager`;
- writing direction: `DirectionProvider`.

The `2.1.0` source also exports `Calendar`, `DatePicker`, `DateRangePicker`,
`Command`, `CommandPalette`, `Pagination`, `Breadcrumb`, `FileUpload`, `Stepper` and
`TreeView`. Their APIs are in [v2.1 component contracts](docs/V2_1_COMPONENTS.md).
Dates use civil `YYYY-MM-DD` values; FileUpload reports `File[]` without uploading files.
Check the installed package version before using these additions.

Version 2.2.0 adds Table column descriptors and `tableClassName`, plus `RadioGroup appearance="surface"`, without adding components. See the [package usage guide](packages/ui/README.md#table-and-surface-choices-from-220) and [resource-list recipe](examples/resources). Verify the installed version before using these additions.

Version 2.3.0 refines the visual language from the [visual design-system audit](docs/visual-design-system-audit.md): authored soft and selected surfaces per semantic role (new `--sui-<role>-soft` and `--sui-<role>-selected` theme variables), a consistent action depth ladder, type roles, component refinements, and the motion refinements from the [motion audit](docs/motion-audit.md) (a fading scrim, a press that lands inside a tap with amplitude tiers by role, tree disclosure, distance-aware timing and a 500ms tooltip delay). No component or prop is removed.

Version 2.5.0 adds `DateTimePicker`: a native `datetime-local` field whose popup sets hour, minute and (on a twelve-hour clock) day-period columns beside the shared calendar. Values are civil `YYYY-MM-DDTHH:mm` readings with no time zone; see its [contract](docs/V2_1_COMPONENTS.md#a1--datetimepicker-from-250). The native date fields of all three pickers now clip the browser's own calendar glyph in right-to-left pages too. No component or prop is removed.

Version 2.4.0 gives hollow controls a rim. Text fields, the file drop target and empty checkboxes and radios carry one 1.5px border in a new `--sui-rim` theme variable, tuned to clear 3:1 on every surface; fields become canvas-toned wells below the card; an invalid field turns only its rim to the danger tone; and the drop target has a custom dashed rim. Checkbox and RadioGroup marks are 20px, with an accent fill when selected. No component or prop is removed.

Version 2.9.0 refines the design language without removing anything. `Card` gains `Card.Title` and
`Card.Description`, and `Popover` gains `Popover.Title` and `Popover.Description`, so a surface's
heading takes the library's `title` role (now 16/24px) and names the popup. `Alert` and `Badge`
default to the neutral `secondary` variant — the iris accent is kept for what the reader acts on —
so pass `variant="primary"` where the accent was intended. A pagination's current page and a
Stepper's current step take a stronger in-track destination with an accent label. Library glyphs
render one 1.5px stroke at every size, paging uses chevrons, and the warning glyph is the triangle
everywhere. Option labels line up with the text of the field that opened them, a Menu's rows nest
concentrically at 4px, dialog descriptions and disclosure panels set 14/24px body copy, a stretched
`w-full` button presses at the wide tier, and a ghost `IconButton` presses its mark instead of its
target.

Version 2.8.0 removes the line from text fields. A field is identified by its label and content, as
WCAG 1.4.11 allows, so it is a quiet tray with no underline: the tray is a step deeper at rest, sinks
to a new `--sui-tray-deep` theme variable under the pointer and while focused, and the focus ring
marks engagement. An invalid field is a soft danger tray. Surface rows in `RadioGroup` and
`CheckboxGroup` rest on a tray, and the selected row carries an accent rim. Empty checkboxes, radios
and the file drop target keep their 3:1 rim. No component or prop is removed.

Version 2.7.0 is a visual overhaul with no API change. The palette moves from a blue-grey family to
graphite neutrals with one vivid iris accent; container corners tighten
(fields 12px, cards 20px, dialogs 24px) while actions stay capsules; the elevation ladder gains a
lit upper lip on raised actions and a hairline contact edge on floating sheets; and a choice held in
a track — a selected segment, the Tabs indicator — is now a raised white puck with an accent label
instead of a tinted fill, using a new `--sui-puck` theme variable. Text fields drop their drawn box: a field is a quiet
tray whose only 3:1 edge is its baseline, an invalid field is a soft danger tray, and a selected
surface row in `RadioGroup` or `CheckboxGroup` holds a soft tint instead of a lifted accent block. Every `--sui-*` variable keeps
its name; consumers who retune them keep working, though their values were recalibrated. No
component or prop is removed. See the [palette record](docs/PALETTE.md).

Version 2.6.0 is the form wave. It adds `Form` (a Base UI form that moves focus to the first invalid field on submit and takes a `{ name: message }` errors map) and `CheckboxGroup` (the options-API sibling of `RadioGroup`, with per-option descriptions and the `surface` card row). `Combobox` gains `multiple` — chosen values as removable chips inside the field, Backspace removing the last — and `creatable`, which adds typed entries, one entry per pasted line, and reports duplicates. `Select` and `Combobox` accept option groups (`{ label, options }`), `NumberField` and `Input` accept `prefix` and `suffix`, and `NumberField` passes Base's `format` and `locale` through. `RadioGroup` options take a `description` too. No component or prop is removed. See the [form recipes](packages/ui/README.md#forms-from-260).

Use `Media.Image` and `Media.Video` for rounded, clipped, responsive images and native video.
Video keeps its original aspect ratio unless you opt into a constraint. See the
[Media examples and accessibility contract](docs/MEDIA.md).

Rich content is deliberately behind an **ESM-only** subpath:

```tsx
import { Markdown, CodeBlock } from "sherick-ui/content";
```

Core imports never bundle Prism, remark/rehype or KaTeX, though those dependencies are
installed with the package. CommonJS consumers can dynamically `import("sherick-ui/content")`.
There are exactly five subpaths: core, `content`, development-only `dev`, `styles.css` and
`theme.css`. No compatibility aliases are published. The
[release contract](docs/RELEASE.md#public-export-contract) records module formats and
semver boundaries; [`packages/ui/README.md`](packages/ui/README.md) is the concise
consumer-facing package entry.

## Examples

Copyable examples include an [application sidebar](examples/sidebar/), a [settings page](examples/settings/), a [searchable project list](examples/resources/), and a [project detail page](examples/detail/). See the [example index](examples/README.md) for previews.

## Support and development

The core has ESM and CommonJS entries and supports React/React DOM 18 or 19. The tested
browser baseline is the Chromium, Firefox and WebKit versions pinned by Playwright;
shipping browser builds and previous majors are not separately certified. Base UI and
Tailwind are internal infrastructure, not consumer APIs. The audited patched Base UI
version is bundled to resolve editable-Combobox focus isolation; see the
[release record](docs/RELEASE.md#resolved-stable-release-blocker-editable-combobox-isolation).

```bash
bun install
bun run dev
bun run verify
```

The private [showcase](apps/showcase/app/page.tsx) offers light/dark/system review and
interactive specimens; the [no-Tailwind consumer](apps/no-tailwind) checks stylesheet
independence. `bun run verify` is the full lint, type, build, package, contrast, bundle,
visual-contract and browser gate. [Verification details](docs/VERIFICATION.md) distinguish
its layers and optional visual captures. The showcase is not part of the published runtime.

MIT licensed.
