# Sherick UI

Sherick UI is a React component library with a soft, expressive design language and Base UI-backed interaction/accessibility primitives.

## Installation

```bash
bun add sherick-ui
```

Import the complete stylesheet once near your application root:

```tsx
import "sherick-ui/styles.css";
```

That is the full styling integration. Consumers do not need Tailwind, a Sherick preset, package content scanning, or any other Sherick-specific CSS build configuration.

Tailwind is private authoring/build infrastructure inside the Sherick UI repository. The published package ships finished, scoped CSS.

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

A token-only stylesheet is also available as `sherick-ui/theme.css` when component styling is not required.

## Usage

```tsx
import { Button, Input, Select } from "sherick-ui";
import "sherick-ui/styles.css";

export function Example() {
  return (
    <>
      <Input label="Email" name="email" type="email" />
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

The public package includes Button/IconButton, Alert, Avatar, Badge, Card, CodeBlock, Markdown, Divider, Select, Input/Search/Textarea, Dialog, navigation primitives, Skeleton, Spinner, Switch, Tabs, Table and Tooltip.

`ActionButton`, `Dropdown`, `Modal` and `TabGroup` remain naming compatibility aliases for their canonical Button, Select, Dialog and Tabs APIs.

## Architecture

- Base UI owns generic interaction/accessibility mechanics.
- Sherick UI owns anatomy, public design APIs and the visual language.
- `src/styles/tokens.ts` is the authored runtime token source.
- `scripts/build-styles.ts` privately compiles and scopes component CSS into `dist/styles.css`.
- The published stylesheet contains no Tailwind preflight/reset and does not leak generic utility selectors into consumer applications.

The canonical design specification and full architecture documentation live in the repository:

- [Design language](https://github.com/Sherick16/sherick-ui/blob/main/docs/DESIGN_LANGUAGE.md)
- [Architecture](https://github.com/Sherick16/sherick-ui/blob/main/docs/ARCHITECTURE.md)
- [Verification](https://github.com/Sherick16/sherick-ui/blob/main/docs/VERIFICATION.md)
