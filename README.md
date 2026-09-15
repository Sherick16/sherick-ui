# Sherick UI

Sherick UI is a small React component library inspired by Material 3 Expressive: soft tonal surfaces, deliberate shape contrast, strong hierarchy and restrained motion without cloning Google's component system. The published component package is framework-agnostic and supports React 18/19.

The guiding rule is **quiet by default, expressive where it matters**. Dense information and ordinary form controls stay predictable; primary actions, selected states and overlays carry more visual emphasis.

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

`ActionButton` supports `filled`, `tonal` and `text` appearances plus `sm`, `md` and `lg` sizes. Semantic variants remain available for meaningful states such as danger or success rather than requiring every component to be chromatically loud.

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

- form controls share one neutral, borderless field language
- shape variation has a role: controls, pills, surfaces, hero overlays and circles
- semantic color communicates hierarchy or state instead of flooding every surface
- passive surfaces do not react to hover unless they are actually interactive
- short state motion is restrained; overlays and selection changes may be more expressive
- `prefers-reduced-motion` is respected
- the package remains font-agnostic

## Development

```bash
pnpm install
pnpm verify
```

`pnpm verify` runs TypeScript checking, builds both ESM/CJS plus declarations, and runs a consumer-oriented smoke check against the built package. Pull requests run the same verification in GitHub Actions.

The Next.js app in this repository is a development/showcase surface only; the published component runtime does not depend on Next.js.

## License

MIT
