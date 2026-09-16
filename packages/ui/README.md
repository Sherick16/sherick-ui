# Sherick UI

Sherick UI is a React component library with a soft, expressive design language and Base UI-backed interaction/accessibility primitives.

## Installation

```bash
bun add sherick-ui
```

Import the complete stylesheet once near your application root. Load framework/Tailwind/reset CSS first, then Sherick UI:

```tsx
import "./app.css";
import "sherick-ui/styles.css";
```

The order matters when the host also uses Tailwind: Sherick ships a precompiled internal utility graph, so loading it after host CSS prevents duplicate host utility definitions from changing Sherick component anatomy. A dedicated application override stylesheet may be loaded after `sherick-ui/styles.css` when selector-level overrides are required; ordinary Tailwind `className` conflicts are already resolved by Sherick's `cn()`/tailwind-merge composition.

That is the full styling integration. Consumers do not need Tailwind, a Sherick preset, package content scanning, or any other Sherick-specific CSS build configuration.

Tailwind is private authoring/build infrastructure inside the Sherick UI repository. The published package ships finished, scoped CSS and initializes the Tailwind runtime custom properties it needs inside that private scope, so shadows, rings, transforms and backdrop filters work even when the consumer has no Tailwind preflight.

## Themes

Theme selection is CSS-only:

```ts
// Force light
document.documentElement.dataset.sherickTheme = "light";

// Force dark
document.documentElement.dataset.sherickTheme = "dark";

// Follow prefers-color-scheme
document.documentElement.removeAttribute("data-sherick-theme");
```

Custom themes override the documented `--sui-*` CSS variables at document/root level:

```css
:root {
  --sui-primary: 0.50 0.17 255;
  --sui-primary-strong: 0.47 0.19 257;
  --sui-on-primary: 0.985 0.005 255;
}
```

`styles.css` includes both component styling and the generated light/dark/system token defaults. `theme.css` is also exported separately for token-only consumers.

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
      <Dialog defaultOpen>
        <Dialog.Header>Example dialog</Dialog.Header>
        <Dialog.Description>Base UI owns the dialog mechanics.</Dialog.Description>
        <Dialog.Content>Styled by Sherick UI.</Dialog.Content>
      </Dialog>
    </>
  );
}
```

## Architecture

Base UI owns generic interaction and accessibility mechanics when it provides the primitive: keyboard navigation, focus management, semantic relationships, form participation, portals, dismissal and popup positioning. Sherick UI owns anatomy, its public design API and the visual language.

Tailwind is not a runtime integration surface. Component CSS is generated inside this package and scoped internally; `.sui-scope` is private implementation detail, not a consumer class or theming hook.

The design language remains canonical in the repository-level `docs/DESIGN_LANGUAGE.md`. Reusable recipes live in `src/components/ui.common.ts`; authored theme values live in `src/styles/tokens.ts` and compile to the published CSS artifacts.
