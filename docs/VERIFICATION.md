# Verification architecture

Sherick UI uses complementary verification layers. Each layer has a deliberately different job; passing one is not treated as evidence for another.

## Static repository checks

`bun run lint` and workspace typechecks protect source-level correctness, repository conventions and TypeScript compatibility. They do not prove that the package consumers install is correctly assembled or styled.

## Library build

`bun --filter sherick-ui build` produces:

- preserved ESM and CommonJS modules;
- declaration bundles;
- generated `dist/theme.css` from the canonical token source;
- generated scoped `dist/styles.css` containing the complete component styling contract;
- KaTeX CSS/font assets required by Markdown math.

The CSS build uses Tailwind privately as an authoring compiler, then scopes component rules so generic utility selectors cannot leak into consumer applications. Tailwind preflight is disabled.

## Consumer production builds

Two independent consumers build in verification:

- `apps/showcase` — the full Next.js workbench. It imports `sherick-ui/styles.css` and deliberately does **not** scan Sherick package output through Tailwind.
- `apps/no-tailwind` — a small Vite application with no Tailwind dependency or configuration. It proves the published styling contract is genuinely self-contained.

Both consume `sherick-ui` through package exports after the library build.

## Fast package smoke checks

`bun run test` exercises the local built artifact and protects deterministic architecture invariants, including:

- complete light/dark/system token output;
- system dark and explicit dark generated from the same canonical values;
- public `styles.css` / `theme.css` exports;
- absence of the old Tailwind preset/peer contract;
- no Tailwind preflight/global element reset;
- no `!important` in published package CSS;
- no component/accessibility selector escaping the private Sherick scope;
- retained server/client module boundaries;
- design-rule checks such as no raw neutral palette or arbitrary shadow system in components.

## Packed-package consumer checks

`bun run test:packed` is the publication contract gate. It runs `npm pack`, installs the resulting tarball into a clean temporary consumer and verifies:

- ESM package import;
- CommonJS `require()`;
- NodeNext TypeScript declaration resolution;
- `sherick-ui/styles.css` and `sherick-ui/theme.css` resolution;
- no published Tailwind preset and no Tailwind peer dependency;
- server rendering of Dialog states;
- representative Prism language highlighting;
- KaTeX font assets present in the tarball;
- a real Vite production build that imports `sherick-ui/styles.css` with no Tailwind installation/configuration.

This layer exists specifically to catch publication problems that direct workspace imports can hide.

## Deterministic style-contract snapshots

`bun run visual` snapshots the actual generated/published styling artifacts rather than recompiling an alternate styling path. It records:

- generated theme-token blocks from `dist/theme.css`;
- scoped rules from `dist/styles.css`;
- server-rendered component specimen markup;
- shared overlay recipes.

This is a deterministic **style-contract** regression gate, not a pixel/browser visual test.

## Browser integration and visual regression

`bun run test:browser` runs two browser suites.

### Next showcase

The existing reviewed Chromium snapshots remain the visual baseline for:

- representative core controls in light mode;
- representative core controls in dark mode;
- initially-open Dialog overlays in light mode;
- initially-open Dialog overlays in dark mode.

Those screenshots are immutable: a difference is a styling-distribution defect unless explicitly proven otherwise.

The showcase browser suite also verifies:

- field description/error relationships;
- loading Search behavior;
- controlled Tabs;
- Select/Switch form participation;
- Dialog description semantics;
- nested overlay Escape ordering;
- hostile custom theme roles, including portaled content;
- forced-colors focus/state/boundary fallbacks.

### No-Tailwind consumer

The Vite fixture verifies:

- representative components render with package CSS alone;
- Dialog, Select and Tooltip remain styled through portals;
- rich-content/KaTeX styling and fonts are present;
- theme variables load;
- a deliberately Tailwind-looking consumer element (`flex absolute rounded-full px-6 text-sm`) remains untouched, proving generic package utilities do not leak globally.

All browser tests fail on page errors or error-level console output.

## CI order

The normal immutable CI path is:

```bash
bun install --frozen-lockfile
bunx playwright install --with-deps chromium
bun run verify
```

`bun run verify` executes source checks, library/CSS generation, both consumer typechecks/builds, local package smoke checks, packed-package verification, deterministic style-contract snapshots and both browser suites.
