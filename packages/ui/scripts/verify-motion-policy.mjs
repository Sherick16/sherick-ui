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
   6. no `transition-all` anywhere, owner files included: it transitions every property the
      element has, so a shadow, a colour and a layout edge all move on one unnamed curve;

 Enforced on `ui.motion.ts`, the recipe owner, which is where a temporal behaviour is defined:
   7. every exported temporal recipe either names its reduced branch (`motion-reduce:`) or is
      opacity-only, so no recipe can travel through reduced motion by omission;
   8. layout properties (left, top, width, height, inset, margin, padding, …) are transitioned
      only by the recipes that are allowed to relocate, disclose, direct or toast. Every other
      transition runs on transform or opacity;

 And on the compiled stylesheet, when `dist/styles.css` has been built:
   9. every `:hover` rule sits inside `@media (hover: hover)`, so a tap never leaves a hover tone
      behind. Without a built stylesheet this check is reported as skipped, and CI runs the gate
      after the build for that reason.

 No allowlist, no per-file exception, no activity carve-out. Two files are exempt from rules 1–5,
 and only these two, because each owns authored temporal *values* rather than consuming them:
 `ui.motion.ts` is the recipe owner, and `styles/tokens.ts` is the single authored source of the
 durations and curves those recipes reference. Rule 6 applies to both.
*/

import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceDir = join(packageRoot, "src");
const owners = new Set([join("components", "ui.motion.ts"), join("styles", "tokens.ts")]);
const motionModule = "ui.motion.ts";
const compiledStylesheet = join(packageRoot, "dist", "styles.css");

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

/* `transition-all` transitions every property an element has, on one curve nobody named. It is
   forbidden in every file, the two owners included, because the owners are where it would be
   written if it were written at all. */
const transitionAll = [/(?:^|[^\w-])transition-all\b/g, /\btransition(?:-property)?\s*:\s*all\b/g];

/* The recipes whose transition may name a layout property. Each is a physical event that really
   does resize, move or reflow something in flow: a tab or switch indicator travelling, a disclosure
   opening its height, a dragged geometry, a toast re-flowing its stack. Anything else that wants to
   animate a layout edge is wrong, and should be a transform. */
const layoutRecipes = new Set([
  "motionRelocate",
  "motionRelocateLong",
  "motionDirect",
  "motionDisclose",
  "motionPresenceToast",
]);
const layoutProperty =
  /^(?:left|right|top|bottom|inset(?:-inline|-block)?(?:-start|-end)?|inset|width|height|max-(?:width|height)|min-(?:width|height)|margin(?:-[\w-]+)?|padding(?:-[\w-]+)?)$/;

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

/* Every top-level `const` in the recipe module, with its body up to the next one. A recipe that is
   composed from a private helper (`tactileTiming`, `anchoredFrom`) is judged by the helper's text
   too, so the reduced branch is found wherever the module chose to write it. */
const moduleConstants = (source) => {
  const declarations = [...source.matchAll(/(?:^|\n)(export )?const (\w+)\s*=/g)];
  const constants = new Map();
  declarations.forEach((match, index) => {
    const end = index + 1 < declarations.length ? declarations[index + 1].index : source.length;
    constants.set(match[2], {
      exported: Boolean(match[1]),
      body: source.slice(match.index + match[0].length, end),
    });
  });
  return constants;
};

const expandRecipe = (name, constants, seen = new Set()) => {
  const entry = constants.get(name);
  if (!entry || seen.has(name)) return "";
  seen.add(name);
  let text = entry.body;
  for (const identifier of new Set(text.match(/\b[A-Za-z_]\w*\b/g) ?? [])) {
    if (identifier !== name && constants.has(identifier)) text += `\n${expandRecipe(identifier, constants, seen)}`;
  }
  return text;
};

const files = await walk(sourceDir);
const failures = [];

for (const path of files) {
  const name = relative(sourceDir, path).split(sep).join("/");
  const source = withoutComments(await readFile(path, "utf8"));

  for (const pattern of transitionAll) {
    for (const match of source.matchAll(pattern)) {
      failures.push(`${name}: ${JSON.stringify(match[0].replace(/^[^\w-]+/, ""))} transitions every property; name the properties`);
    }
  }

  if (owners.has(name.split("/").join(sep))) continue;

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

const motionSource = withoutComments(await readFile(join(sourceDir, "components", motionModule), "utf8"));
if (/legacyMotion/.test(motionSource)) {
  failures.push(`${motionModule}: the legacy \`motion\` bridge must not come back`);
}
if (!/export const motionPresenceAnchored\b/.test(motionSource)) {
  failures.push(`${motionModule}: the anchored presence recipe is missing`);
}

/* Rules 7 and 8: judged per exported recipe, on the text it expands to. */
const constants = moduleConstants(motionSource);
let recipeCount = 0;
for (const [name, entry] of constants) {
  if (!entry.exported) continue;
  const text = expandRecipe(name, constants);
  if (!/(?:^|[\s:"'\[])(?:transition|duration|ease|animate)-/.test(text)) continue;
  recipeCount += 1;

  const transitioned = [...text.matchAll(/(?:^|[\s:"'\[])transition-(?:\[([^\]]*)\]|([a-z-]+))/g)]
    .flatMap((match) => (match[1] ?? match[2]).split(","))
    .map((property) => property.trim())
    .filter(Boolean);
  const reducedBranch = /motion-reduce:/.test(text);
  const opacityOnly = transitioned.every((property) => property === "opacity" || property === "none");

  if (!reducedBranch && !opacityOnly) {
    failures.push(`${motionModule}: ${name} is temporal but names no reduced branch (motion-reduce:) and is not opacity-only`);
  }

  const layout = transitioned.filter((property) => layoutProperty.test(property));
  if (layout.length > 0 && !layoutRecipes.has(name)) {
    failures.push(
      `${motionModule}: ${name} transitions layout (${layout.join(", ")}); only ${[...layoutRecipes].join(", ")} may`
    );
  }
}

/* Rule 9: the compiled stylesheet. A hover rule that is not guarded by `(hover: hover)` paints a
   tone on a tap, because touch browsers keep the hover state after the tap. */
const guardedByHover = (rule) => {
  for (let parent = rule.parent; parent; parent = parent.parent) {
    if (parent.type === "atrule" && parent.name === "media" && /\(\s*hover\s*:\s*hover\s*\)/.test(parent.params)) {
      return true;
    }
  }
  return false;
};

let hoverRules = "skipped (dist/styles.css is not built)";
const stylesheet = await readFile(compiledStylesheet, "utf8").catch(() => null);
if (stylesheet !== null) {
  let checked = 0;
  const unguarded = [];
  postcss.parse(stylesheet).walkRules((rule) => {
    if (!/:hover\b/.test(rule.selector)) return;
    checked += 1;
    if (!guardedByHover(rule)) unguarded.push(rule.selector.trim());
  });
  /* A stylesheet with one missing guard usually has dozens of siblings, so name the first few and
     count the rest rather than printing the whole selector list. */
  for (const selector of unguarded.slice(0, 5)) {
    failures.push(`dist/styles.css: unguarded :hover rule outside (hover: hover): ${selector}`);
  }
  if (unguarded.length > 5) {
    failures.push(`dist/styles.css: ${unguarded.length - 5} more unguarded :hover rule(s)`);
  }
  hoverRules = `${checked} :hover rule(s) checked, ${unguarded.length} unguarded`;
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
  `Motion policy passed (${files.length} source modules scanned, ${recipeCount} temporal recipes checked, ${motionModule} and tokens.ts are the only temporal owners; hover guard ${hoverRules}).`
);
