# Sherick UI architecture

## Repository boundaries

Sherick UI is a small workspace repository by design:

- `packages/ui` is the only publishable package. It owns reusable source, package metadata, visual tokens/recipes, finished CSS generation, Rollup/declaration builds and package-level verification.
- `apps/showcase` is a private Next.js workbench and browser fixture. It owns Next configuration, showcase-only layout, Playwright tests and visual specimens.
- `apps/no-tailwind` is a deliberately minimal Vite consumer proving that the published package renders with only `sherick-ui/styles.css` and no consumer Tailwind setup.
- `docs` and repository policy remain at the root. No monorepo orchestrator is required; Bun workspaces provide the dependency graph and script routing.

## Dependency direction

Application workspaces consume `sherick-ui`; library source must never import Next.js, Vite, showcase code or application aliases. Internal library modules import sibling/private modules rather than the package's public barrel.

The showcase consumes `sherick-ui` through package exports. Its only privileged surface is `sherick-ui/dev`, an explicitly unstable development-only export for the workbench's design-language specimens. Production consumers should not depend on that subpath.

## Build and client boundaries

The library build starts at `packages/ui/src/index.ts` plus the development-only `src/dev.ts` and emits preserved ESM/CJS modules. Rollup does not add a package-wide `"use client"` banner. Source modules that genuinely require a client boundary retain their own directive; passive components remain server-usable.

The library TypeScript configs contain no Next plugin or generated `.next` types. Application workspaces own their framework-specific TypeScript configuration.

## Styling architecture

`docs/DESIGN_LANGUAGE.md` is the visual authority. Its implementation has three distinct owners:

- `packages/ui/src/components/ui.common.ts` owns reusable visual recipes;
- `packages/ui/src/styles/tokens.ts` owns authored runtime token values;
- `packages/ui/scripts/build-styles.ts` turns those sources and component utility usage into finished published CSS.

Tailwind CSS is private authoring/build infrastructure. It is a development dependency of Sherick UI, not a peer dependency or consumer contract. The package exports no Tailwind preset and consumers do not scan package source or `dist`.

The package publishes:

- `sherick-ui/styles.css` — complete component styles, theme tokens, motion, accessibility fallbacks and rich-content CSS/assets;
- `sherick-ui/theme.css` — token-only theme output for consumers that need the variables without component styling.

`styles.css` is generated without Tailwind preflight/reset and contains no unscoped generic utility selectors. Component rules are scoped with the private `.sui-scope` marker through zero-specificity `:where(...)` selectors. The marker exists only to isolate package CSS and is not a supported consumer styling hook.

Every independently portaled styled subtree must establish the same scope. Dialog, Select and Tooltip therefore remain styled when Base UI portals them outside trigger ancestry. New portaled components follow the same rule.

Cascade ownership is deliberate:

- theme defaults live in the low-priority `sherick-ui-theme` cascade layer so ordinary consumer CSS variables can override them cleanly;
- component, motion, accessibility and rich-content rules are **unlayered but scoped**. Do not put them in a named cascade layer: unlayered host resets/preflight would outrank every layered package rule before specificity is considered, which can erase Sherick backgrounds, shadows, border colors and Tailwind state variables;
- the scope contributes zero specificity, so a Sherick utility still has normal class-level specificity. Import `sherick-ui/styles.css` before application styles; later consumer utility/classes of equal specificity can intentionally override a component through `className` without `!important`.

## Theme contract

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
- `className` styles the component root. Multi-part controls use a specifically named class prop such as `inputClassName` only when consumers need to style the inner interactive element separately.

Do not add generic controlled-state hooks, focus helpers, form mirrors or event-composition utilities to Sherick UI when Base UI already supplies the behavior.

## Adding components

Reusable components belong under `packages/ui/src/components` and are exported from the package's public barrel. Application-only layout/specimens remain in app workspaces.

For styling, a new component should only need to:

1. compose existing recipes from `ui.common.ts`;
2. use ordinary Tailwind utilities for component anatomy;
3. route styled roots through the shared `cn()` helper so the private style scope is established;
4. explicitly establish a scope on any independently portaled styled branch;
5. extend `tokens.ts` or the design language only when a genuinely new system-level visual role is required.

A new component must not require consumer Tailwind configuration, new focus/elevation systems, or a new CSS delivery mechanism.

## Verification

The root `bun run verify` proves both publication and integration boundaries. The packed-package test remains the publication boundary: workspace resolution alone is never accepted as evidence that npm consumers can install the package. Browser verification includes the existing reviewed visual baselines, the no-Tailwind consumer, CSS leakage checks, custom-theme torture coverage, forced-colors fallbacks and cross-component interaction composition. See `docs/VERIFICATION.md`.
