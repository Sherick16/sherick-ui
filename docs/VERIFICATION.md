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
  state layer once shipped without its hover rule;
- the **contrast contract** of the published tokens (`scripts/contrast-contract.mjs`, run from
  `scripts/smoke-package.mjs`): every composition the design language permits, in both themes, from
  the values in `dist/theme.css` — each text role against each surface a component composites over,
  a semantic foreground on its own tint and through its hover and pressed states, an on-colour on its
  strong fill through the filled states, the marks that carry a selection, the error placeholder, the
  non-text `detail` role, the `CodeBlock` syntax palette and a Prism namespace token on the code
  well, the wall of an empty mark's well that the light makes legible, and the focus indicator
  against every surface and every fill an inset ring is drawn over. **Every composition is pass or
  fail: there is no allowlist.** One module owns the colour math and one owns the description of the
  compositions; the state, tint and field alphas it measures are derived from the published recipes,
  the acrylic fills and the well wall are read from the theme tokens, and the same module proves
  every recipe class has a published rule. The same module is what the palette was solved against,
  so the numbers in `docs/PALETTE.md` are the numbers this gate measures. The well's rendered
  contrast is not modelled here: the browser suite reads the pixels the inset shadow actually
  paints. This is also the layer the axe scan cannot be: a scan only sees the states a fixture
  happens to be in, and `@axe-core/playwright`'s `color-contrast` rule does not evaluate
  `::placeholder` text at all.

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

Six runtime fixtures are bundled with esbuild — `button`, `form`, `overlay`, `toggles`,
`barrel` and `content` — resolved through Node package self-reference exactly as a consumer bundler would,
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

Its specimens render real Lucide marks rather than a one-character placeholder, because what the
gate pins is a slot with its own size, whitespace and optical weight; and the multiline cases it
carries — a wrapped alert, a wrapped radio label — pin the anatomy a component gives a mark beside
copy that wraps.

This is a deterministic **style-contract** regression gate, not a pixel/browser visual test. It is
also the repository's **palette gate**: the token blocks it records pin every `--sui-*` value in both
themes, so a colour change cannot pass unreviewed. (The browser screenshots below are a
layout/styling-distribution gate by contrast — they compare pixels with a tolerance, and a
palette-only change is inside that tolerance.)

## Browser integration and visual regression

`bun run test:browser` runs two browser suites.

For focused iteration, `bunx playwright test <spec> -g "<name>"` (from `apps/showcase`) reuses the
already-built production server, so a test-only change needs no rebuild. `bun run test:browser`
remains the gate, and `bun run verify` is the run that builds the artifact it serves.

### Next showcase

The existing reviewed Chromium snapshots remain the visual baseline for:

- representative core controls in light mode;
- representative core controls in dark mode;
- initially-open Dialog overlays in light mode;
- initially-open Dialog overlays in dark mode.

Those screenshots are immutable: a difference is a styling-distribution defect unless explicitly proven otherwise.

The visual-consistency pass deliberately updates only the two core screenshots: Tabs now uses
the shared recessed track with nested corner roles, and Switch mirrors its thumb in RTL. The
review also accepts the already-landed palette and settled-thumb rendering visible against the
older pixel baselines; no token value changed in this pass. The Dialog screenshots are unchanged.
The findings and deliberate differences are recorded in [VISUAL_CONSISTENCY.md](VISUAL_CONSISTENCY.md).

`visual-consistency.spec.ts` adds both-theme rendered assertions for sibling field density, invalid
engagement, inherited disability without double opacity, loading/resting depth, held-state feedback,
list rhythm, nested corners, logical alignment, disabled compression and narrow RTL/toast anatomy.
The original narrow Tabs test now verifies an actual inset keyboard ring at the scrolled edge
instead of assuming the old outer ring's 5px clearance.

Two follow-ups are recorded in [VISUAL_CONSISTENCY.md](VISUAL_CONSISTENCY.md). A one-line toast and
then a one-line closeable `Alert` each held extra space below their copy, because the 44px
dismissal compensated only its top edge; both now give the excess back on both vertical edges, and
`optical-balance.spec.ts` asserts the one-line alert's symmetric insets, copy-derived height and
intact 44×44 target beside its existing wrapped first-line case. The rule was re-checked across the
library: `DialogDismiss` and `Search`'s submit are positioned rather than in flow, so no third
instance exists.

For repeatable human review (not a replacement for the immutable screenshot gate):

```bash
# After building the library and showcase
cd apps/showcase
VISUAL_REVIEW=1 bunx playwright test visual-consistency.spec.ts -g "rendered review"
```

This opt-in pair writes sibling bands, real open overlays, four Drawer sides, narrow RTL specimens
and every showcase section to the Playwright output directory. Normal CI skips only these two
artifact-producing reviews; the both-theme invariant tests always run.

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
- a disclosure group (`disclosure.spec.ts`): the row is a button inside a heading, the region is
  reached through the role and the name it publishes, single-open closes the section before it, a
  disabled section stays closed, and the group's own `Divider` is inset to the band the row and the
  panel share, wears the lightest edge role, yields beside a hovered section and holds under an
  expanded one. An opening region is observed growing out of the collapsed state the primitive
  opens from, and a closing one is sampled as the close begins — still at its opened size, which is
  only true when the height is interpolated rather than applied. Reduced motion is asserted on the
  property itself (`transition-property: none`), not on its duration;
- a sheet (`sheet.spec.ts`): flush to the edge it was given, above the page, square against that
  edge and rounded away from it, arriving with a transform and an opacity; it locks the page's own
  scroll, traps focus through a full cycle in both directions and returns it to the trigger, and
  closes on Escape, on a press outside and from its own dismissal control;
- the toast stack (`toast.spec.ts`): one polite live region, each toast a dialog named by its own
  title, dismissal through the stack's control and through `close()`, an action that reports its
  outcome and leaves the toast to the caller, the limit marking the oldest toast `limited` and
  inert, a timeout dismissing itself, and a collapsed stack that lays every toast out at the
  frontmost one's height until the stack is engaged. The corner the stack is anchored to is
  re-read under RTL, where `end` resolves to the other physical edge — the API names its ends, so a
  physical inset would leave the stack against the wrong edge; the root is measured while the clamp
  is released, to prove the height is interpolated rather than applied and that the content's own
  height is unchanged throughout, because the content is what the primitive measures and must never
  be sized to the value it produces; and each promise state (`loading`, `success`, `error`) is
  asserted on the mark it renders, since those states are set by the primitive rather than chosen
  by a caller;
- the optical-balance specimens (`optical-balance.spec.ts`): a loading mark occupies the slot its
  icon had without changing the control's width, a chip's dismiss control keeps a target that
  clears the pointer minimum while its visible edge distance survives a writing-direction flip, and
  a wrapped alert's status mark and its dismissal are both centred on the first line rather than on
  the middle of the block;
- a collection row's two signals (`floating-surfaces.spec.ts`): a pointer that opens a Menu and moves
  over a row gets the navigation highlight and **no** ring, a keyboard that opens the same menu and
  steps down it gets both, and a disabled-but-navigable row keeps the ring that says where the
  navigation is. Every claim is read from the rendered `::before` opacity, `:focus-visible` and
  `box-shadow` — never from a class name;
- a resting selection mark's boundary (`fields.spec.ts`): an unchecked box and an unselected radio are
  identified by the depth of their `elevation-well`, read from the rendered shadow layers, while a
  filled mark's own fill identifies it. A second assertion reads the *rendered pixels* of the well
  against the surface just outside it and requires that cue to clear 3:1 — the part of the
  requirement the analytical contract cannot see through the blur. The authored model still lives in
  the contrast contract;
- a navigation group's heading level (`interactions.spec.ts`): the fixture asks for level 2 and gets
  a level-2 heading with no level-3 heading left behind, and its rows are links with `aria-current`
  on the current one — a reusable navigation group choosing its own level was the defect;
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
  bounding boxes before, during and after the pointer press that changes what is inside them;
- **a press really moves a control** — a full control compresses 4% of its own width under the
  pointer, a compact control inside a larger target 12%, and a composite field 4% when one of its
  own controls is pressed; and a field does not move at all while it is typed in or focused;
- **the anchored family shares one entrance** — `Select`, `Combobox`, `Menu` and `Popover` are
  compared field by field at frame 0 of their own transitions: starting scale, travel, resolved
  side, transform origin, duration and curve. The starting geometry is read by pausing the
  transition and seeking it to zero, because a running animation outranks the cascade. A tooltip
  is the same geometry on a shorter duration, and a dialog is the restrained large-surface variant
  with no side;
- **the entrance grows rather than slides** — the painted edge moves more than the travel it is
  given, so the scale is what the eye reads;
- **a relocation is complete and never overshoots** — a tab indicator interpolates every geometry
  property it changes, is strictly between its two destinations halfway through, and rides the
  glide curve rather than the arrival curve; a keyboard selection relocates it without the newly
  selected tab gaining any press geometry;
- **a selection mark is made, not faded** — it arrives from half its size, passes slightly beyond
  it and settles, while the boundary it lands inside never moves;
- **an uncontrolled switch relocates** — the thumb travels and grows from the primitive's own
  selection marker, which is what makes its motion reviewable at all;
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
"wcag21aa", "wcag22aa"]` — every rule in the tag set, `color-contrast` included — and asserts
`results.violations` is empty with a message naming every violation id and target selector. The WCAG
2.2 target-size rule is still disabled by default in axe-core 4.13, so the scan enables it explicitly
in the same option object as the tag filter and asserts the rule appears in axe's results — that is
what proves it actually executed rather than being silently skipped. axe runs in both authored
themes (the platform colour scheme is emulated
before the document loads, so no state is read mid-theme-switch) on representative reachable states
rather than scanning the workbench indiscriminately:

- `/` — the showcase itself, which is where the interactive specimens live and therefore the only
  place some states appear at all (a motion stage holding a real control, the toast stack);
- `/verification/core` in its default state;
- `/verification/interactions` in its default state;
- `/verification/rich-content`, which renders the published `CodeBlock` and `Markdown`;
- the initially-open dialog at `/verification/dialog`;
- a Select opened inside the dialog on `/verification/interactions`.

The same spec adds direct assertions axe cannot make: accessible names on icon-only controls,
`aria-busy` on the loading Search, and a visible keyboard focus ring on the core `Primary`
button (`outline-style` other than `none`, `outline-width` at least `2px`).

The `rich-content` fixture also renders a real `CodeBlock`; the one recoverable React hydration
mismatch that component currently logs (a server/client Prism grammar difference, pre-existing and
unrelated to the accessibility contract) is filtered from that fixture's unexpected-error
assertion, while its axe scan runs on the rendered result.

Every scan waits for hydration before it runs. Base UI generates its ARIA wiring in effects, so
the server-rendered shell of a field is briefly a control with a `<label for>` and no
`aria-labelledby`; a scan that races hydration reports unnamed fields rather than a defect. The
wait is for hydration itself — the `data-hydrated` marker the root layout sets once the whole
tree below it has run its effects, which React flushes parent-last — and not for a page-wide
selector such as `[aria-labelledby]`, which any unrelated component on the page can satisfy while
the component under test is still bare. The wait is the state, not a timeout.

**One combination is asserted directly instead of scanned, and it is a demonstrated upstream
gap.** With an editable Combobox's listbox open, axe reports `aria-hidden-focus` — 37 nodes on the
interactions fixture — because the page around the popup is marked `aria-hidden` while remaining
focusable.

Where it comes from, read from the installed Base UI rather than inferred:

- a Combobox that renders its `Input` **outside** the popup (the editable combobox pattern this
  package uses) gets `initialFocus: false` from Base's own default, because focus has to stay in the
  input so typing keeps working (`combobox/popup/ComboboxPopup.mjs`, `computedDefaultInitialFocus`);
- that makes `isUntrappedTypeableCombobox` true, and Base's floating focus manager then passes
  `ariaHidden: modal || isUntrappedTypeableCombobox` — i.e. `true` regardless of `modal`
  (`floating-ui-react/components/FloatingFocusManager.mjs`);
- the same condition is what *skips* the focus guards ("guards are not rendered, but `aria-hidden`
  is still applied"), so the page outside is hidden from assistive technology while focus is still
  free to leave the popup;
- Base's `markOthers` **supports** an `inert` option; `FloatingFocusManager` never passes it.

So the missing `inert` is Base's to add. It cannot be fixed from here without changing what the
component is: the two shapes that avoid it are a combobox whose input renders *inside* the popup
(a different control anatomy, and a different visual contract) or one that hands focus to the popup
(which stops the field being editable while open). `@base-ui/react@1.8.0` is the latest published
version and there is no newer dist-tag, so there is no dependency update to take either.

The state is therefore covered by **direct behavioural assertions** — `role="listbox"`,
`role="option"`, `aria-selected`, `aria-disabled`, the input's `aria-activedescendant`, and the
active row's own highlight — while the *closed* Combobox runs the full axe scan over the same
control and its `Field` label, description and error relationships, and a modal Menu, an open
AlertDialog and a Select opened inside a dialog are all scanned in their open states.

**Those assertions are not equivalent to scanning the open state**, and they are not recorded as if
they were. It remains a dependency risk to settle before the stable `2.0.0`: an upstream fix, or an
explicit decision that an open listbox may hide the rest of the page from assistive technology.

**No rule is excluded.** The scan runs the WCAG A/AA tag set as it is
(`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), `color-contrast` included, and it is the contrast
contract in `bun run test` — not this scan — that keeps the theme able to satisfy it: a scan can only
see the states a fixture happens to be in, it does not evaluate `::placeholder` text at all, and a
node it cannot measure is a node a regression can hide in.

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
  Textarea, Search or Select would overflow the container and fail here. A row that is wider
  than the space it was given owns that difference itself rather than handing it to the page:
  `Tabs` scrolls its own track inside itself, exactly as `Table` scrolls its own grid and a
  segmented control is wrapped by the fixture, so nothing needs a consumer-side workaround to
  stay inside a 320px viewport.
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

The `/hostile` public-API fixture adds a three-engine composition matrix (Chromium, Firefox,
WebKit): narrow grid/flex parents, long text, local scrolling, short/edge/nested overlays, RTL,
touch targets, loading/validation and reflow. See [`HOSTILE_LAYOUT.md`](HOSTILE_LAYOUT.md) for
the scenarios, fixes and the distinction between simulated reflow/viewport reduction and
manual zoom or physical-device coverage. The existing consumer tests remain Chromium-only.

All browser tests fail on page errors or error-level console output.

## CI order

The normal immutable CI path is:

```bash
bun install --frozen-lockfile
bunx playwright install --with-deps chromium firefox webkit
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
