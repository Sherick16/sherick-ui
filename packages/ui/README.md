# Sherick UI

A React 18/19 component library with soft tonal surfaces, deliberate shape contrast
and restrained motion. `2.0.0` is stable under npm's `latest` tag; the `1.x` line
is frozen. The v2.1 components currently in the repository are not yet published.

## Install and style

```bash
npm install sherick-ui
```

```tsx
import "./app.css"; // framework, reset or Tailwind CSS first
import "sherick-ui/styles.css";
```

The complete stylesheet is precompiled, scoped and reset-free. No consumer Tailwind
configuration or package-content scan is needed. Load a dedicated selector-level
app override stylesheet **after** Sherick if required; `className` utility overrides
are merged by the components. `sherick-ui/theme.css` is also available for token-only
applications. See the [styling contract](https://github.com/Sherick16/sherick-ui/blob/main/docs/RELEASE.md#styling-import-contract).

## Use

```tsx
import { Button, Field, Input, Select } from "sherick-ui";

export function Example() {
  return (
    <>
      <Input label="Email" name="email" type="email" required />
      <Field label="Project">
        <Select options={[
          { label: "Design system", value: "design" },
          { label: "Dashboard", value: "dashboard" },
        ]} defaultValue="design" />
      </Field>
      <Button appearance="filled">Save</Button>
    </>
  );
}
```

The root barrel contains actions, forms, selection, navigation, feedback and overlays.
`Markdown` and `CodeBlock` are imported from **ESM-only** `sherick-ui/content`;
CommonJS consumers use dynamic `import()`. The rich stack is installed with the
package but never bundled by a core-only import. `sherick-ui/dev` is unsupported
workbench infrastructure, not consumer API. For the current export list and semver
boundaries see the [release contract](https://github.com/Sherick16/sherick-ui/blob/main/docs/RELEASE.md#public-export-contract).

The repository's **unreleased** v2.1 wave adds Calendar/DatePicker/DateRangePicker,
Command/CommandPalette, Pagination/Breadcrumb, FileUpload, Stepper and TreeView to
the same root barrel. Its [component contracts](https://github.com/Sherick16/sherick-ui/blob/main/docs/V2_1_COMPONENTS.md)
use civil `YYYY-MM-DD` dates and `File[]` selections; FileUpload does not upload files.

## Themes and direction

With no root `data-sherick-theme`, the library follows `prefers-color-scheme`. Set
`"light"` or `"dark"` to override it. Retune `--sui-*` variables at the document
root; nested theme islands are not supported because overlays portal to the body.
The [token source](https://github.com/Sherick16/sherick-ui/blob/main/packages/ui/src/styles/tokens.ts)
contains the defaults; custom accent values should pass the
[contrast contract](https://github.com/Sherick16/sherick-ui/blob/main/docs/VERIFICATION.md#fast-package-smoke-checks)
in both themes and interaction states.

For RTL, set both `<html dir="rtl">` and `<DirectionProvider direction="rtl">`.
Drawer sides stay physical and CodeBlock source stays LTR.

## Support

The core ships ESM and CommonJS and supports React/React DOM 18 or 19. The automated
browser baseline is the pinned Playwright Chromium, Firefox and WebKit engines;
shipping browser builds and older majors are not separately certified. Base UI owns
generic widget behavior and accessibility; Tailwind is private styling infrastructure.
Neither is a consumer API. The audited patched Base UI copy is bundled for editable
Combobox focus isolation. See the [release contract](https://github.com/Sherick16/sherick-ui/blob/main/docs/RELEASE.md)
and [design language](https://github.com/Sherick16/sherick-ui/blob/main/docs/DESIGN_LANGUAGE.md)
for details.
