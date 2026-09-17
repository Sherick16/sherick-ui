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
- the canonical root export set, the absence of the removed aliases, and the `sherick-ui/content` boundary;
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
- `sherick-ui/content` resolution in ESM and declarations, the guarantee that rich content is **not** reachable from the root export, and that the subpath advertises no `require` entry — a CommonJS consumer must reach it with `await import()`, and `require()` must fail with `ERR_PACKAGE_PATH_NOT_EXPORTED` rather than crash on an older runtime;
- no published Tailwind preset and no Tailwind peer dependency;
- server rendering of Dialog states;
- representative Prism language highlighting for languages outside Prism's core set;
- a rendered KaTeX equation from `Markdown`, so neither `remark-math` nor `rehype-katex` can be dropped without failing;
- KaTeX font assets present in the tarball;
- a real Vite production build that imports `sherick-ui/styles.css` with no Tailwind installation/configuration.

This layer exists specifically to catch publication problems that direct workspace imports can hide.

## Bundle size and tree-shaking budgets

`bun run test:bundle` bundles representative consumer entry points against the package's own
`exports` map and asserts two independent things:

- **module graph** — a core import must never reach rich-content code, and `sherick-ui/content` must reach the full expected rich stack;
- **transfer size** — each fixture's raw, gzip and brotli size must stay within its recorded budget.

It is the **single owner of size budgets** in this repository. The budgets live in
`packages/ui/scripts/bundle-budget.json`; the gate is `packages/ui/scripts/bundle-budget.mjs`.
Nothing else records a size number, and no other layer re-implements a size check.

Five runtime fixtures are bundled with esbuild — `button`, `form`, `overlay`, `barrel` and
`content` — resolved through Node package self-reference exactly as a consumer bundler would,
plus the published `dist/styles.css` and `dist/theme.css`. The gate fails when any
rich-content module (prismjs, prism-react-renderer, react-markdown, remark-*, rehype-*,
katex, or the micromark/mdast/hast/unified family) appears in the module graph of a
non-`content` fixture, and requires the expected rich stack to be present for `content`.
Size comparison uses the tolerance recorded in the baseline (5%). A fixture that falls more
than 20% below its recorded gzip budget also fails: a stale budget stops protecting anything
and would absorb a later regression.

What this layer proves is that the **bundle boundary is real**: importing `Button` cannot
drag Prism or a Markdown pipeline into a consumer's bundle, and a heavyweight dependency
cannot be added to the root barrel without failing here. It is a bundle boundary and not an
install boundary — the rich stack is an ordinary `dependencies` entry, so installing the
package installs it whether or not the subpath is imported. The `content` fixture also
asserts that the whole stack a rendering path needs is present (`remark-math` and
`rehype-katex` for math, `prism-react-renderer` and `prismjs` for code), so a dependency
cannot quietly disappear while the graph assertion still passes. What it does not prove is anything
about behaviour, rendering or publication — those belong to the layers above, and the packed
tarball remains the publication boundary.

The recorded baseline is regenerated with `bun --filter sherick-ui test:bundle --update`.
A baseline increase is an architecture change and needs a deliberate recorded reason; it is
not a routine refresh to make a red gate green.

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

#### Accessibility (`accessibility.spec.ts`)

`apps/showcase/tests/browser/accessibility.spec.ts` runs axe-core through
`@axe-core/playwright`'s `AxeBuilder` restricted to `["wcag2a", "wcag2aa", "wcag21a",
"wcag21aa"]`, and asserts `results.violations` is empty with a message naming every violation
id and target selector. axe runs on four representative reachable states rather than scanning
the workbench indiscriminately:

- `/verification/core` in its default state;
- `/verification/interactions` in its default state;
- the initially-open dialog at `/verification/dialog`;
- a Select opened inside the dialog on `/verification/interactions`.

The same spec adds direct assertions axe cannot make: accessible names on icon-only controls,
`aria-busy` on the loading Search, and a visible keyboard focus ring on the core `Primary`
button (`outline-style` other than `none`, `outline-width` at least `2px`).

**One rule is excluded, deliberately and for a recorded reason.** `color-contrast` is
disabled for this run because the authored default palette does not meet WCAG AA text
contrast. The measured gap, the token pairs it affects and the rules it imposes are recorded
in `docs/DESIGN_LANGUAGE.md` §14 (Known contrast gap) and re-stated in `docs/RELEASE.md` as a
known pre-release limitation. Closing it means retuning authored accent and text-step tokens —
a palette decision with its own baselines — so it is tracked separately rather than smuggled
into a hardening change.

Every other rule in the tag set stays enabled, and excluding one rule removes exactly one
class of coverage: a *new* contrast regression is not caught here. When the palette gap is
closed, delete the exclusion. Do not extend the exclusion to a second rule, and do not
disable a rule to make a red run green — a genuine markup defect is fixed in the markup.

**What this layer does not replace.** axe proves that rendered markup has no detectable
violation; it proves nothing about whether a control behaves correctly. Keyboard traversal,
roving focus, dismissal ordering, focus restoration, form participation and controlled state
remain the job of the interaction suite. A green axe run is never accepted as evidence that a
behaviour works.

#### Narrow viewport and RTL (`responsive.spec.ts`)

`apps/showcase/tests/browser/responsive.spec.ts` covers the two layout contracts that
ordinary desktop browser tests cannot see:

- **narrow viewport** — at a 320px viewport the page renders no page-level horizontal
  overflow, and controls measured inside a deliberately narrow wrapper (`narrow-container`)
  stay within that wrapper. A fixed preferred width such as the old `min-w-64` on Input,
  Textarea, Search or Select would overflow the container and fail here. `Tabs` is exercised
  inside its documented `overflow-x-auto` wrapper, where a segmented control scrolls rather
  than widening the page.
- **RTL** — the same page is re-verified with `document.documentElement.dir = "rtl"` set at
  test time, so direction-sensitive layout, overflow and control ordering are checked without
  a separate fixture. The fixture avoids anything meaningless under RTL, which is why it is a
  dedicated verification page rather than a copy of the showcase.

Both checks read geometry from the real rendered DOM; they do not snapshot a screenshot, so a
styling change cannot silently satisfy them by shifting pixels.

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

`bun install --frozen-lockfile` is the normal path; the lockfile is committed and CI must not
rewrite it.

`bun run verify` executes, in order:

1. lint (library and showcase);
2. library typecheck and build (ESM/CJS/declarations plus generated `styles.css`/`theme.css`);
3. showcase and no-Tailwind typechecks and production builds;
4. `bun run test` — library smoke checks over the built artifact;
5. `bun run test:bundle` — size and tree-shaking budgets;
6. `bun run test:packed` — `npm pack` publication contract in a clean consumer;
7. `bun run visual` — deterministic style-contract snapshots;
8. `bun run test:browser` — showcase (interaction, accessibility, responsive, visual) and
   no-Tailwind browser suites.

Each step has a different job and a different failure meaning. A red bundle gate is a size or
boundary regression, not a styling defect; a red browser suite is not a publication defect.
Because the size budgets and the visual baselines are recorded artifacts, a genuine
architecture change updates them deliberately and in the same change that changes the
contract.
