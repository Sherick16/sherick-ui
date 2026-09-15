# Sherick UI — agent instructions

## Design language (mandatory)

Before any work that creates, changes or reviews reusable UI — a component, a variant, a
state, or any class that ships — read [`docs/DESIGN_LANGUAGE.md`](docs/DESIGN_LANGUAGE.md)
in full. It is the canonical source of truth for Sherick UI's visual language;
`components/UI/ui.common.ts` (recipes) and `theme.css` (tokens) implement it.

**Never write a visual rule outside the canonical primitives.** Prohibited in reusable UI:

- one-off colors or literal color values
- one-off shadows, or any depth recipe outside the elevation ladder
- literal radii instead of a `shape` role
- literal motion durations, easings or `transition-*` lists instead of a motion family
- material recipes — fills, gradients, blur or saturation written by hand
- structural rims: borders or rings tracing a filled control
- any other visual rule that is not expressed as a named primitive

**If a genuinely new visual rule is required, extend the canonical design language
first.** Add the rule to `docs/DESIGN_LANGUAGE.md` with its role and its when-to-use /
when-not-to-use examples, add the primitive to `components/UI/ui.common.ts` and its
tokens to `theme.css`, then consume it. Never implement the rule locally in the component
that needs it.

The development showcase (`app/page.tsx`) demonstrates the system and never explains it:
it holds specimens, labels and interactive states only, and carries no design rationale.
