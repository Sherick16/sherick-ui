# Sherick UI consumer skill

The installable skill starts at [sherick-ui/SKILL.md](sherick-ui/SKILL.md). Register or
copy the whole `sherick-ui` folder through your agent's supported skill mechanism,
preserving `references/`. Installing the npm package alone does not install this skill;
this foundation does not change npm packaging or publish a release.

This is for **consuming applications**. The repository's root `AGENTS.md` remains
maintainer guidance and should not be copied into an application as consumer rules.

## Ownership and progressive disclosure

`SKILL.md` owns the workflow, universal constraints and direct task routes. The four
cross-cutting references own visual decisions, application composition, CSS/theme
integration and accessibility. The component index routes by user intent to focused API
references; it is not a second component manual. Load only the family relevant to the task.

Maintain each detailed rule in its owning reference. Link to an owner when another
topic needs it rather than copying its procedure. Do not make every task load every
reference. The skill folder is portable: its internal links stay within the folder,
and upstream evidence uses revision-pinned links rather than assuming a library clone.

## Grounding and maintenance

The cross-cutting foundation was checked against `main` at
[`b1c201b`](https://github.com/Sherick16/sherick-ui/commit/b1c201bc0ef2c755b508a968b90f8a02f2cd2d85); the component-reference pass was checked against current `main` at
[`2bf6da5`](https://github.com/Sherick16/sherick-ui/commit/2bf6da5189e0e5b0d113954029e2fe6f0fda1ef3).
The canonical [design language](../docs/DESIGN_LANGUAGE.md) owns visual policy;
[consumer documentation](../packages/ui/README.md), [package exports](../packages/ui/package.json)
and public declarations own the consumer API. Implementations, relevant tests and showcase
specimens were checked to distinguish contracts from examples and internal behavior.

These guides are a consumer translation, not a new visual authority. When a contract
changes, update its reference and source provenance together. Reconcile conflicting
sources explicitly; do not silently redefine the system through this skill. The source
revision is provenance, not a promise that unreleased `main` exports are installed.

## Component references

The semantic [component index](sherick-ui/references/components/index.md) routes all stable
root exports, unreleased v2.1 additions and the ESM-only `sherick-ui/content` exports to
five focused family references. It marks release availability separately from repository
presence and links shared composition, design, theming and accessibility rules to their
owners. Keep API caveats with the relevant component family; do not create one file per
trivial export or duplicate the cross-cutting foundation.

## Review checks

Validate frontmatter and naming against the Agent Skills specification. Check local
links/anchors, export-to-reference coverage and portability after copying just the skill
folder. Use the [component cold-start scenarios](COMPONENT_SCENARIOS.md) to evaluate
representative component choice, API usage, compound composition and release availability;
keep task prompts separate from evaluator criteria. Typecheck examples against the package
version they document where practical. Structural checks are not proof of agent
effectiveness or a full application accessibility audit.

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
