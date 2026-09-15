# Sherick UI

Sherick UI is a small React component library inspired by Material 3 Expressive: soft tonal surfaces, deliberate shape contrast, strong hierarchy and restrained motion without cloning Google's component system. The published component package is framework-agnostic and supports React 18/19.

The guiding rule is **quiet by default, expressive where it matters**. Sherick UI keeps ordinary information and form controls matte and predictable, then introduces richer color, motion and frosted depth when UI floats, activates or deserves emphasis.

## Installation

```bash
pnpm add sherick-ui
```

Sherick UI currently uses Tailwind CSS 3.x for its styling contract. Add the bundled preset and scan the package output so Tailwind can generate the utility classes used by the components:

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

## Usage

```tsx
import { ActionButton, Input, Modal } from "sherick-ui";

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
- genuinely floating UI may use dark acrylic: translucency, blur, saturation, an almost invisible edge light and soft elevation
- frosted material is reserved for overlays such as menus, tooltips and modals rather than normal cards
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
pnpm install
pnpm verify
```

`pnpm verify` runs TypeScript checking, builds both ESM/CJS plus declarations, and runs consumer-oriented smoke verification against the built package. It also rejects unsupported numeric Tailwind opacity modifiers that Tailwind 3 would otherwise silently omit; custom opacity values must use arbitrary syntax such as `/[0.78]`. Pull requests run the same verification in GitHub Actions.

The Next.js app in this repository is a development/showcase surface only; the published component runtime does not depend on Next.js.

## License

MIT
