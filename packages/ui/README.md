# Sherick UI

Sherick UI is a React component library with a soft, expressive design language and Base UI-backed interaction/accessibility primitives.

The published stable line is `1.0.x` and is frozen. New work ships as `2.0.0-alpha.N` under the `alpha` dist-tag, so `npm install sherick-ui` keeps resolving to the last stable `1.x` release. Breaking changes are allowed and expected on the prerelease line and ship without deprecation cycles; API compatibility starts being promised at `2.0.0`. See the repository's `docs/RELEASE.md` for the full compatibility contract.

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
import { Button, Combobox, Dialog, Field, Input, Menu, Select } from "sherick-ui";
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
      <Field label="Project">
        <Combobox
          options={[
            { label: "Design system", value: "design" },
            { label: "Dashboard", value: "dashboard" },
          ]}
          defaultValue="design"
        />
      </Field>
      <Menu>
        <Menu.Trigger render={<Button appearance="tonal">Actions</Button>} />
        <Menu.Content>
          <Menu.Item>Rename</Menu.Item>
          <Menu.Item variant="danger">Delete</Menu.Item>
        </Menu.Content>
      </Menu>
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

## Package exports

The package publishes these subpaths:

- `sherick-ui` — the core component barrel: `Alert`, `AlertDialog`, `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `Chip`, `ChipGroup`, `Combobox`, `Dialog`, `Divider`, `Field`, `IconButton`, `Input`, `Menu`, `NavGroup`, `NavItem`, `NumberField`, `Popover`, `Progress`, `RadioGroup`, `Search`, `SegmentedControl`, `Select`, `Skeleton`, `Slider`, `Spinner`, `Switch`, `Table`, `Tabs`, `Textarea`, `ToggleGroup`, `Tooltip`, plus their prop types and the shared `Variant` type.
- `sherick-ui/content` — the rich-content boundary, **ESM only**: `Markdown`, `CodeBlock` and their prop types.
- `sherick-ui/styles.css` — the complete component stylesheet.
- `sherick-ui/theme.css` — token-only theme output.
- `sherick-ui/dev` — development-only recipes for this repository's workbench. Unstable and unsupported; do not depend on it.

The names above are canonical. There are no compatibility aliases: `ActionButton`, `Dropdown`, `Modal`, `TabGroup` and their prop types are gone, as are the deprecated `Select.selected`, `Select.onSelect`, `Tabs.defaultTabId`, `Tabs.onTabChange`, `Dialog.onClose` and `Table.variant` props. The `onChange` props on `Input`, `Textarea` and `Switch` are no longer Sherick callbacks — `Input` and `Textarea` pass through native `onChange`, and boolean state goes through `Switch.onCheckedChange`.

Two floating-surface families exist and they differ in what they own. `Dialog` composes as
`Dialog.Header`, `Dialog.Description`, `Dialog.Content` and `Dialog.Footer`; `AlertDialog` is the
destructive confirmation, with `title`, `description`, `confirmLabel`, `onConfirm` and `onCancel`
— `onCancel` runs for every user cancellation, the cancel action and Escape alike — and it is
always modal and never dismisses on an outside press. `Popover`, `Menu` and `Combobox` anchor to
the element that opened them: `Popover.Trigger`/`Popover.Content`,
`Menu.Trigger`/`Menu.Content`/`Menu.Item`/`Menu.Separator`, and a `Combobox` that takes `options`
and a `value` the way `Select` does. Label a `Combobox` with `Field`, and drop it into `Select`'s
place when the list needs to be searchable; a `readOnly` Combobox still opens and browses, it just
cannot change its value.

These components compose Base UI primitives, and Base UI stays internal: the parts above accept the
capabilities this package documents rather than the primitive's complete prop set, so a Base
upgrade is not a Sherick breaking change.

Three further families are worth naming, because each is one behavioral foundation under more than
one name:

- **the toggle family** — a `Chip` is a tag until it is given a selection, and a toggle chip inside a
  `ChipGroup` is a button that holds the group's value; a `ToggleGroup` and its `ToggleGroup.Item`
  segments are the same object inside a recessed track, and `SegmentedControl` is that group's
  single-choice form over an `options` array. Selection lives in Base UI's own pressed marker, so an
  uncontrolled toggle is styled from the same source of truth as a controlled one, and a
  `SegmentedControl` never empties itself;
- **`Progress`** — a determinate bar announces its value through Base UI's `progressbar` role, and omitting
  `value`, or passing `null`, sweeps the fill instead of reporting a position;
- **removable tags** — only a chip that holds no selection can be dismissed, because a control that
  both holds a value and deletes itself is one target with two meanings.

## Rich content

`Markdown` and `CodeBlock` are not on the root export — they live on a separate subpath:

```tsx
import { Markdown, CodeBlock } from "sherick-ui/content";

export function Docs() {
  return <Markdown>{"# Heading"}</Markdown>;
}
```

The rich-content stack (Prism, remark/rehype, KaTeX) is deliberately separate, so a build that only uses core components never bundles a syntax highlighter or a Markdown pipeline. Importing `Button` from `sherick-ui` does not reach `sherick-ui/content`; that boundary is enforced by the package's bundle budget gate.

It is a bundle boundary, not an install boundary: the rich stack stays an ordinary dependency, so installing `sherick-ui` installs it whether or not the subpath is imported.

The subpath is **ESM only**, because `react-markdown` and remark/rehype have no CommonJS build. It therefore declares no `require` entry, and `require("sherick-ui/content")` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. From CommonJS, use `await import("sherick-ui/content")`. The root barrel and `sherick-ui/dev` keep their CommonJS entries.

## Architecture

Base UI owns generic interaction and accessibility mechanics when it provides the primitive: keyboard navigation, focus management, semantic relationships, form participation, portals, dismissal and popup positioning. Sherick UI owns anatomy, its public design API and the visual language.

Base UI is internal infrastructure. Consumers never import `@base-ui/react` to use Sherick UI, and Base UI's own props, DOM structure and generated IDs are not part of this package's compatibility promise.

Tailwind is not a runtime integration surface. It is internal authoring/build infrastructure: the package ships no Tailwind preset, declares no Tailwind peer dependency and requires no package-content scanning. Component CSS is generated inside this package and scoped internally; `.sui-scope` is private implementation detail, not a consumer class or theming hook.

Themes are document-level. Overlays portal to `document.body`, so root-level `--sui-*` variables apply to Dialog, Select and Tooltip surfaces; nested theme islands are not a supported contract.

The design language remains canonical in the repository-level `docs/DESIGN_LANGUAGE.md`. Reusable recipes live in `src/components/ui.common.ts`; authored theme values live in `src/styles/tokens.ts` and compile to the published CSS artifacts.
