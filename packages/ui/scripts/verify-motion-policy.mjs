#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(packageRoot, "src", "components");

// These two components still own legacy activity utilities. They migrate to the canonical
// activity recipes with the component-wide motion migration; no other exception is allowed.
const activityLegacy = new Map([
  ["Spinner.tsx", ["animate-spin", "animate-none"]],
  ["Skeleton.tsx", ["animate-pulse", "animate-none"]],
]);

// Existing components may continue to consume the temporary `motion` bridge until the migration.
// A new component cannot start on the legacy API. Shrink this set as migration PRs land.
const legacyMotionConsumers = new Set([
  "Alert.tsx",
  "Button.tsx",
  "CodeBlock.tsx",
  "Dialog.tsx",
  "IconButton.tsx",
  "Input.tsx",
  "NavItem.tsx",
  "NumberField.tsx",
  "Search.tsx",
  "Select.tsx",
  "Slider.tsx",
  "Switch.tsx",
  "Table.tsx",
  "Tabs.tsx",
  "Textarea.tsx",
  "Tooltip.tsx",
]);

const rawTemporal = [
  /(?:^|[^\w-])duration-[\w\[.-]+/g,
  /(?:^|[^\w-])ease-[\w\[.-]+/g,
  /(?:^|[^\w-])transition(?:-|\[)[^\s"'`)]*/g,
  /(?:^|[^\w-])animate-[\w\[.-]+/g,
];

const withoutComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const files = (await readdir(componentsDir)).filter((name) => /\.(?:ts|tsx)$/.test(name));
const failures = [];

for (const file of files) {
  // ui.common.ts is the temporary pre-foundation owner. It remains untouched until the migration
  // so this infrastructure PR has zero component/style output. No new code may copy from it.
  if (file === "ui.motion.ts" || file === "ui.common.ts") continue;

  const source = withoutComments(await readFile(join(componentsDir, file), "utf8"));
  const allowedActivity = activityLegacy.get(file) ?? [];

  for (const pattern of rawTemporal) {
    for (const match of source.matchAll(pattern)) {
      const token = match[0].trim();
      if (allowedActivity.some((allowed) => token.includes(allowed))) continue;
      failures.push(`${file}: raw temporal utility ${JSON.stringify(token)}`);
    }
  }

  const usesLegacyMotion = /\bmotion\s*[,.}]|\bmotion\./.test(source);
  if (usesLegacyMotion && !legacyMotionConsumers.has(file)) {
    failures.push(`${file}: new code may not consume the legacy \`motion\` object; import a semantic leaf recipe from ui.motion.ts`);
  }
}

if (failures.length > 0) {
  console.error("Motion policy violations:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("\nMotion timing/easing/transition ownership belongs to src/components/ui.motion.ts.");
  process.exit(1);
}

console.log(`Motion policy passed (${files.length} component modules checked).`);
