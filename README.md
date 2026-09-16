# Sherick UI

Sherick UI is a small React component library inspired by Material 3 Expressive: soft tonal surfaces, deliberate shape contrast, strong hierarchy and restrained motion without cloning Google's component system. The published component package is framework-agnostic and supports React 18/19.

The guiding rule is **quiet by default, expressive where it matters**. Every component draws on the same small design language — material, elevation, shape, edge, tone, state, density and motion — so a new one is designed by choosing existing primitives rather than inventing visual rules. That language is specified in [docs/DESIGN_LANGUAGE.md](docs/DESIGN_LANGUAGE.md), its canonical source of truth.

Interactive behavior is deliberately separate from visual design. Sherick UI uses [Base UI](https://base-ui.com/) as its unstyled behavioral and accessibility substrate wherever Base UI provides the primitive. Base UI owns generic mechanics such as keyboard navigation, focus management, ARIA relationships, form participation, portals, dismissal and popup positioning; Sherick UI owns the component anatomy, public design API and every visual decision.

## Installation

```bash
bun add sherick-ui
```

Import the complete stylesheet once near your application root:

```tsx
import "sherick-ui/styles.css";
```

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

Core roles include the canvas/surface levels, three-step text hierarchy, accent hierarchy, semantic states and their `on-*` colors, focus/scrim roles, structural edge tint, elevation ladder, acrylic recipes, motion and syntax-highlighting colors.

Sherick UI's generated theme CSS is layered, so ordinary unlayered application CSS can override these variables without `!important` or selector escalation.

### One light source

Every depth cue derives from a single light model: light comes from **directly above** the surface plane. `--sui-light-top` and `--sui-light-bottom` are the two values the elevation ladder composites from, so re-tinting that pair re-lights every shared shadow and highlight. Acrylic is a separate material family (`--sui-glass-*`) calibrated per theme but following the same top-to-bottom lighting model.

### Elevation

Depth is token-driven, and the ladder is the only source of shadow in the library:

| Token | Role |
| --- | --- |
| `--sui-elevation-flat` | no shadow — matte surfaces separate by tone alone |
| `--sui-elevation-raised` | raised matte surfaces |
| `--sui-elevation-floating` | acrylic surfaces above the application |
| `--sui-elevation-control` | tactile controls at rest, a hair above their track |
| `--sui-elevation-recessed` | grooves, tracks and wells — and the depth a held control presses to |

### Motion

Motion is three families, each driven by shared tokens:

| Family | Durations | Easings | Used for |
| --- | --- | --- | --- |
| press | `--sui-duration-press` | `--sui-ease-press` | hover/focus/engaged tonality changes |
| release | `--sui-duration-release` | `--sui-ease-release` | tactile controls settling and selection travel |
| overlay | `--sui-duration-overlay`, `--sui-duration-overlay-exit` | `--sui-ease-release`, `--sui-ease-exit` | floating surface entry and exit |

Base UI owns whether a floating primitive is mounted, opening or closing, plus its focus, dismissal, portal and positioning mechanics. Sherick UI applies the shared visual recipes and motion tokens to those states.

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

Import Sherick's stylesheet before your application override stylesheet when you want normal application CSS to win naturally:

```ts
import "sherick-ui/styles.css";
import "./app.css";
```

`Button` supports `filled`, `tonal` and `text` appearances plus `sm`, `md` and `lg` sizes. `ActionButton` remains as a deprecated naming alias. `IconButton` supports `tonal`, `ghost` and `acrylic` appearances. Semantic variants remain available for meaningful states such as danger or success rather than requiring every component to be chromatically loud.

Components expose relevant native HTML props and refs where appropriate. Base-backed interactive primitives delegate their generic widget semantics and accessibility mechanics to Base UI while retaining Sherick's visual language and focus treatment.

## Components

The public package exports:

- Button and IconButton (`ActionButton` is a deprecated naming alias)
- Alert, Avatar, Badge and Card
- CodeBlock and Markdown
- Divider
- Select (`Dropdown` is a deprecated naming alias)
- Input, Search and Textarea
- Dialog (`Modal` is a compatibility name, with `Header`, `Description`, `Content` and `Footer` composition)
- NavGroup and NavItem
- Skeleton and Spinner
- Switch
- Tabs (`TabGroup` is a compatibility name)
- Table
- Tooltip

Public prop types and the shared `Variant` type are exported from the package root as well.

## Behavioral foundation

`@base-ui/react` is a direct Sherick UI runtime dependency. Components import the relevant Base primitive directly from public subpaths such as `@base-ui/react/dialog` or `@base-ui/react/select`; Sherick UI does not maintain a parallel generic headless layer.

When Base UI provides the primitive, it owns keyboard navigation, roving focus, focus trapping/restoration, generated accessibility relationships, composite-control form participation, portals, anchored positioning/collision handling, outside interaction/Escape dismissal and popup lifecycle. Passive semantics such as cards, badges, navigation links and tables remain native HTML rather than being forced through a headless abstraction.

## Styling architecture

`packages/ui/src/styles/tokens.ts` is the canonical runtime token source. The package build generates `dist/theme.css`, privately compiles the utility recipes used by Sherick components, scopes those rules to Sherick-owned DOM, includes rich-content CSS/assets, and assembles `dist/styles.css`.

The internal `.sui-scope` marker exists only to prevent generic authoring utilities from leaking into consumer applications. It is not a supported consumer selector and should not be targeted by application code.

The published stylesheet contains no Tailwind preflight/reset and no global utility selectors. Independently portaled styled subtrees establish the same internal scope so Dialog, Select and Tooltip render correctly outside their trigger ancestry.

## Design language

[`docs/DESIGN_LANGUAGE.md`](docs/DESIGN_LANGUAGE.md) is the canonical source of truth for Sherick UI's visual language: material, elevation, edge, shape, tone, state, motion and density rules, the light model, accessibility/focus requirements, and examples of when each primitive should and should not be used.

Components compose the primitives in `packages/ui/src/components/ui.common.ts`; none of them should invent a color, tone role, material recipe, shadow, radius, duration, state treatment, structural rim or focus treatment locally. Ordinary anatomy — layout, spacing, component padding, intrinsic size, responsive arrangement and content typography — remains component-owned.

## Development

```bash
bun install
bun run dev
bun run verify
```

The private `apps/showcase` workbench reviews the complete system. The separate `apps/no-tailwind` fixture exists specifically to prove that the published package renders correctly without Tailwind or any consumer-side Sherick styling configuration.

`bun run verify` covers source checks, ESM/CommonJS/declaration builds, generated/scoped CSS invariants, production Next and no-Tailwind Vite consumers, a clean `npm pack` consumer install, deterministic style-contract snapshots, interaction/accessibility checks, and Chromium visual regression. See [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

The application workspaces are development/verification surfaces only; the published component runtime does not depend on Next.js, Vite or Tailwind.

## License

MIT
