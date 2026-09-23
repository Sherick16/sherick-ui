# Sherick UI

Sherick UI is a React 18/19 component library with soft tonal surfaces, deliberate shape
contrast and restrained motion. It is **quiet by default, expressive where it matters**.
[The design language](docs/DESIGN_LANGUAGE.md) defines its visual roles; [Base UI](https://base-ui.com/)
owns generic widget behavior and accessibility where a primitive is available.

**Release status:** `2.0.0` is stable under npm's `latest` tag. The `1.x` line is frozen;
ordinary semver compatibility starts at `2.0.0`. The additional v2.1 components in this
repository are **not yet published**. See the [release contract](docs/RELEASE.md).

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

Apply a saved choice before first paint to avoid a flash. Consumers customize through
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

The **unreleased** v2.1 source also exports `Calendar`, `DatePicker`, `DateRangePicker`,
`Command`, `CommandPalette`, `Pagination`, `Breadcrumb`, `FileUpload`, `Stepper` and
`TreeView`. Their current APIs are in [v2.1 component contracts](docs/V2_1_COMPONENTS.md).
Dates use civil `YYYY-MM-DD` values; FileUpload reports `File[]` without uploading files.
No new stylesheet or subpath is required when these additions are released.

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
