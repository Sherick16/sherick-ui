# Sherick UI — agent instructions

## Branch and delivery hygiene

Before changing an existing branch or PR, fetch and rebase it onto `origin/main` — or, at minimum,
review `git log --oneline origin/main..HEAD` and the commits main has that the branch lacks. A stale
base hides work main has already done, including recorded known failures and restructuring of the
tests you are about to touch.

A requested change on a branch is not complete until it is committed and pushed (unless the user
says otherwise). Do not update a PR description ahead of the branch: confirm the PR head SHA moved
before claiming delivery in the body.

## Design language (mandatory)

Before any work that creates, changes or reviews reusable UI — a component, variant,
state, or any class that ships — read [`docs/DESIGN_LANGUAGE.md`](docs/DESIGN_LANGUAGE.md)
in full. It is the canonical visual authority.

Its implementation owners are:

- `packages/ui/src/components/ui.common.ts` — reusable non-temporal visual recipes;
- `packages/ui/src/components/ui.motion.ts` — semantic motion intents and temporal recipes;
- `packages/ui/src/styles/tokens.ts` — authored runtime theme/token values;
- `packages/ui/scripts/build-styles.ts` — private CSS compilation/scoping into published artifacts.

`dist/theme.css` and `dist/styles.css` are generated outputs. Never hand-edit them.

### Never invent a system-level visual rule locally

These belong to the design language. Use the named primitive, or extend the language
first — never write the rule into a component:

- **colors and tone roles** — no one-off colors, literal color values, or a tint that is
  not a `tone` role;
- **material recipes** — no hand-written fills, gradients, blur or saturation;
- **elevation and shadows** — nothing outside the elevation ladder;
- **shape** — no literal radii in place of a `shape` role;
- **structural edges and rims** — no borders or rings tracing a filled control; hairlines
  come from `edge`, and a public divider comes from `Divider`;
- **state treatments** — hover, pressed, selected and disabled come from `state` and
  `stateLayer`, not from a locally written color or depth change;
- **focus treatment** — use the canonical focus recipes (`focusRing`, `focusRingInset`,
  `focusRingWithin`, `groupFocusRing`) rather than rebuilding their values locally;
- **motion** — choose a semantic intent from `ui.motion.ts` by what the part is doing
  (`feedback`, `tactile`, `arrive`, `orient`, `relocate`, `direct`, `disclose`, `presence`,
  `activity`). Do not write literal `duration-*`, `ease-*`, `transition-*`, `animate-*`
  or keyframes in a component, and do not choose a spring/easing directly.

Motion has one additional rule: **components decide what changes; the motion system decides
how change moves.** Target geometry may remain component anatomy, but timing/easing/transition
ownership does not. One DOM node has one spatial-motion owner. Direct manipulation never
interpolates pointer-driven geometry. Stable selection boundaries do not bounce. Base UI owns
popup placement/lifecycle; Sherick owns the Popup's visual presence and never animates the
Positioner or adds exit timers.

The old `motion` object in `ui.common.ts` is gone, and it must not come back. `ui.motion.ts` is
the package's only temporal owner, `bun run test:motion` enforces that with no allowlist, and a
component that needs a new physical behaviour extends the motion module rather than a file's own
classes.

### Component-local anatomy is yours to decide

Do not promote ordinary anatomy into global primitives. Decide these inside the component:

- layout and element arrangement;
- spacing between a component's own parts;
- component-specific padding;
- intrinsic dimensions and aspect;
- responsive arrangement and breakpoints;
- content typography for copy the component renders;
- target motion geometry (for example a chevron's final rotation or an indicator's destination),
  while `ui.motion.ts` still owns how that geometry transitions.

### If a genuinely new visual rule is required

Extend the canonical language first:

1. add the rule to `docs/DESIGN_LANGUAGE.md` with its role and when-to-use / when-not-to-use examples;
2. add/reuse non-temporal recipes in `packages/ui/src/components/ui.common.ts`, or temporal
   recipes in `packages/ui/src/components/ui.motion.ts`;
3. if it requires a runtime theme value, add that value to `packages/ui/src/styles/tokens.ts`;
4. then consume the primitive in the component.

Do not edit generated CSS to add the rule.

## Styling distribution (mandatory)

Tailwind CSS is private Sherick UI authoring/build infrastructure. It is **not** a consumer
contract. Do not add a public Tailwind preset, Tailwind peer dependency, package-content
scan requirement, or instructions that ask consumers to compile Sherick component classes.

The supported component styling integration is:

```ts
import "./app-or-framework.css";
import "sherick-ui/styles.css";
```

Host/framework/reset/Tailwind CSS loads first; Sherick UI loads second. A dedicated app
override stylesheet may load after Sherick when selector-level overrides are required.
Do not reverse the host/Sherick order casually: a host Tailwind build can independently
emit a generic class such as `.px-6`; if that copy loads after Sherick it can override a
responsive internal utility such as `.sm:px-7` on the same component and silently change
layout. `className` Tailwind overrides remain supported because `cn()`/tailwind-merge
removes the conflicting internal class from the rendered element.

`styles.css` must remain self-contained, scoped and reset-free.

### Private style scope and cascade

The shared `cn()` helper adds the internal `.sui-scope` marker used by generated CSS to
prevent generic authoring utilities from leaking into consumer applications.

Rules:

- route every independently styled component root through `cn()`;
- descendants under a scoped root may use literal class strings when they remain inside
  that root, although `cn()` is preferred when composing recipes;
- every independently portaled styled subtree must establish its own scope through `cn()`;
- never ask consumers to add or target `.sui-scope`; it is private implementation detail;
- do not create global utility selectors, resets/preflight, or package `!important` rules;
- theme defaults may live in the low-priority `sherick-ui-theme` cascade layer;
- component, motion, accessibility and rich-content rules must remain **unlayered but
  scoped**. Do not wrap them in a named cascade layer: ordinary unlayered host rules would
  outrank them before specificity is considered and can erase backgrounds, border alpha,
  elevation shadows and Tailwind state variables;
- because Sherick does not ship Tailwind preflight, `build-styles.ts` owns the scoped
  initialization of Tailwind runtime plumbing variables required by shadows, rings,
  transforms and filters. Do not rely on a consumer Tailwind installation to provide them.

Base-backed portal primitives such as Dialog, Select and Tooltip are the reference pattern
for independent portal scope ownership.

### Theme contract

Runtime theme values have one authored source: `packages/ui/src/styles/tokens.ts`.
Explicit dark and system dark output are generated from the same canonical dark object.
Do not duplicate fallback theme values in Tailwind config, component arbitrary values,
Prism themes or documentation snippets.

Consumers customize themes through `--sui-*` variables at document/root level. Do not
promise nested isolated theme islands unless the portal-container architecture is designed
for them explicitly.

## Public surface (mandatory)

The package publishes exactly five subpaths, and they are settled:

- `sherick-ui` — the core barrel, with the canonical component and prop-type exports;
- `sherick-ui/content` — the rich-content boundary, **ESM only**: `Markdown`, `CodeBlock`, `MarkdownProps`, `CodeBlockProps`;
- `sherick-ui/dev` — development-only helper exports for this repository's workbench. Unstable, unsupported, and not part of the consumer contract;
- `sherick-ui/styles.css` — the complete published component stylesheet;
- `sherick-ui/theme.css` — token-only theme output.

The public naming surface is canonical: `Button`, `Select`, `Dialog`, `Tabs`. Compatibility
aliases are not a supported pattern — not in source, not in types, not in fixtures, not in
documentation. A rename is a clean cutover: delete the old name, migrate every caller.

Rich content (`Markdown`, `CodeBlock`, Prism, remark/rehype, KaTeX) lives behind its own
subpath, `sherick-ui/content`, and MUST NOT become reachable from the root barrel. Importing a
core component must never *bundle* a syntax highlighter or a Markdown pipeline;
`bun run test:bundle` fails if it does. The boundary is a bundle boundary, not an install one:
the rich stack stays in `dependencies`, so installing the package installs it whether or not
the subpath is ever imported.

`sherick-ui/content` is **ESM only** and declares no `require` entry, because its dependency
stack (`react-markdown`, `remark-*`, `rehype-*`) has no CommonJS build. Do not add a CommonJS
entry for it, and do not add an `engines` floor to stand in for one — the subpath is expressed
in `exports`, and the core entries stay CommonJS-safe on their own.

`@base-ui/react` is internal behavioral infrastructure and `tailwindcss` is internal
authoring/build infrastructure. Neither is consumer API: the package exposes no Tailwind
preset, declares no Tailwind peer dependency, requires no content scanning, and consumers
must not import Base UI to use Sherick UI. Base UI internals are not covered by this
package's compatibility promise.

The package is on a prerelease line. `1.0.0`-`1.0.5` are published and `1.0.5` holds the npm
`latest` dist-tag, so the `1.x` line is frozen and new work ships as `2.0.0-alpha.N` under the
`alpha` dist-tag. Breaking changes are allowed and expected without deprecation cycles, and
compatibility starts being promised at the stable `2.0.0`. Do not add a release to `1.x`, and
do not publish a prerelease under `latest`. See [`docs/RELEASE.md`](docs/RELEASE.md).

## Frozen architecture (mandatory)

The package boundary, the Base UI behavior boundary, the styling distribution, theme/token
ownership, public API naming, the rich-content boundary, the package `exports` map, the
verification layers and the size budgets are all **settled**:

> New components should extend existing primitives, recipes, package exports and verification infrastructure. Do not introduce a new architectural layer unless an existing invariant cannot support the requirement.

Do not reintroduce:

- **compatibility aliases** — no `ActionButton`, `Dropdown`, `Modal`, `TabGroup`, no
  deprecated prop shims (`Tabs.defaultTabId`, `Tabs.onTabChange`, `Dialog.onClose`,
  `Select.selected`, `Select.onSelect`, `Table.variant`, an `onChange` re-added as a Sherick
  callback), and no re-export of a removed name from any subpath;
- **rich-content imports from the root barrel** — `Markdown`, `CodeBlock`, Prism or KaTeX
  must never become reachable from `sherick-ui`, and no heavyweight dependency may be added
  to the core barrel. Rich content also stays ESM-only: no CommonJS entry for
  `sherick-ui/content`;
- **a new architectural layer** — no second wrapper over Base UI, no parallel styling
  delivery mechanism, no alternative theme system, no second rich-content entry point;
- **a size-budget increase without a recorded reason** — `packages/ui/scripts/bundle-budget.mjs`
  against `packages/ui/scripts/bundle-budget.json` is the single owner of size budgets; a
  baseline increase is an architecture change and needs a deliberate, recorded reason.

If an existing invariant genuinely cannot support a requirement, that is an architecture
decision: update `docs/ARCHITECTURE.md` and `docs/RELEASE.md` in the same change rather than
working around it locally inside one component.

## Behavioral foundation (mandatory)

Base UI (`@base-ui/react`) is Sherick UI's behavioral and accessibility substrate. Sherick
UI owns the visual language, component anatomy and opinionated public API; Base UI owns
generic interaction mechanics wherever it provides the primitive.

Use Base UI directly from its public subpath (`@base-ui/react/dialog`,
`@base-ui/react/select`, etc.). Do not build a second internal wrapper layer around Base
UI before the Sherick component.

When Base UI provides the behavior, do **not** implement these locally:

- keyboard navigation or roving tab index;
- focus trapping, initial focus or focus restoration;
- popup portals, anchoring, collision handling or viewport positioning;
- outside-interaction detection or Escape-key dismissal;
- ARIA role/relationship plumbing or generated accessibility IDs;
- hidden form inputs or form participation for composite controls;
- controlled/uncontrolled primitive state helpers;
- popup mount/unmount lifecycle or animation-completion timers.

A component may still own product-neutral convenience behavior that Base UI does not model
(for example copying code to the clipboard), but generic widget behavior belongs to Base
UI. If Base UI lacks a required behavior, document the gap before adding local
infrastructure.

Native HTML remains the right foundation for passive semantics that need no headless
primitive: cards, badges, tables, navigation links and similar content should not be
forced through Base UI just for consistency.

### The showcase

The development showcase (`apps/showcase/app/page.tsx`) demonstrates the system and never explains it.
It holds specimens, labels and interactive states only; every piece of information appears
once, and design rationale belongs in `docs/DESIGN_LANGUAGE.md`.
