#!/usr/bin/env node
/*
 Motion policy
 =============
 One module owns how change moves: `src/components/ui.motion.ts`. It owns every
 transition property, duration, curve, animation and reduced-motion rule in the
 library, and every component consumes it by importing a semantic leaf recipe.

 This gate is deliberately a plain text check rather than a parser: the contract is
 about which tokens may appear in a component's source at all, and a deterministic
 repository-wide search states that directly.

 Enforced:
   1. no authored `duration-*`, `ease-*`, `transition-*` or `animate-*` utility in a
      component module;
   2. no authored animation declaration or keyframe;
   3. no component-local presence lifecycle (`data-[starting-style]` / `data-[ending-style]`):
      a surface describes those two states through a named presence recipe, not inline;
   4. no consumer of the removed legacy `motion` object, and no legacy export for one to
      come back through;
   5. no allowlist, no per-file exception, no activity carve-out.

 `ui.motion.ts` is the only file exempt, and only because it is the owner.
*/

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(packageRoot, "src", "components");
const motionModule = "ui.motion.ts";

const rawTemporal = [
  /(?:^|[^\w-])duration-[\w[\]().,%-]+/g,
  /(?:^|[^\w-])ease-[\w[\]().,%-]+/g,
  /(?:^|[^\w-])transition(?:-|\[)[^\s"'`)]*/g,
  /(?:^|[^\w-])animate-[\w[\]().,%-]+/g,
];

const rawAnimation = [/@keyframes\b/g, /(?:^|[^\w-])animation\s*:/g];

/* Base publishes these two states on any surface whose presence Base owns. A component names
   the presence recipe instead, so the state can never carry a local timing with it. */
const localPresence = [/\bdata-\[(?:starting|ending)-style\]/g];

const withoutComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const files = (await readdir(componentsDir)).filter((name) => /\.(?:ts|tsx)$/.test(name));
const failures = [];

for (const file of files) {
  if (file === motionModule) continue;

  const source = withoutComments(await readFile(join(componentsDir, file), "utf8"));

  for (const pattern of [...rawTemporal, ...rawAnimation, ...localPresence]) {
    for (const match of source.matchAll(pattern)) {
      failures.push(`${file}: ${JSON.stringify(match[0].trim())}`);
    }
  }

  if (/\bmotion\s*[,.}]|\bmotion\./.test(source)) {
    failures.push(
      `${file}: the legacy \`motion\` object is gone; import a semantic leaf recipe from ui.motion.ts`
    );
  }
}

const motionSource = await readFile(join(componentsDir, motionModule), "utf8");
if (/legacyMotion/.test(motionSource)) {
  failures.push(`${motionModule}: the legacy \`motion\` bridge must not come back`);
}
if (!/export const motionPresenceAnchored\b/.test(motionSource)) {
  failures.push(`${motionModule}: the anchored presence recipe is missing`);
}

if (failures.length > 0) {
  console.error("Motion policy violations:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(
    `\nMotion timing, curves, transitions and presence belong to src/components/${motionModule}, and nothing else.`
  );
  process.exit(1);
}

console.log(`Motion policy passed (${files.length} component modules, ${motionModule} is the only temporal owner).`);
