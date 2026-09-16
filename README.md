# Sherick UI

Sherick UI is a small React component library inspired by Material 3 Expressive: soft tonal surfaces, deliberate shape contrast, strong hierarchy and restrained motion without cloning Google's component system. The published component package is framework-agnostic and supports React 18/19.

The guiding rule is **quiet by default, expressive where it matters**. Every component draws on the same small design language — material, elevation, shape, edge, tone, state, density and motion — so a new one is designed by choosing existing primitives rather than inventing visual rules. That language is specified in [docs/DESIGN_LANGUAGE.md](https://github.com/Sherick16/sherick-ui/blob/main/docs/DESIGN_LANGUAGE.md), its canonical source of truth.

Interactive behavior is deliberately separate from visual design. Sherick UI uses [Base UI](https://base-ui.com/) as its unstyled behavioral and accessibility substrate wherever Base UI provides the primitive. Base UI owns generic mechanics such as keyboard navigation, focus management, ARIA relationships, form participation, portals, dismissal and popup positioning; Sherick UI owns the component anatomy, public design API and every visual decision.

## Installation

```bash
bun add sherick-ui
```

Sherick UI uses Tailwind CSS 3.x for its styling contract. Import the theme stylesheet once near your application root, then add the bundled Tailwind preset and scan the package output:

```tsx
import "sherick-ui/theme.css";
```

```js
// tailwind.config.js
const sherickUi = require("sherick-ui/tailwind-preset");

module.exports = {
  presets: [sherickUi],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./node_modules/sherick-ui/dist/**/*.{js,cjs}",
  ],
};
```

The preset retains dark-theme fallback values so existing consumers do not fail if `theme.css` is omitted, but importing the stylesheet is required for runtime light/dark theming.

## Light, dark and system themes

Sherick UI does not require a React theme provider. Theme selection is owned by CSS and one optional attribute on the document root:

```ts
// Force light mode
document.documentElement.dataset.sherickTheme = "light";

// Force dark mode
document.documentElement.dataset.sherickTheme = "dark";

// Follow prefers-color-scheme
document.documentElement.removeAttribute("data-sherick-theme");
```

With no `data-sherick-theme` attribute, `theme.css` follows the operating-system `prefers-color-scheme` value. This keeps the component runtime framework-agnostic and lets React, Next.js, Remix, Vite, Astro or plain DOM applications own persistence however they prefer.

If a persisted user choice is applied client-side, set the attribute before first paint to avoid a theme flash. For example:

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

Use the attribute on `document.documentElement` for application-wide themes. Sherick overlays portal to `document.body`, so a root-level theme naturally applies to portaled UI as well.

### Custom themes

The Tailwind names exposed by the library are semantic, while their actual values come from CSS variables. Consumers can override those variables without forking component styles:

```css
[data-sherick-theme="light"] {
  --sui-primary: 0.50 0.17 255;
  --sui-canvas: 0.97 0.006 255;
  --sui-surface: 0.99 0.004 255;
}
```

Core variables include the canvas/surface levels, the three-step text hierarchy, the accent hierarchy (`--sui-primary`, `--sui-primary-strong`, `--sui-primary-soft`, `--sui-accent`), semantic states, the structural edge tint (`--sui-edge`), focus/scrim roles, the elevation ladder, the liquid-glass recipes and syntax-highlighting colors. Components reference semantic Tailwind classes such as `bg-sherick-surface`, `text-sherick-ink` and `text-sherick-edge`, so the same markup works in both modes.

### One light source

Every depth cue derives from a single light model: light comes from **directly above** the surface plane. `--sui-light-top` (the highlight color) and `--sui-light-bottom` (the shade color) are the two values the elevation ladder composites from, so re-tinting that pair re-lights every shadow, edge highlight and pressed state at once. The acrylic recipes are a separate family (`--sui-glass-*`): calibrated per theme, following the same top-to-bottom model without compositing from those two values. The model itself is specified in [docs/DESIGN_LANGUAGE.md](https://github.com/Sherick16/sherick-ui/blob/main/docs/DESIGN_LANGUAGE.md).

### Elevation

Depth is token-driven, and the ladder is the only source of shadow in the library. Overriding these variables re-tunes elevation for every surface without touching a component:

| Utility | Token | Role |
| --- | --- | --- |
| `shadow-sherick-flat` | `--sui-elevation-flat` | no shadow — matte surfaces separate by tone alone |
| `shadow-sherick-raised` | `--sui-elevation-raised` | raised matte surfaces and tactile tonal controls |
| `shadow-sherick-floating` | `--sui-elevation-floating` | acrylic surfaces above the application |
| `shadow-sherick-control` | `--sui-elevation-control` | tactile matte controls at rest, a hair above their own track |
| `shadow-sherick-recessed` | `--sui-elevation-recessed` | grooves, tracks and wells — and the depth a held control presses to |
| `shadow-sherick-pressed` | `--sui-elevation-pressed` | the published alias of that same recessed depth |

### Motion

Motion is three families, each a token pair. Retiming the library is a token edit:

| Family | Durations | Easings | Used for |
| --- | --- | --- | --- |
| press | `--sui-duration-press` | `--sui-ease-press` | a tonality change with no travel — hover, focus, an engaged field |
| release | `--sui-duration-release` | `--sui-ease-release` | a tactile control: press timing while held (`active:`), release timing as it settles, and the travel of a thumb or segment |
| overlay | `--sui-duration-overlay`, `--sui-duration-overlay-exit` | `--sui-ease-release`, `--sui-ease-exit` | the entrance and exit of anything that floats |

Base UI owns whether a floating primitive is mounted, opening or closing, plus its focus, dismissal, portal and positioning mechanics. Sherick UI applies the shared overlay material/elevation/shape recipes and motion tokens to those states; no Sherick-specific overlay lifecycle hook is required.

## Usage

```tsx
import { ActionButton, Input, Dialog, Select } from "sherick-ui";
import "sherick-ui/theme.css";

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
      <ActionButton appearance="filled">Save</ActionButton>
    </>
  );
}
```

`ActionButton` supports `filled`, `tonal` and `text` appearances plus `sm`, `md` and `lg` sizes. `IconButton` supports `tonal`, `ghost` and `acrylic` appearances. Semantic variants remain available for meaningful states such as danger or success rather than requiring every component to be chromatically loud.

Components expose their relevant native HTML props and refs where appropriate. Base-backed interactive primitives delegate their generic widget semantics and accessibility mechanics to Base UI while retaining Sherick's visual language and focus treatment.

## Components

The public package exports:

- ActionButton and IconButton
- Alert, Avatar, Badge and Card
- CodeBlock and Markdown
- Divider
- Select (`Dropdown` remains as a deprecated compatibility alias)
- Input, Search and Textarea
- Dialog (`Modal` remains as a compatibility name, with `Header`, `Content` and `Footer` composition)
- NavGroup and NavItem
- Skeleton and Spinner
- Switch
- TabGroup
- Table
- Tooltip

Public prop types and the shared `Variant` type are exported from the package root as well.

## Behavioral foundation

`@base-ui/react` is a direct Sherick UI runtime dependency. Components import the relevant Base primitive directly from public subpaths such as `@base-ui/react/dialog` or `@base-ui/react/select`; Sherick UI does not maintain a parallel generic headless layer.

When Base UI provides the primitive, it owns keyboard navigation, roving focus, focus trapping/restoration, generated accessibility relationships, composite-control form participation, portals, anchored positioning/collision handling, outside interaction/Escape dismissal and popup lifecycle. Passive semantics such as cards, badges, navigation links and tables remain native HTML rather than being forced through a headless abstraction.

This boundary is intentional: upgrading behavior should normally mean upgrading Base UI and validating Sherick's integration tests, while changing Sherick's appearance should remain confined to its design language, recipes and tokens.

## Design language

[`docs/DESIGN_LANGUAGE.md`](https://github.com/Sherick16/sherick-ui/blob/main/docs/DESIGN_LANGUAGE.md) is the canonical source of truth for Sherick UI's visual language: the material, elevation, edge, shape, tone, state, motion and density rules, the light model, the accessibility and focus requirements, and the examples of when each primitive should and should not be used.

Components compose the primitives in `components/UI/ui.common.ts`; none of them writes a color, tone role, material recipe, shadow, radius, duration, state treatment, structural rim or focus ring of its own. A new component is designed by choosing primitives — and if a genuinely new visual rule is needed, the language is extended there first. Ordinary anatomy — layout, spacing, component padding, intrinsic size, responsive arrangement and content typography — is decided inside the component.

## Development

```bash
bun install
bun run dev
bun run verify
```

The development workbench includes `System`, `Light` and `Dark` controls so every component and state can be reviewed against all supported themes, and it links to the canonical design language from its heading.

`bun run verify` lints, runs TypeScript checking, builds both ESM/CJS plus declarations, and runs consumer-oriented smoke verification against the built package. The smoke checks also protect the design language: they reject unsupported numeric Tailwind opacity modifiers that Tailwind 3 would otherwise silently omit, raw theme-specific neutral utilities and literal colors in reusable UI, theme-unsafe focus utilities, and any one-off shadow recipe outside the elevation ladder. Pull requests run the same verification in GitHub Actions.

The Next.js app in this repository is a development/showcase surface only; the published component runtime does not depend on Next.js.

## License

MIT
