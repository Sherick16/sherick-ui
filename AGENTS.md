# Sherick UI — agent instructions

## Design language (mandatory)

Before any work that creates, changes or reviews reusable UI — a component, variant,
state, or any class that ships — read [`docs/DESIGN_LANGUAGE.md`](docs/DESIGN_LANGUAGE.md)
in full. It is the canonical visual authority.

Its implementation owners are:

- `packages/ui/src/components/ui.common.ts` — reusable visual recipes;
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
- **motion** — no literal durations or easings, and no new transition family outside the
  shared motion recipes.

### Component-local anatomy is yours to decide

Do not promote ordinary anatomy into global primitives. Decide these inside the component:

- layout and element arrangement;
- spacing between a component's own parts;
- component-specific padding;
- intrinsic dimensions and aspect;
- responsive arrangement and breakpoints;
- content typography for copy the component renders.

### If a genuinely new visual rule is required

Extend the canonical language first:

1. add the rule to `docs/DESIGN_LANGUAGE.md` with its role and when-to-use / when-not-to-use examples;
2. add/reuse the recipe in `packages/ui/src/components/ui.common.ts`;
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
