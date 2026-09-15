import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import React from "react";
import tailwindcss from "tailwindcss";
import sherickPreset from "../tailwind.preset.cjs";

const library = await import("../dist/index.esm.js");
const esm = await readFile(new URL("../dist/index.esm.js", import.meta.url), "utf8");
const declarations = await readFile(new URL("../dist/index.d.ts", import.meta.url), "utf8");
const themeCss = await readFile(new URL("../theme.css", import.meta.url), "utf8");
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);

for (const exportName of [
  "ActionButton",
  "Avatar",
  "Dropdown",
  "Input",
  "Modal",
  "Search",
  "Switch",
  "TabGroup",
  "Tooltip",
]) {
  assert.ok(library[exportName], `missing public export: ${exportName}`);
}

assert.ok(!esm.includes("next/image"), "bundle must not depend on next/image");
assert.ok(!esm.includes("next/link"), "bundle must not depend on next/link");
assert.ok(!esm.includes("@/"), "bundle must not contain unresolved source aliases");
assert.ok(declarations.includes("ActionButtonProps"), "declarations should expose public component props");

assert.equal(packageJson.exports["./theme.css"], "./theme.css", "theme stylesheet must be exported");
assert.ok(packageJson.files.includes("theme.css"), "theme stylesheet must be published");
assert.ok(packageJson.sideEffects.includes("./theme.css"), "theme stylesheet must be retained as a side effect");
assert.match(themeCss, /\[data-sherick-theme="light"\]/);
assert.match(themeCss, /\[data-sherick-theme="dark"\]/);
assert.match(themeCss, /prefers-color-scheme:\s*dark/);
assert.match(themeCss, /--sui-canvas:/);
assert.match(themeCss, /--sui-glass-gradient:/);
assert.match(themeCss, /--sui-code-text:/);

const tailwindResult = await postcss([
  tailwindcss({
    presets: [sherickPreset],
    content: [
      {
        raw: '<div class="bg-sherick-canvas text-sherick-ink text-sherick-on-warning outline-sherick-focus bg-sherick-glass shadow-sherick-glass"></div>',
        extension: "html",
      },
    ],
    corePlugins: { preflight: false },
  }),
]).process("@tailwind utilities;", { from: undefined });

assert.match(tailwindResult.css, /var\(--sui-canvas/);
assert.match(tailwindResult.css, /var\(--sui-ink/);
assert.match(tailwindResult.css, /var\(--sui-on-warning/);
assert.match(tailwindResult.css, /var\(--sui-focus/);
assert.match(tailwindResult.css, /var\(--sui-glass-gradient/);
assert.match(tailwindResult.css, /var\(--sui-shadow-glass/);

const buttonMarkup = renderToStaticMarkup(
  React.createElement(library.ActionButton, { loading: true }, "Save")
);
assert.match(buttonMarkup, /disabled=""/);
assert.match(buttonMarkup, /aria-busy="true"/);

const inputMarkup = renderToStaticMarkup(
  React.createElement(library.Input, { label: "Email", required: true, name: "email" })
);
assert.match(inputMarkup, /<label for=/);
assert.match(inputMarkup, /required=""/);
assert.match(inputMarkup, /name="email"/);

const avatarMarkup = renderToStaticMarkup(
  React.createElement(library.Avatar, { src: "/avatar.png", alt: "Example avatar" })
);
assert.match(avatarMarkup, /<img/);
assert.match(avatarMarkup, /alt="Example avatar"/);

// Tailwind 3 silently drops numeric opacity modifiers that are not in its default
// opacity scale. Arbitrary percentages must use slash-bracket syntax, e.g. /[0.78].
const validOpacityModifiers = new Set([
  "0",
  "5",
  "10",
  "20",
  "25",
  "30",
  "40",
  "50",
  "60",
  "70",
  "75",
  "80",
  "90",
  "95",
  "100",
]);
const sourceRoot = fileURLToPath(new URL("..", import.meta.url));
const invalidOpacityModifiers = [];
const rawNeutralUtilities = [];

async function scanDirectory(directory, { enforceThemeTokens = false } = {}) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scanDirectory(path, { enforceThemeTokens });
      continue;
    }

    if (![".ts", ".tsx", ".css"].includes(extname(entry.name))) continue;

    const source = await readFile(path, "utf8");
    const opacityPattern = /((?:[a-z-]+:)*(?:bg|text|border|ring|fill|stroke)-[A-Za-z0-9_-]+\/(\d{1,3}))/g;

    for (const match of source.matchAll(opacityPattern)) {
      if (!validOpacityModifiers.has(match[2])) {
        invalidOpacityModifiers.push(`${path.replace(`${sourceRoot}/`, "")}: ${match[1]}`);
      }
    }

    if (enforceThemeTokens) {
      const rawNeutralPattern = /((?:[a-z-]+:)*(?:bg|text|border|ring|outline|fill|stroke)-(?:white|black|gray|grey|zinc|slate|stone|neutral)(?:-[0-9]{2,3})?(?:\/(?:\[[^\]]+\]|\d{1,3}))?)/g;
      for (const match of source.matchAll(rawNeutralPattern)) {
        rawNeutralUtilities.push(`${path.replace(`${sourceRoot}/`, "")}: ${match[1]}`);
      }
    }
  }
}

await scanDirectory(join(sourceRoot, "app"));
await scanDirectory(join(sourceRoot, "components", "UI"), { enforceThemeTokens: true });
assert.deepEqual(
  invalidOpacityModifiers,
  [],
  `unsupported Tailwind opacity modifiers:\n${invalidOpacityModifiers.join("\n")}`
);
assert.deepEqual(
  rawNeutralUtilities,
  [],
  `raw theme-specific neutral utilities found in reusable UI:\n${rawNeutralUtilities.join("\n")}`
);

console.log("Package smoke verification passed.");
