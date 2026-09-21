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

- **removing or renaming an export** — including a component, a prop type, a helper or an
  exported type from any subpath;
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
  `Combobox`, `Checkbox`, `RadioGroup`, `Slider`, `Switch`, `ToggleGroup`;
- **Surfaces and overlays**: `Dialog`, `Drawer`, `Menu`, `Popover`, `Tooltip`, `Table`, `Tabs`,
  `NavGroup`, `NavItem`, `Divider`;
- **Toasts**: `ToastProvider`, `ToastViewport`, `useToast`, `createToastManager`, and the
  `createToastManager()` factory for a manager that lives outside the React tree;
- **Writing direction**: `DirectionProvider`;
- the matching prop types (`AccordionProps`, `AccordionItemProps`, `AccordionTriggerProps`,
  `AccordionPanelProps`, `AccordionHeadingLevel`, `CollapsibleProps`, `CollapsibleTriggerProps`,
  `CollapsiblePanelProps`, `ButtonProps`, `ButtonAppearance`, `ButtonSize`, `IconButtonProps`,
  `IconButtonAppearance`, `AlertProps`, `AlertDialogProps`, `AvatarProps`, `BadgeProps`,
  `CardProps`, `ChipProps`, `ChipGroupProps`, `ProgressProps`, `SegmentedControlProps`,
  `SegmentedControlOption`, `SkeletonProps`, `SpinnerProps`, `FieldProps`, `InputProps`,
  `TextareaProps`, `SearchProps`, `NumberFieldProps`, `SelectProps`, `SelectOption`,
  `ComboboxProps`, `ComboboxOption`, `CheckboxProps`, `RadioGroupProps`, `RadioGroupOption`,
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
- **Browsers**: modern evergreen browsers. The library ships ES2019-level syntax and relies
  on the consumer's bundler for anything newer; it does not ship a legacy transpiled
  bundle.
- **Node**: the core entries need no floor. Their runtime dependency graph
  (`@base-ui/react`, `lucide-react`, `clsx`, `tailwind-merge`,
  `class-variance-authority`) publishes CommonJS, so `require("sherick-ui")` works on any
  Node that supports the syntax we ship, and no `require(esm)` feature is involved. The one
  Node feature this package depends on is the dynamic `import()` used to reach
  `sherick-ui/content` from CommonJS, which is available far below any supported version.
  The package therefore declares no `engines` floor: there is no runtime constraint to
  enforce, and the ESM-only subpath is expressed in the `exports` map rather than as a
  version requirement.

Raising any of these baselines is a breaking change.

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
  import the shared visual recipes and the `cn()` helper. It is unstable, unsupported, may
  change or disappear in any release, and must not be used by a published consumer.

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

### Recorded baseline changes

| Change | Fixtures | Recorded reason |
| --- | --- | --- |
| Wave C: `Accordion`, `Collapsible`, `Drawer` and `Toast` added to the core barrel | `disclosure` and `toast` fixtures added; `overlay` extended with `Drawer`; `barrel` and `stylesCss` raised | The core component catalog is completed. `Drawer` is a positioned `Dialog`, so it adds no second modal system and no gesture machinery: `overlay` moved by less than 1%. `toast` is the wave's cost — Base's toast primitive owns the queue, the timer, the limit, the live region and the stack, and it is the only new dependency subtree. No core bundle reaches rich-content code. |
| Wave C follow-up: shared recipe modules made tree-shakeable | `button`, `form`, `toggles` and `content` all **lowered** | The wave had also raised fixtures it does not touch — `button` by 5.2%, just past the tolerance — because the visual and motion recipe modules are shared by every component and their unused recipes survived tree-shaking. See below. |

### What the shared-recipe modules cost, and what they cost now

Adding a family to a shared module had been taxing every unrelated bundle, and the gate caught it.
The mechanism, measured rather than inferred:

- a recipe composed from other recipes is a template literal with substitutions, and a template
  literal is not provably side-effect-free — joining class strings may in principle call something —
  so an *unused* recipe was kept, along with everything it referenced. Every consumer that imported
  any part of `ui.common.ts` or `ui.motion.ts` therefore paid for every recipe in both. In the
  `button` bundle alone the two shared modules were **11.9 kB of the 45.6 kB** it weighed, almost
  all of it recipes `Button` never uses;
- the recipes are now composed through `cx` in `libs/utils.ts`, whose call is marked pure. A pure
  call is dropped whole when nothing references it, so composition no longer costs anything the
  bundle does not use. The annotation survives the library build, so a consumer's bundler sees it
  too;
- measured, against the wave's raised baselines and then against the state before the wave
  (gate figures, kB):

  | Fixture | Before the wave | Raised by the wave | Now |
  | --- | --- | --- | --- |
  | `button` | 43.3 | 45.5 | **41.8** |
  | `form` | 283.3 | 285.6 | **283.2** |
  | `toggles` | 63.5 | 65.7 | **62.0** |
  | `content` | 614.6 | 616.7 | **613.0** |
  | `overlay` | 307.5 | 311.5 | 310.4 |
  | `barrel` | 409.4 | 448.4 | 448.9 |

  Every fixture the wave does not itself compose is now at or **below** where it started: `button`
  is 1.5 kB *lighter* than before `Accordion`, `Collapsible`, `Drawer` and `Toast` existed. `overlay`
  and `barrel` grew for the right reason — they contain `Drawer` and the toast stack — and no core
  bundle reaches rich-content code;
- no class string changed. The deterministic style contract was reviewed change by change and shows
  only the intended sheet-radius and toast-positioning edits;
- what remains is *pre-existing* and recorded rather than fixed: an **object**-valued recipe table
  (`overlay`, `list`, `disclosure`, `selectable`, `edge`) still cannot be dropped property by
  property, because a bundler keeps an object literal whose properties contain calls. Those tables
  cost roughly 7.5 kB in every core bundle and did so before this wave too. Flattening them into
  single literal strings would drop them, at the cost of the composition the design language
  depends on — a shell recipe genuinely bundles material, elevation and shape — so that is left as a
  separate, deliberate change rather than folded into this one.

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

## Phase C additions

The core barrel also exports `DirectionProvider` and `DirectionProviderProps`: a DOM-free
provider accepting `direction: "ltr" | "rtl"` and `children`. RTL applications pair it with
`<html dir="rtl">`; changing locale updates both. It delegates to the existing behavior
substrate rather than implementing directional keyboard navigation locally. Consumers do not
import Base UI or the removed workbench-only `BaseDirectionProvider` export. Drawer sides
remain physical and CodeBlock remains LTR.

The stress pass adds no package subpath, theme system or motion owner. Notification stacking
is now explicit in the design language because the persistent toast portal can precede the
modal that raises a notification. See `docs/HOSTILE_LAYOUT.md` for the evidence and limits.

## Phase D publication corrections

The five-subpath architecture is unchanged. Root and dev now publish module-correct `.d.ts` /
`.d.cts` declarations; source maps embed source text. `MenuTriggerProps` and `PopoverTriggerProps`
are exported. `Select.className` targets its visible trigger; Slider div attributes target its
root while handle labeling stays on the thumb. These are prerelease corrections, not aliases.

The complete stylesheet no longer assumes a host reset: its native-control/border-box baseline
is restricted to Sherick-owned nodes. Global keyframes and math font names are namespaced, and
the copied math assets carry their license. Prism manual mode prevents document-wide highlighting
before React hydration. Packed React 18/19 Vite and Next fixtures guard these contracts; no bundle
budget was increased. `prepack`, rather than consumer installation, owns the Bun build.
