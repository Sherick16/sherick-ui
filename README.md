# Sherick UI

Sherick UI is a small React component library inspired by Material 3 Expressive: soft tonal surfaces, deliberate shape contrast, strong hierarchy and restrained motion without cloning Google's component system. The published component package is framework-agnostic and supports React 18/19.

The guiding rule is **quiet by default, expressive where it matters**. Sherick UI keeps ordinary information and form controls matte and predictable, then introduces richer color, motion and smoked liquid-glass depth when UI floats, activates or deserves emphasis.

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

Use the attribute on `document.documentElement` for application-wide themes. Sherick overlays such as `Modal` portal to `document.body`, so a root-level theme naturally applies to portaled UI as well.

### Custom themes

The Tailwind names exposed by the library are semantic, while their actual values come from CSS variables. Consumers can override those variables without forking component styles:

```css
[data-sherick-theme="light"] {
  --sui-primary: 0.50 0.17 255;
  --sui-canvas: 0.97 0.006 255;
  --sui-surface: 0.99 0.004 255;
}
```

Core variables include the canvas/surface ladder, foregrounds, primary/accent colors, semantic colors, inverse foregrounds, focus/scrim roles, the elevation ladder, liquid-glass gradients and syntax-highlighting colors. Components continue to reference semantic Tailwind classes such as `bg-sherick-surface`, `text-sherick-ink` and `text-sherick-primary`, so the same markup works in both modes.

Depth is token-driven too, and is the only source of shadow in the library: `shadow-sherick-grounded` resolves to `--sui-elevation-grounded` (no shadow — separation comes from surface color), `shadow-sherick-raised` to `--sui-elevation-raised` (soft contact shadow) and `shadow-sherick-floating` to `--sui-elevation-floating` (deeper shadow plus a hairline glass edge light). Overriding those three variables re-tunes elevation for every surface without touching components.

Matte interactive controls use a separate tactile pair rather than the surface ladder: `shadow-sherick-control` (`--sui-elevation-control`) is the faint contact shadow and microscopic top highlight a control holds at rest, and `shadow-sherick-pressed` (`--sui-elevation-pressed`) is the shallow inset it takes while pressed or selected. Both stay shallower than any surface step, so a control reads as tactile rather than raised.

## Usage

```tsx
import { ActionButton, Input, Modal } from "sherick-ui";
import "sherick-ui/theme.css";

export function Example() {
  return (
    <>
      <Input label="Email" name="email" type="email" required />
      <ActionButton appearance="filled">Save</ActionButton>
      <ActionButton appearance="text" variant="secondary">Cancel</ActionButton>
    </>
  );
}
```

`ActionButton` supports `filled`, `tonal` and `text` appearances plus `sm`, `md` and `lg` sizes. `IconButton` supports `tonal`, `ghost` and `acrylic` appearances. Semantic variants remain available for meaningful states such as danger or success rather than requiring every component to be chromatically loud.

Components expose their relevant native HTML props and refs where appropriate. Loading buttons are disabled automatically, form labels are associated with their controls, and interactive primitives include keyboard/ARIA behavior and a consistent visible focus language.

## Components

The public package exports:

- ActionButton and IconButton
- Alert, Avatar, Badge and Card
- CodeBlock and Markdown
- Divider
- Dropdown
- Input, Search and Textarea
- Modal with `Modal.Header`, `Modal.Content` and `Modal.Footer`
- NavGroup and NavItem
- Skeleton and Spinner
- Switch
- TabGroup
- Table
- Tooltip

Public prop types and the shared `Variant` type are exported from the package root as well.

## Visual principles

- ordinary controls and dense information use matte tonal surfaces
- shadow expresses elevation and nothing else: grounded surfaces are matte, tonal controls and lifted surfaces take a soft contact shadow, floating surfaces take the deepest one
- matte interactive controls stay tactile: a faint lift at rest, a shallow inset once pressed or selected, and no elevation change on hover
- genuinely floating UI may use smoked liquid glass: translucency, blur, saturation and a hairline edge light
- glass is reserved for overlays such as menus, tooltips and modals rather than normal cards
- light mode is a separately designed soft theme, not an inversion of the dark palette
- shape variation has a role: controls, pills, surfaces, hero overlays and circles
- semantic color communicates hierarchy or state instead of flooding every surface
- fields become subtly more luminous on focus rather than relying on borders
- button-like controls use restrained compression and expressive release motion
- passive surfaces do not react to hover unless they are actually interactive
- dense desktop UI remains compact; expressive does not mean oversized everywhere
- `prefers-reduced-motion` is respected
- the package remains font-agnostic

## Development

```bash
bun install
bun run dev
bun run verify
```

The development workbench includes `System`, `Light` and `Dark` controls so every component and state can be reviewed against all supported themes.

`bun run verify` lints, runs TypeScript checking, builds both ESM/CJS plus declarations, and runs consumer-oriented smoke verification against the built package. It also rejects unsupported numeric Tailwind opacity modifiers that Tailwind 3 would otherwise silently omit and rejects raw theme-specific neutral utilities in reusable UI code. Pull requests run the same verification in GitHub Actions.

The Next.js app in this repository is a development/showcase surface only; the published component runtime does not depend on Next.js.

## License

MIT
