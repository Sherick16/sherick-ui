# Sherick UI consumer skill

The installable skill starts at [sherick-ui/SKILL.md](sherick-ui/SKILL.md). Register or
copy the whole `sherick-ui` folder through your agent's supported skill mechanism,
preserving `references/`. Installing the npm package alone does not install this skill;
this foundation does not change npm packaging or publish a release.

This is for **consuming applications**. The repository's root `AGENTS.md` remains
maintainer guidance and should not be copied into an application as consumer rules.

## Ownership and progressive disclosure

`SKILL.md` owns the workflow, universal constraints and direct task routes. Its four
foundation references own visual decisions, application composition, CSS/theme
integration and accessibility respectively. The component index is the one deliberate
lookup hop for future individual API references; it currently supplies an honest
installed-package fallback, not an incomplete catalog presented as complete.

Maintain each detailed rule in its owning reference. Link to an owner when another
topic needs it rather than copying its procedure. Do not make every task load every
reference. The skill folder is portable: its internal links stay within the folder,
and upstream evidence uses revision-pinned links rather than assuming a library clone.

## Grounding and maintenance

The foundation was checked against `main` at
[`b1c201b`](https://github.com/Sherick16/sherick-ui/commit/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85).
The canonical [design language](../docs/DESIGN_LANGUAGE.md) owns visual policy;
[consumer documentation](../packages/ui/README.md), [package exports](../packages/ui/package.json)
and public declarations own the consumer API. Recipes in `ui.common.ts`, authored
`styles/tokens.ts`, the CSS compiler, `Field.tsx` and the showcase root were inspected
to distinguish actual contracts from demonstrations or implementation details.

These guides are a consumer translation, not a new visual authority. When a contract
changes, update its reference and source provenance together. Reconcile conflicting
sources explicitly; do not silently redefine the system through this skill. The source
revision is provenance, not a promise that unreleased `main` exports are installed.

## Component-reference handoff

Populate [the component index](sherick-ui/references/components/index.md) in a separate
pass. Each reference should cover exact imports/types, supported composition, minimal
valid usage, state ownership/callbacks, meaningful states and specific caveats. Record
release availability; do not assume repository presence equals a published API. Keep
shared rules in the foundation and group small related APIs without creating a giant
manual. This pass deliberately does not enumerate components or generate prop tables.

## Review checks

Validate frontmatter and naming against the Agent Skills specification. Check local
links and anchors, direct reachability of each foundation reference, and portability
after copying just the skill folder. Review setup, visual composition, theme changes,
accessibility/RTL and missing-component-reference tasks through the routes; an unrelated
backend task should not require this skill. Typecheck any future component examples
against the package version they document. Do not call structural checks a model eval
or a full application accessibility audit.

## Research basis

- [Agent Skills specification](https://agentskills.io/specification): descriptive
  frontmatter, portable folders and on-demand resources.
- [Anthropic authoring guidance](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
  and [skill-creator example](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md):
  task triggers, concise instructions, explicit reference routes and scenario review.
- [Vercel React skill](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md):
  a discoverable index leading to focused rule files. The foundation adopts that routing
  pattern, not its full rule catalog or framework-specific recommendations.

Research informed the packaging; Sherick's source informed the design rules. Relevant
WAI/WCAG sources are linked where they constrain consumer composition.
