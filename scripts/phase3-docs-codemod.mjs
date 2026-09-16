import { readFile, writeFile } from "node:fs/promises";

const path = "docs/DESIGN_LANGUAGE.md";
let source = await readFile(path, "utf8");

source = source.replace(
  `Two files implement it and neither invents a rule of its own:\n\n| Layer | File | Contains |\n| --- | --- | --- |\n| Recipes | \`packages/ui/src/components/ui.common.ts\` | the named primitives a component composes |\n| Tokens | \`packages/ui/theme.css\` | the values those primitives resolve to, per theme |`,
  `Three sources implement it and none invents a rule of its own:\n\n| Layer | File | Contains |\n| --- | --- | --- |\n| Recipes | \`packages/ui/src/components/ui.common.ts\` | the named primitives a component composes |\n| Tokens | \`packages/ui/src/styles/tokens.ts\` | the authored runtime values those primitives resolve to, per theme |\n| CSS build | \`packages/ui/scripts/build-styles.ts\` | private compilation/scoping into generated \`dist/theme.css\` and \`dist/styles.css\` |`
);

source = source.replace(
  `Primitives: \`flat\`, \`raised\`, \`floating\`, \`control\`, \`recessed\` (published alias\n\`pressed\`).`,
  `Primitives: \`flat\`, \`raised\`, \`floating\`, \`control\`, \`recessed\`.`
);

source = source.replace(
  `| \`pressed\` | the same depth, named for the moment a control reaches it by being held | published alias only; prefer \`recessed\` when the surface is simply sunk | new code — use \`recessed\` |\n`,
  ""
);

await writeFile(path, source);
console.log("Applied Phase 3 design-language documentation cleanup.");
