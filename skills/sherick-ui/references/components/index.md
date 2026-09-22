# Component index

Individual component references are intentionally not populated in this foundation.
Absence here does not mean a component is unavailable in the installed package.

## API lookup until entries exist

Resolve the consuming application's installed package and inspect its `exports` and
`types` entries. Follow only the declarations for the relevant export; consult that
version's package README and matching source/examples for behavior not expressed by
types. Distinguish native events from value/state callbacks. Do not infer a public API
from a screenshot, private DOM attributes or upstream Base UI documentation.

When an entry exists, read its linked reference rather than every component document.
If a signature or behavior conflicts with the installation, follow the
[version-check workflow](../../SKILL.md#how-to-work-with-sherick-ui) before writing code.

## Routing convention for the component pass

Add concise rows under this heading with: **user need → public export/import path →
relative reference link**, plus a release-availability note when relevant. Link only
to files that exist. Use family files for related small contracts and dedicated files
for complex ones; avoid intermediate indexes or a duplicated all-components manual.

Each target owns its API, usage, important states and component-specific caveats.
The cross-component references remain the owners of design, composition, theming
and accessibility guidance. No component entries are claimed by this handoff.
