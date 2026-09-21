# Release status and compatibility contract

This document is the practical compatibility contract for `sherick-ui`. It says what the
package promises today, what it will promise later, and which surfaces a consumer may build
on. The architecture this contract protects is described in
[`ARCHITECTURE.md`](ARCHITECTURE.md); the verification that enforces it is described in
[`VERIFICATION.md`](VERIFICATION.md).

## Release status: prerelease, published as `2.0.0-alpha.N`

`sherick-ui` has a published stable history: `1.0.0` through `1.0.5`, with `1.0.5` on the
npm `latest` dist-tag. That history is real and npm acts on it: a consumer on `^1.0.5`
accepts `>=1.0.5 <2.0.0`, so a `1.x` minor or patch release is *presumed compatible* and can
be installed automatically. No statement in this document can change that, so this document
does not try.

The unstable line therefore lives above the published one:

- the next published versions are **`2.0.0-alpha.N`**, published under the **`alpha`**
  dist-tag, so `npm install sherick-ui` keeps resolving to the last stable `1.x` release and
  only an explicit `npm install sherick-ui@alpha` opts into the prerelease;
- the `1.x` line is **frozen**. It receives no further releases — no breaking changes, no new
  components, no backports. It is not a line that "isn't really 1.0"; it is a published line
  that has stopped moving. Anything new goes to `2.0.0-alpha.N`;
- the **stable** release of this work is `2.0.0`, which is the version the compatibility
  promise below starts from. Publishing `2.0.0` under `latest` is the semver-major signal
  that the API settled.

`packages/ui/package.json` enforces the mapping mechanically: `publishConfig.tag` is `alpha`,
and `scripts/verify-packed-package.mjs` fails if a prerelease would publish under `latest` or
a stable version would publish under anything but `latest`. Flipping `2.0.0-alpha.N` to
`2.0.0` is therefore a deliberate edit to both fields, not an accident waiting in CI.

On the `2.0.0-alpha.N` line:

- breaking changes are allowed and expected;
- breaking changes ship **without deprecation cycles**: no deprecated aliases, no
  transitional props, no shim modules, no codemods;
- the canonical name or shape is the only name or shape that ships. `ActionButton`,
  `Dropdown`, `Modal`, `TabGroup`, `Tabs.defaultTabId`, `Tabs.onTabChange`,
  `Dialog.onClose`, `Select.selected`, `Select.onSelect` and `Table.variant` were removed
  exactly this way, and none of them will come back. The same applies to the `onChange` props
  that used to be Sherick callbacks on `Input`, `Textarea` and `Switch`: `Input` and
  `Textarea` now pass through native `onChange`, and boolean state goes through
  `Switch.onCheckedChange`.

**API compatibility starts being promised at `2.0.0`.** Until that version is published as
stable, every prerelease may break, and a prerelease version bump is not a compatibility
signal. Once `2.0.0` ships, ordinary semver applies to everything in the export contract
below.

## What counts as a breaking change

For this package, any of the following is a breaking change:

- **removing or renaming a consumer export** — including a component, prop type, helper or exported
  type from the core or content subpath. Symbols under the explicitly unsupported `dev` subpath are
  excluded; the `dev` subpath itself remains part of the five-subpath package map;
- **changing a prop name, its signature, or its controlled/uncontrolled character** — for
  example a prop that used to be optional becoming required, an `onValueChange` callback
  changing its argument, or a control that used to stay uncontrolled when the `value` prop
  was omitted becoming controlled (or the reverse);
- **changing the `exports` map** — adding, removing or repointing a subpath, or changing
  which module a subpath resolves to;
- **changing a published CSS selector contract** — the `data-sherick-theme` attribute, the
  documented `--sui-*` variable surface, or the documented `className` root-override hook.
  The private `.sui-scope` marker is not part of this contract;
- **raising the React or browser baseline** — see the runtime baseline below.

## Public export contract

These are the subpaths the package publishes, and nothing else:

| Subpath | Module format | Purpose |
| --- | --- | --- |
| `sherick-ui` | ESM + CommonJS | The core component barrel. Every component and public type except rich content. |
| `sherick-ui/content` | **ESM only** | The rich-content boundary: `Markdown`, `CodeBlock` and their types. |
| `sherick-ui/dev` | ESM + CommonJS | Development-only recipes for the in-repository workbench. Unstable, unsupported. |
| `sherick-ui/styles.css` | CSS | The complete published component stylesheet: component rules, theme tokens, motion, accessibility fallbacks and rich-content CSS/assets. |
| `sherick-ui/theme.css` | CSS | Token-only stylesheet for consumers that need the `--sui-*` variables and nothing else. |

The root `sherick-ui` export is:

- **Disclosure**: `Accordion`, `Collapsible`;
- **Actions and feedback**: `Button`, `IconButton`, `Alert`, `AlertDialog`, `Avatar`, `Badge`,
  `Card`, `Chip`, `ChipGroup`, `Progress`, `SegmentedControl`, `Skeleton`, `Spinner`;
- **Forms and value controls**: `Field`, `Input`, `Textarea`, `Search`, `NumberField`, `Select`,
  `Checkbox`, `RadioGroup`, `Slider`, `Switch`, `ToggleGroup`;
- **Surfaces and overlays**: `Dialog`, `Drawer`, `Menu`, `Popover`, `Tooltip`, `Table`, `Tabs`,
  `NavGroup`, `NavItem`, `Divider`;
- **Toasts**: `ToastProvider`, `ToastViewport`, `useToast`, and `createToastManager()` for a
  manager that lives outside the React tree;
- **Writing direction**: `DirectionProvider`;
- the matching prop types (`AccordionProps`, `AccordionItemProps`, `AccordionTriggerProps`,
  `AccordionPanelProps`, `AccordionHeadingLevel`, `CollapsibleProps`, `CollapsibleTriggerProps`,
  `CollapsiblePanelProps`, `ButtonProps`, `ButtonAppearance`, `ButtonSize`, `IconButtonProps`,
  `IconButtonAppearance`, `AlertProps`, `AlertDialogProps`, `AvatarProps`, `BadgeProps`,
  `CardProps`, `ChipProps`, `ChipGroupProps`, `ProgressProps`, `SegmentedControlProps`,
  `SegmentedControlOption`, `SkeletonProps`, `SpinnerProps`, `FieldProps`, `InputProps`,
  `TextareaProps`, `SearchProps`, `NumberFieldProps`, `SelectProps`, `SelectOption`,
  `CheckboxProps`, `RadioGroupProps`, `RadioGroupOption`,
  `SliderProps`, `SwitchProps`, `ToggleGroupProps`, `ToggleGroupItemProps`, `DialogProps`,
  `DialogHeaderProps`, `DialogDescriptionProps`, `DialogContentProps`, `DialogFooterProps`,
  `DrawerProps`, `DrawerTriggerProps`, `DrawerContentProps`, `DrawerHeaderProps`,
  `DrawerDescriptionProps`, `DrawerFooterProps`, `DrawerSide`, `MenuProps`, `MenuTriggerProps`,
  `MenuContentProps`, `MenuItemProps`, `MenuSeparatorProps`, `PopoverProps`, `PopoverTriggerProps`, `PopoverContentProps`,
  `TooltipProps`, `TableProps`, `TabsProps`, `Tab`, `NavGroupProps`, `NavGroupItem`,
  `NavGroupHeadingLevel`, `NavItemProps`, `DividerProps`, `DividerWeight`, `ToastProviderProps`,
  `ToastViewportProps`, `DirectionProviderProps`,
  `ToastOptions`, `ToastActionOptions`, `ToastUpdateOptions`, `ToastPromiseOptions`, `ToastType`,
  `ToastPosition`, `ToastManager`) and the shared `Variant`,
  `OverlaySide` and `OverlayAlign` types.

`Dialog`, `Drawer`, `Accordion`, `Collapsible` and `Menu` compose from parts:
`Dialog.Header` / `Dialog.Description` / `Dialog.Content` / `Dialog.Footer`;
`Drawer.Trigger` / `Drawer.Content` / `Drawer.Header` / `Drawer.Description` / `Drawer.Footer` /
`Drawer.Close`; `Accordion.Item` / `Accordion.Trigger` / `Accordion.Panel`;
`Collapsible.Trigger` / `Collapsible.Panel`; and `Menu.Trigger` / `Menu.Content` / `Menu.Item` /
`Menu.Separator`. There are no compatibility aliases for any export, and compatibility aliases
are not a supported pattern on the prerelease line.

`sherick-ui/content` exports `Markdown`, `MarkdownProps`, `CodeBlock` and `CodeBlockProps`,
and is the only place the rich-content stack (Prism, remark/rehype, KaTeX) is reachable from.

**The isolation is a bundle boundary, not an install boundary.** A build that imports a core
component never pulls Prism, react-markdown, remark/rehype or KaTeX into its output — that is
enforced by `bun run test:bundle` from the module graph. Installing the package, however,
installs the whole dependency graph regardless: `react-markdown`, `prismjs`,
`prism-react-renderer`, `remark-gfm`, `remark-math`, `rehype-katex` and `katex` are ordinary
`dependencies`, not optional or peer dependencies. A consumer who never imports
`sherick-ui/content` still has those packages in `node_modules` and in their lockfile; they
are simply never bundled.

`sherick-ui/content` is **ESM only**. Its dependency stack (`react-markdown`, `remark-*`,
`rehype-*`) publishes no CommonJS build, so the package declares no `require` entry for the
subpath instead of shipping an artifact that only works on runtimes where `require(esm)` is
enabled by default (Node 20.19+/22.12+). From CommonJS, reach it with dynamic import:

```js
const { Markdown } = await import("sherick-ui/content");
```

`require("sherick-ui/content")` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED` — a deliberate,
documented answer rather than a runtime crash on older Node. The root barrel and
`sherick-ui/dev` keep their CommonJS entries, and their dependency graph is CommonJS-safe.

## Styling import contract

Host CSS loads first, Sherick UI loads second, and an application override stylesheet — if
one is needed — loads last:

```ts
import "./app-or-framework.css"; // host framework/reset/Tailwind CSS
import "sherick-ui/styles.css"; // Sherick UI component styles
import "./sherick-overrides.css"; // optional: selector-level app overrides
```

The host/Sherick order is load-bearing. A host Tailwind build can independently emit a
generic class such as `.px-6`; if that copy loaded after Sherick it could override a
responsive internal utility such as `.sm:px-7` on the same element and silently change
component layout. `className` overrides remain supported because the shared `cn()` helper
uses `tailwind-merge` and removes the conflicting internal class from the rendered element.

`styles.css` is self-contained, scoped and reset-free. A consumer application is never
required to add `.sui-scope`, to scan package sources, or to compile anything.

## Theme contract

Theming is CSS-only and document-level:

- `data-sherick-theme="light"` forces light, `data-sherick-theme="dark"` forces dark, and
  with no attribute the package follows `prefers-color-scheme`;
- consumers customize through `--sui-*` variables set at document/root level;
- overlays portal to `document.body`, so root-level variables apply to Dialog, Select and
  Tooltip surfaces automatically;
- **nested theme islands are not supported.** Defining a theme scope on an arbitrary
  subtree is outside the contract until the portal-container architecture is designed for
  it explicitly;
- theme defaults live in the low-priority `sherick-ui-theme` cascade layer, so ordinary
  unlayered application CSS can override the variables without `!important` or selector
  escalation;
- component, motion, accessibility and rich-content rules are **unlayered but scoped**. They
  must not move into a named cascade layer: ordinary unlayered host rules would outrank them
  before specificity is considered and could erase backgrounds, border alpha, elevation
  shadows and Tailwind state variables.

## Runtime baseline

- **React**: `react` and `react-dom` `^18.0.0 || ^19.0.0` are the supported peer range.
- **Browsers**: the current and previous stable major releases of Chrome, Edge, Firefox and
  Safari. CI executes the current Playwright Chromium, Firefox and WebKit engines. The package
  ships ES2019-level syntax and no legacy/ES5 bundle. The browser window rolls forward with
  browser releases; dropping a browser family or requiring a capability outside that window is a
  breaking change.
- **Node/module formats**: the core and `dev` entries provide ESM and CommonJS. The core entries
  need no declared Node floor beyond support for the shipped syntax. `sherick-ui/content` is ESM
  only; CommonJS consumers reach it with dynamic `import()`. The package therefore declares no
  `engines` floor: the module-format constraint is expressed by the `exports` map.

Raising the React range, dropping a browser family, or removing a module format from an existing
subpath is a breaking change.

## Internal infrastructure is not consumer API

- **`@base-ui/react` is internal behavioral infrastructure.** It is the substrate Sherick UI
  builds interaction, focus, portal, positioning, dismissal and ARIA mechanics on. Consumers
  must not import Base UI to use Sherick UI, and Base UI internals — its props, its DOM
  structure, its generated IDs — are **not covered by this package's compatibility
  promise**. Sherick's components own the public API; upgrading behavior normally means
  Sherick upgrading Base UI, not consumers depending on it.
- **Tailwind CSS is internal authoring/build infrastructure.** It is not a consumer contract:
  the package ships no Tailwind preset, declares no Tailwind peer dependency, and requires no
  package-content scanning. Sherick UI compiles its own component CSS ahead of time.
- **`sherick-ui/dev` is development-only.** It exists so the in-repository workbench can
  import shared visual recipes and `cn()`. The five-subpath export map keeps the subpath available,
  but its symbol set is unstable, unsupported and excluded from semver compatibility; published
  consumers must not import it.

## Size budgets

Published size and tree-shaking boundaries are enforced by
`packages/ui/scripts/bundle-budget.mjs` against `packages/ui/scripts/bundle-budget.json`, run
as `bun run test:bundle`.

- `bundle-budget.json` is the **single owner of size budgets** for the repository: raw, gzip
  and brotli budgets for representative consumer entry points plus the published
  stylesheets.
- The gate fails if a core bundle reaches rich-content code, if a fixture exceeds its
  recorded budget beyond the recorded tolerance, **or if a fixture falls more than 20% below
  its recorded gzip budget**. That last rule is deliberate: an obsolete budget stops
  protecting anything and silently absorbs a later regression, so a stale baseline fails
  until it is lowered.
- The baseline is regenerated with `bun --filter sherick-ui test:bundle --update`, and **a
  baseline change in either direction requires a deliberate, recorded reason** — raising it
  is a size regression, lowering it is a maintained contract, and neither is a routine
  refresh.

Historical bundle-baseline changes and their measured reasons live in the phase audit documents.
The current JSON file is authoritative; a future baseline edit must record its reason in the same
change. The remaining object-valued shared recipe tables are a post-release optimization candidate,
not a correctness defect and not permission to raise a budget.

## Accessibility: the authored palette meets AA

There is no longer a recorded contrast limitation, and no allowlist anywhere in the gate.

The authored palette meets WCAG AA, measured rather than asserted: `bun run test` runs a contrast
contract over the values in the published `dist/theme.css`, in both themes, covering every
composition the design language permits — each text role against each surface a component composites
over, a semantic foreground on its own tint and through its hover and pressed states, an on-colour on
its strong fill through the filled states, the marks that carry a selection, the error placeholder,
the non-text tones, and the focus indicator against every surface and every fill an inset ring is
drawn over. Every composition is simply pass or fail.

The browser gate runs axe-core over the WCAG A/AA tag set with **no rule excluded**, including
`color-contrast`. The contract exists because a scan cannot see all of it: axe does not evaluate
`::placeholder` text, and a node it cannot measure is a node a regression can hide in.

Two consequences a consumer should know about:

- **there are two text roles, `text.high` and `text.medium`, and both clear 4.5:1** on every surface
  the library composites over. The dimmest tone is `detail`, which is a **non-text** role: a rail, a
  gutter, a mark's frame. Nothing readable uses it.
- **the accents are one step deeper in light mode and one step lighter in dark mode** than the
  `1.x` line's, because a tonal control's label has to survive being composited over its own tint
  again while the control is hovered or pressed. Consumers who had retuned only the two tokens the old
  limitation mentioned — `--sui-primary` and `--sui-ink-faint` — should re-check their override;
  `--sui-ink-faint` no longer exists and its role is `--sui-detail`.

The values, the compositions that constrained them and the alternatives that were measured and
rejected are recorded in [`PALETTE.md`](PALETTE.md); the rules themselves are
[`DESIGN_LANGUAGE.md`](DESIGN_LANGUAGE.md) §10 and §14.

## What keeps the architecture frozen

The architecture stays frozen as long as these three things stay true:

1. **The root barrel stays core-only.** Rich content remains reachable exclusively through
   `sherick-ui/content`, so an import of `Button` never bundles Prism, remark/rehype or
   KaTeX, and `sherick-ui/content` stays ESM-only rather than gaining a CommonJS entry its
   dependency graph cannot honor.
2. **The public naming surface stays canonical.** `Button`, `Select`, `Dialog` and `Tabs`
   are the names, with no compatibility aliases and no parallel deprecated paths.
3. **New work extends what exists.** New components compose existing primitives, recipes,
   package exports and verification infrastructure instead of introducing a new
   architectural layer.

If any one of them stops being true, the freeze described in
[`ARCHITECTURE.md`](ARCHITECTURE.md) no longer holds and this document must be revised with
it.

## Final gate and stable transition

A release candidate is shippable only when the checkout is clean, the stable blocker below is
resolved, the manual checklist is recorded, and `bun run verify` passes from the exact candidate
commit with the frozen lockfile. CI uses `bun install --frozen-lockfile` and runs that same command.
The two opt-in screenshot-review projects are review tools, not hidden requirements of the routine
deterministic gate.

The stable transition is one deliberate release commit:

1. set `packages/ui/package.json` to version `2.0.0` and `publishConfig.tag` to `latest`;
2. replace prerelease install examples (`sherick-ui@alpha`) with untagged stable installs;
3. run `bun install --frozen-lockfile`, `bun run verify`, and review the complete diff;
4. from `packages/ui`, run `npm pack --dry-run` and `npm publish --dry-run --access public --tag latest`;
5. confirm the dry-run manifest contains only the declared files and all five export subpaths;
6. only after explicit publish approval, publish with `npm publish --access public --tag latest`;
7. verify `npm view sherick-ui dist-tags versions --json`: `latest` must be `2.0.0`, `alpha` may
   continue to name the final prerelease, and an untagged install must resolve to `2.0.0`;
8. tag and push `v2.0.0` only after the registry verification succeeds.

`prepack`, not consumer installation, owns the Bun build. Do not add lifecycle scripts that build
on consumer install, publish the prerelease under `latest`, or move stable `2.0.0` back under
`alpha`.

## Release-readiness classifications

### Resolved stable-release blocker: editable Combobox isolation

The editable `Combobox` was removed from the package, public types, documentation examples,
showcase and verification fixtures before `2.0.0`. This is an intentional prerelease contract
correction, not a deprecation: stable `2.x` does not include `Combobox`, `ComboboxProps` or
`ComboboxOption`.

The removed implementation was reproduced against the packed artifact and
`@base-ui/react@1.8.0`: opening its editable listbox produced axe's serious
`aria-hidden-focus` violation on 37 outside nodes. Base's floating focus manager marked content
around the popup `aria-hidden="true"` while leaving it in sequential focus navigation. The same
behavior remains tracked as [mui/base-ui#5528](https://github.com/mui/base-ui/issues/5528).

A future searchable selection control may be added only after its released behavioral foundation
passes the full open-state axe scan without exclusions while preserving editable input and
non-modal pointer behavior. It will be evaluated as a new API; the removed prerelease shape does
not reserve a stable compatibility contract.

### Accepted stable limitations

These are explicit contract boundaries, not unresolved defects:

- rich content is ESM-only; the core and `dev` entries remain ESM/CommonJS;
- themes are document-level; nested isolated theme islands are unsupported;
- RTL applications keep document `dir` and `DirectionProvider.direction` in sync; Drawer sides are
  physical and source code remains LTR;
- compact-label truncation, short non-interactive tooltip content, and surrounding clearance for
  expanded small-mark hit areas follow the constraints in `HOSTILE_LAYOUT.md`;
- the package targets the evergreen browser window above and does not ship a legacy bundle.

### Manual pre-publish checks

Automation covers reflow-equivalent viewport reduction, root-font scaling, coarse-pointer
emulation and all three browser engines, but it does not honestly replace:

- browser-UI zoom at 200% and 400% in a shipping Chromium, Firefox and Safari browser;
- one physical iOS and one physical Android pass for soft-keyboard viewport changes, browser chrome,
  safe areas and touch targeting;
- keyboard plus NVDA/Firefox and VoiceOver/Safari announcements for the form, modal, selection and
  toast critical paths.

These checks are a small human release checklist. They are not evidence of another known software
defect, but they must be recorded before publishing stable.

Historical Phase C and Phase D findings remain in `HOSTILE_LAYOUT.md` and
`PACKAGE_INTEGRITY.md`; they are not part of this consumer compatibility contract.
