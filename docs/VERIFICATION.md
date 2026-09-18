# Verification architecture

Sherick UI uses complementary verification layers. Each layer has a deliberately different job; passing one is not treated as evidence for another.

## Static repository checks

`bun run lint`, workspace typechecks and the motion policy enforce source-level correctness, repository conventions and temporal ownership. They do not prove that the package consumers install is correctly assembled or styled.

## Temporal ownership (`verify-motion-policy.mjs`)

`bun run test:motion` is a deterministic text check over `packages/ui/src/components`, and it is
the gate that keeps `ui.motion.ts` the only temporal owner in the package. A component module
may not author a `duration-*`, `ease-*`, `transition-*` or `animate-*` utility, an animation
declaration or `@keyframes`, or a component-local presence lifecycle
(`data-[starting-style]` / `data-[ending-style]`) — it composes a semantic recipe from
`ui.motion.ts` instead. The check has no allowlist and no per-file exception: when a component
needs a new physical behaviour, the recipe is added to the motion module.

It is deliberately a plain repository search rather than a parser: the contract is about which
tokens may appear in a component's source at all, and a deterministic search states that
directly. The same module's exact class contract is pinned by `bun run visual`, which snapshots
every motion recipe beside the overlay shells.

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
- design-rule checks such as no raw neutral palette or arbitrary shadow system in components;
- every class name an authored recipe renders has a rule in the published `styles.css`. The
  stylesheet compiler reads class names as literal text, so a name assembled when the recipe is
  evaluated compiles to nothing and that step of the recipe silently disappears — which is how every
  state layer once shipped without its hover rule.

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
- shared overlay shell and motion recipes, including the presence recipes and the reduced-motion
  neutralization they carry;

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
  opened from inside a modal actually hit-tests above it (visibility alone cannot see occlusion);
- a disabled collection row: navigation still reaches it and it still shows the highlight, while a
  held pointer press leaves its state layer exactly where hovering had left it — measured on the
  rendered `::before`, against an enabled row whose press does add a step;
- a Combobox that is read-only (browsable, clear unavailable) and one disabled both by its own prop
  and by the `Field` around it (both trailing parts marked and unavailable), since those parts
  style themselves from the primitive's own markers;
- an anchored surface placed on each side of its trigger, asserting the resolved origin and the
  direction of its travel rather than only that it appeared;
- the motion invariants (`motion.spec.ts`, below);
- Wave B surface semantics under the torture theme and in forced colors;
- hostile custom theme roles, including portaled content;
- forced-colors focus/state/boundary fallbacks.

#### Motion invariants (`motion.spec.ts`)

`apps/showcase/tests/browser/motion.spec.ts` pins what the rendered component does with the
motion layer. It reads computed styles, state attributes and geometry — never a screenshot —
because the subject is a physical contract rather than a pixel:

- **a stable boundary stays still** — a checkbox box and a radio circle have byte-identical
  bounding boxes before, during and after the pointer press that changes what is inside them,
  and the mark that appears is on the arrival recipe;
- **a relocation is complete** — a tab indicator interpolates every geometry property it
  changes (position on both axes, width and height), and a keyboard selection relocates it
  without the newly selected tab gaining any press geometry;
- **a drag is never interpolated** — a slider handle's transition list contains its positional
  property while a step settles and does not contain it while the pointer owns the position,
  with the handle centre measured against the pointer;
- **`Select` and `Combobox` agree** — the same trigger tactility, the same orientation recipe on
  the chevron, the same anchored presence on the popup and the same arrival on the selected
  mark, and filtering a list replaces its rows with no transform, height or opacity
  choreography;
- **consumer triggers are untouched** — a plain `<button>` handed to `Popover`/`Menu` as a
  trigger gains no authored motion before or after the surface opens;
- **every tooltip edge resolves** — top, right, bottom and left each report their own resolved
  side and travel direction from one recipe, on the lighter local timing;
- **the modal roles share one presence** — `Dialog` and `AlertDialog` render the same presence
  contract, the scrim animates opacity only, and the dialog's own anatomy carries no transition
  at all;
- **an entrance is observable** — `data-starting-style` exists for a single frame and is applied
  imperatively to a node that is not yet in the document, so the suite observes the attribute
  write and reads the computed style one microtask later. That recorder is what makes the two
  presence invariants below checkable rather than vacuous;
- **an initially-open surface never enters** — the initially-open dialog at `/verification/dialog`
  records no entrance after hydration and runs no animation, while a surface the user opens does;
- **repositioning is not presence** — resizing the viewport with a popup open re-places it without
  recording a second entrance, and a rapid close → open in the motion lab's slow motion leaves
  exactly one surface, no stale `data-ending-style` and a settled opacity;
- **reduced motion** — emulated at the page level, it records no spatial entrance at all, reports
  the popup on opacity-only presence, keeps a control's hover state, and turns the spinner and the
  skeleton into static glyphs.

The suite runs with motion enabled and emulates the reduced-motion preference itself, because the
host stylesheet also answers that preference. The motion lab (`/verification/motion`) is the same
specimens under workbench controls — normal speed, 4× slow motion, and reduced motion — and is
development-only: the two speed controls override the canonical duration variables on the document
while the page is open, and nothing in the package reads them. A page cannot force a media feature,
so the reduced-motion control mirrors this host's own reduced-motion reset (durations collapsed)
rather than re-implementing the package's `motion-reduce:` rules; the canonical reduced-motion
behaviour is verified above, with the preference emulated by the browser.

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

Every scan waits for hydration before it runs. Base UI generates its ARIA wiring in effects, so
the server-rendered shell of a field is briefly a control with a `<label for>` and no
`aria-labelledby`; a scan that races hydration reports unnamed fields rather than a defect. The
wait is for hydration itself — the `data-hydrated` marker the root layout sets once the whole
tree below it has run its effects, which React flushes parent-last — and not for a page-wide
selector such as `[aria-labelledby]`, which any unrelated component on the page can satisfy while
the component under test is still bare. The wait is the state, not a timeout.

**One combination is asserted directly instead of scanned, and it is tracked as an upstream
risk.** With a Combobox listbox open, Base UI's combobox focus manager marks the document around
the popup `aria-hidden` without `inert`, and axe reports `aria-hidden-focus` against that page
content. The markup is Base's, not Sherick's, and Sherick does not patch a base primitive's ARIA.
That state is therefore verified with direct assertions — `role="listbox"`, `role="option"`,
`aria-selected`, `aria-disabled` and the input's `aria-activedescendant` — while the closed
fixture still runs the full axe scan over the same control, its `Field` label, description and
error relationships. A modal Menu, an open AlertDialog and the closed Combobox are all scanned
normally.

Those assertions are **not** equivalent to scanning the open state, and they are not recorded as
if they were: the behavior comes from Base's shared modal/focus infrastructure and has been
reported against Base itself. It is a dependency risk to settle before the stable `2.0.0` — an
upstream fix, or an explicit decision that an open listbox may hide the rest of the page from
assistive technology.

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
- Dialog, Select, Tooltip, Popover, Menu, Combobox and AlertDialog remain styled through portals;
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
2. `bun run test:motion` — temporal ownership across component modules;
3. library typecheck and build (ESM/CJS/declarations plus generated `styles.css`/`theme.css`);
4. showcase and no-Tailwind typechecks and production builds;
5. `bun run test` — library smoke checks over the built artifact;
6. `bun run test:bundle` — size and tree-shaking budgets;
7. `bun run test:packed` — `npm pack` publication contract in a clean consumer;
8. `bun run visual` — deterministic style-contract snapshots;
9. `bun run test:browser` — showcase (interaction, motion, accessibility, responsive, visual)
   and no-Tailwind browser suites.

Each step has a different job and a different failure meaning. A red bundle gate is a size or
boundary regression, not a styling defect; a red browser suite is not a publication defect.
Because the size budgets and the visual baselines are recorded artifacts, a genuine
architecture change updates them deliberately and in the same change that changes the
contract.
