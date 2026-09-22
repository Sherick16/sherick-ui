# Sherick UI

Sherick UI is a small React component library inspired by Material 3 Expressive: soft tonal surfaces, deliberate shape contrast, strong hierarchy and restrained motion without cloning Google's component system. The published component package is framework-agnostic and supports React 18/19.

The guiding rule is **quiet by default, expressive where it matters**. Every component draws on the same small design language — material, elevation, shape, edge, tone, state, density and motion — so a new one is designed by choosing existing primitives rather than inventing visual rules. That language is specified in [docs/DESIGN_LANGUAGE.md](docs/DESIGN_LANGUAGE.md), its canonical source of truth.

Interactive behavior is deliberately separate from visual design. Sherick UI uses [Base UI](https://base-ui.com/) as its unstyled behavioral and accessibility substrate wherever Base UI provides the primitive. Base UI owns generic mechanics such as keyboard navigation, focus management, ARIA relationships, form participation, portals, dismissal and popup positioning; Sherick UI owns the component anatomy, public design API and every visual decision.

## Release status / compatibility

The current stable release is `2.0.0`, published under npm's `latest` dist-tag. The `1.x` line is
frozen and receives no further releases. API compatibility is promised from `2.0.0` onward under
ordinary semver. No prerelease is promoted to `latest` by the stable transition.

The full contract lives in [`docs/RELEASE.md`](docs/RELEASE.md): what counts as a breaking
change, the public export subpaths, the styling import order and theme contracts, the
supported React, browser and Node baselines, the internal-infrastructure boundaries (Base UI,
Tailwind) and the size-budget policy.

## Installation

```bash
bun add sherick-ui
```

The untagged install resolves to stable `2.0.0`.

Import the complete stylesheet once near your application root. If the application has a framework stylesheet, Tailwind build or reset, load that first and Sherick UI second:

```tsx
import "./app.css";
import "sherick-ui/styles.css";
```

That order is intentional. Sherick UI ships its already-compiled internal utility graph; loading it after a host Tailwind/reset prevents the host from accidentally redefining one of the same generic utility class names and changing component anatomy. If you maintain a dedicated application override stylesheet for Sherick components, load that override after `sherick-ui/styles.css`.

That is the entire styling integration. Sherick UI compiles its own component CSS; consumers do not need Tailwind, a Sherick preset, package content scanning, or any other styling build configuration.

Tailwind CSS is used privately inside the Sherick UI repository as an authoring compiler. It is not part of the published consumer contract.

If you only need the runtime theme variables without component styles, `sherick-ui/theme.css` is also exported as a token-only stylesheet.

## Light, dark and system themes

Sherick UI does not require a React theme provider. Theme selection is CSS-only and uses one optional attribute on the document root:

```ts
// Force light mode
document.documentElement.dataset.sherickTheme = "light";

// Force dark mode
document.documentElement.dataset.sherickTheme = "dark";

// Follow prefers-color-scheme
document.documentElement.removeAttribute("data-sherick-theme");
```

With no `data-sherick-theme` attribute, Sherick UI follows the operating-system `prefers-color-scheme` value. This keeps the runtime framework-agnostic and lets React, Next.js, Remix, Vite, Astro or plain DOM applications own persistence however they prefer.

If a persisted user choice is applied client-side, set the attribute before first paint to avoid a theme flash:

```html
<script>
  try {
    const theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.sherickTheme = theme;
    }
  } catch {}
</script>
```

Themes are intentionally document-level. Sherick overlays portal to `document.body`, so root-level theme variables naturally apply to Dialog, Select and Tooltip surfaces as well. Arbitrary nested theme islands are not currently a supported contract.

### Custom themes

The supported customization surface is the `--sui-*` CSS-variable system. Override roles rather than component selectors:

```css
:root {
  --sui-primary: 0.50 0.17 255;
  --sui-primary-strong: 0.47 0.19 257;
  --sui-on-primary: 0.985 0.005 255;
}
```

Or target a forced theme:

```css
[data-sherick-theme="dark"] {
  --sui-primary: 0.74 0.14 270;
}
```

Core roles include the canvas/surface levels, two text roles plus a compact detail role, accent hierarchy, semantic states and their `on-*` colors, focus/scrim roles, structural edge tint, elevation ladder, acrylic recipes, motion and syntax-highlighting colors.

Sherick UI's generated theme CSS is layered, so ordinary unlayered application CSS can override these variables without `!important` or selector escalation.

### One light source

Every depth cue derives from a single light model: light comes from **directly above** the surface plane. `--sui-light-top` and `--sui-light-bottom` are the two values the elevation ladder composites from, so re-tinting that pair re-lights every shared shadow and highlight. Acrylic is a separate material family (`--sui-glass-*`) calibrated per theme but following the same top-to-bottom lighting model.

### Elevation

Depth is token-driven, and the ladder is the only source of shadow in the library:

| Role | Token | Use |
| --- | --- | --- |
| Flat | `--sui-elevation-flat` | passive surfaces |
| Raised | `--sui-elevation-raised` | tactile tonal controls |
| Floating | `--sui-elevation-floating` | acrylic overlays |
| Control | `--sui-elevation-control` | movable control parts at rest |
| Recessed | `--sui-elevation-recessed` | grooves, tracks, wells and held controls |

### Motion

Motion is chosen by what a part is doing, never by which component it belongs to. Nine intents
cover the library — `feedback`, `tactile`, `arrive`, `orient`, `relocate`, `direct`, `disclose`,
`presence` and `activity` — and each one is a named recipe in
`packages/ui/src/components/ui.motion.ts`, which owns every transition property, duration, curve
and reduced-motion rule in the package. The dynamics below the intents are tokenized rather than
hard-coded per component:

| Dynamic | Tokens | Used for |
| --- | --- | --- |
| Swift | `--sui-duration-press`, `--sui-ease-press` | immediate response: feedback and the press half of a tactile control |
| Settle | `--sui-duration-release`, `--sui-ease-release` | a tactile release settling, and a direct step |
| Glide | `--sui-ease-glide` with the settle duration, or with `--sui-duration-overlay` for a floating surface | an object crossing between two stable destinations, and a floating surface entering |
| Spring | `--sui-ease-spring` | the one restrained overshoot, reserved for a mark arriving |
| Exit | `--sui-duration-overlay-exit`, `--sui-ease-exit` | decisive departure |
| Continuous | `--sui-duration-activity` with `linear` | a loop that reports work: the fill of a bar whose extent is not known |

Overriding those variables at the document root retunes every motion in the library at once.

Base UI owns whether a floating primitive is mounted, opening or closing, plus its focus,
dismissal, portal and positioning mechanics. Sherick UI describes a surface's settled,
`data-starting-style` and `data-ending-style` states through a presence recipe and animates
transitions rather than keyframes, so a rapid open → close → open retargets instead of
restarting; no Sherick timer, mirrored open state or overlay lifecycle hook exists.

## Usage

```tsx
import { Button, Input, Dialog, Select } from "sherick-ui";
import "sherick-ui/styles.css";

export function Example() {
  return (
    <>
      <Input label="Email" name="email" type="email" required />
      <Select
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

`Button` supports `filled`, `tonal` and `text` appearances plus `sm`, `md` and `lg` sizes. `IconButton` supports `tonal`, `ghost` and `acrylic` appearances. Semantic variants remain available for meaningful states such as danger or success rather than requiring every component to be chromatically loud.

Components expose their relevant native HTML props and refs where appropriate. Base-backed interactive primitives delegate their generic widget semantics and accessibility mechanics to Base UI while retaining Sherick's visual language and focus treatment.

## Runtime, browser and accessibility support

Sherick UI supports React and React DOM 18 or 19. Its automated browser baseline is the Chromium,
Firefox and WebKit versions shipped by the repository's pinned Playwright release; Chrome, Edge and
Safari distribution builds and previous browser majors are not separately certified. The core package
has ESM and CommonJS entries; `sherick-ui/content` is ESM-only. The precise compatibility and semver
policy is recorded in [`docs/RELEASE.md`](docs/RELEASE.md).

Automated browser coverage includes exclusion-free axe scans plus keyboard and focus assertions. The
editable-`Combobox` blocker is resolved by a version-specific patch to Base UI's own isolation utility:
it uses Base's maintained focusability model and observes hidden subtrees for the popup's full open
lifetime, including newly mounted controls, controls that become focusable and every radio in a native
group. The exact audited Base UI package is bundled so npm consumers receive the fix. The patch can be
retired only when a released Base UI version passes the same open-state, live-mutation, restoration and
non-modal pointer gates.

## Components

The public package exports:

- Button and IconButton
- Alert, Avatar, Badge and Card
- Divider
- Field, Input, Search, Textarea and NumberField
- Select and Combobox
- Checkbox, RadioGroup and Slider
- Dialog (with `Dialog.Header`, `Dialog.Description`, `Dialog.Content` and `Dialog.Footer`), AlertDialog and Drawer
- Menu and Popover
- Accordion and Collapsible
- ToastProvider, ToastViewport, useToast and createToastManager
- DirectionProvider
- NavGroup and NavItem
- Skeleton and Spinner
- Switch
- Tabs
- Table
- Tooltip
- Chip and ChipGroup
- SegmentedControl and ToggleGroup (with `ToggleGroup.Item`)
- Progress

Public prop types and the shared `Variant` type are exported from the package root as well. The names above are the canonical ones — there are no compatibility aliases.

### Rich content: `sherick-ui/content`

`Markdown` and `CodeBlock` live on a separate subpath, not on the root export:

```tsx
import { Markdown, CodeBlock } from "sherick-ui/content";
import "sherick-ui/styles.css";

export function Docs() {
  return (
    <>
      <Markdown>{`# Heading

Some **markdown** with \`code\` and math: $E = mc^2$.`}</Markdown>
      <CodeBlock language="tsx">{`<Button appearance="filled">Save</Button>`}</CodeBlock>
    </>
  );
}
```

The rich-content stack — Prism, remark/rehype and KaTeX — is deliberately separate, so a
build that only uses core components never **bundles** a syntax highlighter or a Markdown
pipeline. Importing `Button` from `sherick-ui` does not reach `sherick-ui/content`.

That separation is a bundle boundary, not an install boundary: the rich stack is an ordinary
dependency, so installing `sherick-ui` installs it whether or not the subpath is imported.
Bundlers drop it for consumers who never import `sherick-ui/content`; package managers do not.

`sherick-ui/content` is ESM only — `react-markdown` and remark/rehype publish no CommonJS
build — so it has no `require` entry. From CommonJS, use dynamic import:

```js
const { Markdown } = await import("sherick-ui/content");
```

## Behavioral foundation

`@base-ui/react` is Sherick UI's direct behavioral dependency. Components import the relevant Base
primitive from public subpaths such as `@base-ui/react/dialog` or `@base-ui/react/select`; Sherick UI
does not maintain a parallel generic headless layer. The exact audited Base UI implementation is
bundled inside the package tarball so the editable-Combobox isolation patch reaches every consumer
rather than existing only in this workspace.

When Base UI provides the primitive, it owns keyboard navigation, roving focus, focus trapping/restoration, generated accessibility relationships, composite-control form participation, portals, anchored positioning/collision handling, outside interaction/Escape dismissal and popup lifecycle. Passive semantics such as cards, badges, navigation links and tables remain native HTML rather than being forced through a headless abstraction.

This boundary is intentional: upgrading behavior should normally mean upgrading Base UI and validating Sherick's integration tests, while changing Sherick's appearance should remain confined to its design language, recipes and tokens.

Base UI is **internal infrastructure**. Consumers never import it to use Sherick UI, and Base UI's own props, DOM structure and generated IDs are not part of this package's compatibility promise.

## Design language

[`docs/DESIGN_LANGUAGE.md`](docs/DESIGN_LANGUAGE.md) is the canonical source of truth for Sherick UI's visual language: the material, elevation, edge, shape, tone, state, motion and density rules, the light model, the accessibility and focus requirements, and the examples of when each primitive should and should not be used.

Components compose the primitives in `packages/ui/src/components/ui.common.ts`; none of them writes a color, tone role, material recipe, shadow, radius, duration, state treatment, structural rim or focus ring of its own. A new component is designed by choosing primitives — and if a genuinely new visual rule is needed, the language is extended there first. Ordinary anatomy — layout, spacing, component padding, intrinsic size, responsive arrangement and content typography — is decided inside the component.

## Development

```bash
bun install
bun run dev
bun run verify
```

The private `apps/showcase` workbench includes `System`, `Light` and `Dark` controls so every component and state can be reviewed against all supported themes, and it links to the canonical design language from its heading.

`bun run verify` covers source checks, ESM/CommonJS/declaration builds, the production Next showcase, a Tailwind-free Vite consumer, local styling-contract checks, packed React 18/19 consumers with Vite/Next browser checks, size/tree-shaking budgets, deterministic style-contract snapshots, the full Chromium browser suites and the Firefox/WebKit smoke matrix. See [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for the contract of each layer.

The Next.js app in `apps/showcase` is a development/showcase surface only; the published component runtime does not depend on Next.js.

## License

MIT
