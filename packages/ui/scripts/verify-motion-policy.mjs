#!/usr/bin/env node
/*
 Motion policy
 =============
 One module owns how change moves: `src/components/ui.motion.ts`. It owns every transition
 property, duration, curve, animation and reduced-motion rule in the package, and every
 component consumes it by importing a semantic leaf recipe.

 This gate is deliberately a plain text check rather than a parser: the contract is about which
 tokens may appear in a component's source at all, and a deterministic repository-wide search
 states that directly. It scans all of `src/`, not one directory, because temporal behaviour can
 hide in a shared helper as easily as in a component.

 Enforced, for every production module:
   1. no authored `duration-*`, `ease-*`, `transition-*` or `animate-*` utility;
   2. no authored animation declaration or keyframe;
   3. no authored temporal declaration in a style object — `transition:`, `transitionDuration`,
      `transitionProperty`, `transitionDelay`, `transitionTimingFunction`, `animation:`,
      `animationName`, `animationDuration`, `animationTimingFunction`,
      `animationIterationCount` — because a style object is a component writing timing by hand
      with no class name for a search for utilities to catch;
   4. no component-local presence lifecycle (`data-[starting-style]` / `data-[ending-style]`):
      a surface describes those two states through a named presence recipe, not inline;
   5. no consumer of the removed legacy `motion` object, and no legacy export for one to come
      back through;
   6. no allowlist, no per-file exception, no activity carve-out.

 Two files are exempt, and only these two, because each owns authored temporal *values* rather
 than consuming them: `ui.motion.ts` is the recipe owner, and `styles/tokens.ts` is the single
 authored source of the durations and curves those recipes reference.
*/

import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(packageRoot, "src");
const owners = new Set([join("components", "ui.motion.ts"), join("styles", "tokens.ts")]);
const motionModule = "ui.motion.ts";

const rawTemporal = [
  /(?:^|[^\w-])duration-[\w[\]().,%-]+/g,
  /(?:^|[^\w-])ease-[\w[\]().,%-]+/g,
  /(?:^|[^\w-])transition(?:-|\[)[^\s"'`)]*/g,
  /(?:^|[^\w-])animate-[\w[\]().,%-]+/g,
];

const rawAnimation = [/@keyframes\b/g, /(?:^|[^\w-])animation\s*:/g];

/* A style object has no class name, so the utility patterns above cannot see it. */
const rawStyleDeclaration = [
  /\b(?:transition|transitionProperty|transitionDuration|transitionDelay|transitionTimingFunction|animation|animationName|animationDuration|animationDelay|animationTimingFunction|animationIterationCount|animationDirection|animationFillMode|animationPlayState)\s*:/g,
];

/* Base publishes these two states on any surface whose presence Base owns. A component names
   the presence recipe instead, so the state can never carry a local timing with it. */
const localPresence = [/\bdata-\[(?:starting|ending)-style\]/g];

const withoutComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const walk = async (directory) => {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path)));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) found.push(path);
  }
  return found;
};

const files = await walk(sourceDir);
const failures = [];

for (const path of files) {
  const name = relative(sourceDir, path).split(sep).join("/");
  if (owners.has(name.split("/").join(sep))) continue;

  const source = withoutComments(await readFile(path, "utf8"));

  for (const pattern of [...rawTemporal, ...rawAnimation, ...rawStyleDeclaration, ...localPresence]) {
    for (const match of source.matchAll(pattern)) {
      failures.push(`${name}: ${JSON.stringify(match[0].trim())}`);
    }
  }

  if (/\bmotion\s*[,.}]|\bmotion\./.test(source)) {
    failures.push(
      `${name}: the legacy \`motion\` object is gone; import a semantic leaf recipe from ui.motion.ts`
    );
  }
}

const motionSource = await readFile(join(sourceDir, "components", motionModule), "utf8");
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
    `\nMotion timing, curves, transitions and presence belong to src/components/${motionModule}, and to the authored values in src/styles/tokens.ts.`
  );
  process.exit(1);
}

console.log(
  `Motion policy passed (${files.length} source modules scanned, ${motionModule} and tokens.ts are the only temporal owners).`
);
