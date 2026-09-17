# Sherick UI architecture

## Repository boundaries

Sherick UI is a small workspace repository by design:

- `packages/ui` is the only publishable package. It owns reusable source, package metadata, visual tokens/recipes, finished CSS generation, Rollup/declaration builds and package-level verification.
- `apps/showcase` is a private Next.js workbench and browser fixture. It owns Next configuration, showcase-only layout, Playwright tests and visual specimens.
- `apps/no-tailwind` is a deliberately minimal Vite consumer proving that the published package renders with only `sherick-ui/styles.css` and no consumer Tailwind setup.
- `docs` and repository policy remain at the root. No monorepo orchestrator is required; Bun workspaces provide the dependency graph and script routing.

## Dependency direction

Application workspaces consume `sherick-ui`; library source must never import Next.js, Vite, showcase code or application aliases. Internal library modules import sibling/private modules rather than the package's public barrel.

The showcase consumes `sherick-ui` through package exports. Its only privileged surface is `sherick-ui/dev`, an explicitly unstable development-only export that hands the workbench the shared visual and motion recipes plus the `cn()` helper; production consumers must not depend on that subpath.

## Build and client boundaries

The library build starts at `packages/ui/src/index.ts` plus the `src/content.ts` rich-content boundary and the development-only `src/dev.ts`, and emits preserved ESM/CJS modules. Rollup does not add a package-wide `"use client"` banner. Source modules that genuinely require a client boundary retain their own directive; passive components remain server-usable.

The library TypeScript configs contain no Next plugin or generated `.next` types. Application workspaces own their framework-specific TypeScript configuration.

## Styling architecture

`docs/DESIGN_LANGUAGE.md` is the visual authority. Its implementation has four distinct owners:

- `packages/ui/src/components/ui.common.ts` owns reusable non-temporal visual recipes;
- `packages/ui/src/components/ui.motion.ts` owns semantic motion intents and temporal recipes;
- `packages/ui/src/styles/tokens.ts` owns authored runtime token values;
- `packages/ui/scripts/build-styles.ts` turns those sources and component utility usage into finished published CSS.

The split between `ui.common.ts` and `ui.motion.ts` is ownership, not a second styling layer. Components still compose one design language through `cn()`: common recipes say what a state/surface looks like, motion recipes say how a change moves. During the motion migration the old `motion` object in `ui.common.ts` remains an explicit finite bridge for existing components; `packages/ui/scripts/verify-motion-policy.mjs` prevents new components from consuming that bridge or authoring their own timing/easing/transition utilities. The bridge and its allowlist are deleted once migration completes.

Tailwind CSS is private authoring/build infrastructure. It is a development dependency of Sherick UI, not a peer dependency or consumer contract. The package exports no Tailwind preset and consumers do not scan package source or `dist`.

The package publishes:

- `sherick-ui/styles.css` — complete component styles, theme tokens, motion, accessibility fallbacks and rich-content CSS/assets;
- `sherick-ui/theme.css` — token-only theme output for consumers that need the variables without component styling.

`styles.css` is generated without Tailwind preflight/reset and contains no unscoped generic utility selectors. Component rules are scoped with the private `.sui-scope` marker through zero-specificity `:where(...)` selectors. The marker exists only to isolate package CSS and is not a supported consumer styling hook.

Because Sherick compiles Tailwind utilities ahead of time without shipping preflight, `styles.css` also initializes Tailwind's shadow/ring/transform/filter plumbing variables inside the private scope. These are implementation variables, not visual tokens, and never escape into consumer DOM.

Every independently portaled styled subtree must establish the same scope. Dialog, Select and Tooltip therefore remain styled when Base UI portals them outside trigger ancestry. New portaled components follow the same rule.

Cascade ownership is deliberate:

- theme defaults live in the low-priority `sherick-ui-theme` cascade layer so ordinary consumer CSS variables can override them cleanly;
- component, motion, accessibility and rich-content rules are **unlayered but scoped**. Do not put them in a named cascade layer: unlayered host resets/preflight would outrank every layered package rule before specificity is considered, which can erase Sherick backgrounds, shadows, border colors and Tailwind state variables;
- host/framework/Tailwind CSS loads first, then `sherick-ui/styles.css`. This order is load-bearing. A consumer Tailwind build can emit a generic class such as `.px-6` because the application uses it elsewhere; if that host rule loaded after Sherick, it could override Sherick's responsive `.sm:px-7` on a component that legitimately carries both classes. Loading the package after host CSS preserves the component's internally compiled Tailwind ordering;
- consumer `className` overrides still work for Tailwind utility conflicts because the shared `cn()` uses `tailwind-merge`, which removes the conflicting Sherick utility from the rendered element. Application-specific override CSS that is not expressed through `className` should be loaded after `sherick-ui/styles.css` in a separate override stylesheet;
- no `!important` is used to enforce the package contract.

## Motion architecture

Motion is selected by **intent**, not by component. The canonical intents are `feedback`, `tactile`, `arrive`, `orient`, `relocate`, `direct`, `disclose`, `presence` and `activity`. Components may own target geometry, but not temporal values or transition declarations.

The architecture has three hard boundaries:

- one DOM node has one spatial-motion owner; non-spatial feedback may compose with it, competing spatial recipes may not;
- Base UI Positioners own placement/collision and Popups own Sherick presence motion, so repositioning an already-open overlay never replays entrance;
- direct manipulation has no positional interpolation while the pointer owns geometry.

Base UI remains lifecycle authority. Sherick does not mirror open/closing state or add exit timers merely to animate a popup. Reduced-motion behavior is defined per intent in `docs/DESIGN_LANGUAGE.md`.

### Theme contract

Runtime theming is CSS-only:

- `data-sherick-theme="light"` forces light;
- `data-sherick-theme="dark"` forces dark;
- no attribute follows `prefers-color-scheme`.

`tokens.ts` is the single authored source for light, dark and shared values. Explicit dark and system-dark CSS are generated from the same dark token object rather than maintained independently.

Consumers customize the design through `--sui-*` variables at document/root level. Arbitrary nested theme islands are not currently part of the contract because Base UI overlays portal outside local subtrees by default.

Component anatomy such as padding, layout, intrinsic dimensions and local content typography remains component-owned; do not inflate those details into runtime tokens without a genuine cross-system need.

## Component API contracts

Base UI owns generic widget mechanics; Sherick UI exposes a small opinionated API on top. New interactive components follow these conventions unless the underlying platform requires something materially different:

- value controls use `value`, `defaultValue`, and `onValueChange`;
- boolean controls use `checked` and `onCheckedChange`;
- open/closed controls use `open`, `defaultOpen`, and `onOpenChange`;
- refs point at the primary visible interactive element; composite form controls may additionally expose Base UI's hidden-input ref when useful;
- native form ownership (`name`, `form`, `required`, submitted value) remains delegated to Base UI rather than mirrored by Sherick state;
- internal and public callbacks are composed; adding a Sherick convenience callback must not prevent Base UI from processing the same interaction;
- fields use Base `Field` parts for label, description, error and generated ARIA relationships rather than hand-written IDs;
- `className` styles the component root. Multi-part controls use a specifically named class prop such as `inputClassName` only when consumers need to style the inner interactive element separately;
- value, checked and open callbacks keep Base UI's own signature, event details included, and are derived from Base's prop types rather than restated by hand;
- where Base UI marks a state on the primitive — disabled, invalid, checked, dragging — the styling reads that marker. A control disabled by the `Field` around it is styled disabled without ever receiving a `disabled` prop of its own;
- props that behave as a group by their nature — `RadioGroup`, `Slider` — own their label, while `Field` labels a single control. `Field.required` renders a mark only; the requirement itself is declared by the control.

**Two field APIs, one intended end state.** `Input`, `Textarea` and `Search` compose `Field.Root`
internally, so they take `label` / `description` / `error` as props; the selection and value
controls (`Checkbox`, `Slider`, `NumberField`) compose through the exported `Field` instead, because
they are one control among several in a form and label themselves the same way everything else
does. Both paths render the same Base parts and produce the same ARIA relationships. The intended
end state is the exported `Field` as the only label/error/required API, with the text controls
migrating to it in a later change; until then the two coexist deliberately and this paragraph is the
record of which one is leaving.

Do not add generic controlled-state hooks, focus helpers, form mirrors or event-composition utilities to Sherick UI when Base UI already supplies the behavior.

## Public naming surface

The public naming surface is canonical. `Button`, `Select`, `Dialog` and `Tabs` are the
names a consumer depends on, and there are **no compatibility aliases** for any export:
`ActionButton`, `Dropdown`, `Modal` and `TabGroup` are gone, as are the deprecated props
`Select.selected`, `Select.onSelect`, `Tabs.defaultTabId`, `Tabs.onTabChange`,
`Dialog.onClose` and `Table.variant`. The `onChange` props on `Input`, `Textarea` and
`Switch` are no longer Sherick callbacks with their own signature — `Input` and `Textarea`
pass through native `onChange`, and boolean state goes through `Switch.onCheckedChange`.
`Switch` is genuinely controlled-or-uncontrolled: omitting `checked` leaves it uncontrolled.

A rename ships as a clean cutover — canonical name in, old name deleted, every caller
migrated — not as a deprecated alias. Pre-alpha compatibility aliases are not a supported
pattern and must not be reintroduced. See [`RELEASE.md`](RELEASE.md) for the compatibility
contract.

## Package exports

The package `exports` map is settled:

- `sherick-ui` — the core barrel (`src/index.ts`);
- `sherick-ui/content` — the rich-content boundary (`src/content.ts`), **ESM only**: its
  dependency stack has no CommonJS build, so it declares no `require` entry;
- `sherick-ui/dev` — the development-only workbench surface (`src/dev.ts`), unstable and
  unsupported for consumers;
- `sherick-ui/styles.css` — the complete published component stylesheet;
- `sherick-ui/theme.css` — token-only theme output for consumers that need the variables
  without component styling.

## Rich-content boundary

Rich content (`Markdown`, `CodeBlock`, Prism, remark/rehype, KaTeX) lives behind its own
`exports` subpath, `sherick-ui/content`. It MUST NOT become reachable from the root barrel: a
consumer importing `Button` must never bundle a syntax highlighter or a Markdown pipeline.

The boundary is a **bundle** boundary, not an install boundary. The rich stack stays in
`dependencies` so the subpath works out of the box, which means installing `sherick-ui`
installs that dependency graph whether or not `sherick-ui/content` is ever imported. Bundlers
drop it for consumers who do not import the subpath; package managers do not. The rich-content stack is the only part of the package that carries those
runtime dependencies; the published `styles.css` and the packed tarball still include its
CSS and font assets, because the stylesheet is published as one complete artifact.

## Adding components

Reusable components belong under `packages/ui/src/components` and are exported from the package's public barrel — unless they pull a heavyweight dependency stack that most consumers should not bundle, in which case they belong on their own subpath the way rich content belongs to `sherick-ui/content`. Application-only layout/specimens remain in app workspaces.

For styling, a new component should only need to:

1. compose non-temporal recipes from `ui.common.ts` and semantic temporal recipes from `ui.motion.ts`;
2. use ordinary Tailwind utilities for component anatomy and target geometry, never for local timing/easing/transition declarations;
3. route styled roots through the shared `cn()` helper so the private style scope is established;
4. explicitly establish a scope on any independently portaled styled branch;
5. extend tokens or the design language only when a genuinely new system-level visual role is required.

A new component must not require consumer Tailwind configuration, new focus/elevation/motion systems, or a new CSS delivery mechanism.

## Frozen architecture and extension rules

The following are **settled** and must not be reopened by a component, a fixture or a
verification convenience:

- the package boundary (one publishable package, one core barrel, one rich-content subpath);
- the Base UI behavior boundary (Base UI owns generic widget mechanics; Sherick owns anatomy,
  visual language and the opinionated public API — no second wrapper layer, no locally
  re-implemented keyboard, focus, portal, dismissal or ARIA machinery);
- the styling distribution (precompiled, scoped, reset-free `styles.css`; no consumer
  Tailwind, preset or content scanning);
- theme/token ownership (`tokens.ts` as the single authored source; `--sui-*` at document
  root; no nested theme islands);
- motion ownership (`ui.motion.ts` as the only temporal-recipe authority; no per-component
  durations/easings/keyframes and no second animation framework);
- public API naming (canonical names only, no aliases);
- the rich-content boundary (subpath-only, never on the root barrel, ESM-only, and a bundle boundary rather than an install boundary);
- the package `exports` map;
- the verification layers and the size budgets.

> New components should extend existing primitives, recipes, package exports and verification infrastructure. Do not introduce a new architectural layer unless an existing invariant cannot support the requirement.

Extending the language is still expected — new recipes, new tokens, new components, new
verification fixtures. What is closed is adding a new *layer*: a second component wrapper
over Base UI, a parallel styling delivery mechanism, an alternative theme system, a second
motion engine, a second rich-content entry point, a duplicate compatibility name, or a second
place that records size budgets. If an existing invariant genuinely cannot support a
requirement, that is an architecture decision, documented here and in [`RELEASE.md`](RELEASE.md)
— not a local workaround inside one component.

## Verification

The root `bun run verify` proves both publication and integration boundaries. The packed-package test remains the publication boundary: workspace resolution alone is never accepted as evidence that npm consumers can install the package. Browser verification includes the existing reviewed visual baselines, the no-Tailwind consumer, CSS leakage checks, custom-theme torture coverage, forced-colors fallbacks, axe accessibility checks, narrow-viewport and RTL coverage and cross-component interaction composition. Size and tree-shaking budgets are enforced separately by `bun run test:bundle`; temporal ownership is enforced by `bun run test:motion`. See `docs/VERIFICATION.md`.
