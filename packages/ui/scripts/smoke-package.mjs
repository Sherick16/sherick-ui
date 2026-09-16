import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import React from "react";
import tailwindcss from "tailwindcss";
import sherickPreset from "../tailwind.preset.cjs";

const library = await import("../dist/esm/index.js");
const esm = await readFile(new URL("../dist/esm/index.js", import.meta.url), "utf8");
const declarations = await readFile(new URL("../dist/types/index.d.ts", import.meta.url), "utf8");
const themeCss = await readFile(new URL("../theme.css", import.meta.url), "utf8");
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);

for (const exportName of [
  "ActionButton",
  "Avatar",
  "Dialog",
  "Dropdown",
  "Input",
  "Modal",
  "Search",
  "Select",
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
assert.ok(declarations.includes("SelectProps"), "declarations should expose Select props");

const buttonModule = await readFile(new URL("../dist/esm/components/Button.js", import.meta.url), "utf8");
const cardModule = await readFile(new URL("../dist/esm/components/Card.js", import.meta.url), "utf8");
assert.match(buttonModule, /^\s*["']use client["'];/, "interactive modules must preserve their client boundary");
assert.doesNotMatch(cardModule, /^\s*["']use client["'];/, "passive modules must not become client-only");
assert.doesNotMatch(esm, /^\s*["']use client["'];/, "the package barrel must not blanket the whole package as client-only");

assert.equal(packageJson.exports["./theme.css"], "./theme.css", "theme stylesheet must be exported");
assert.ok(packageJson.files.includes("theme.css"), "theme stylesheet must be published");
assert.ok(packageJson.sideEffects.includes("./theme.css"), "theme stylesheet must be retained as a side effect");
assert.match(themeCss, /\[data-sherick-theme="light"\]/);
assert.match(themeCss, /\[data-sherick-theme="dark"\]/);
assert.match(themeCss, /prefers-color-scheme:\s*dark/);

const themeRoot = postcss.parse(themeCss);
const variablesFor = (predicate) => {
  const variables = {};
  themeRoot.walkRules((rule) => {
    if (!predicate(rule)) return;
    rule.walkDecls(/^--sui-/, (declaration) => {
      variables[declaration.prop] = declaration.value;
    });
  });
  return variables;
};
const normalizeVariables = (variables) =>
  Object.fromEntries(
    Object.entries(variables).map(([name, value]) => [
      name,
      value
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")"),
    ])
  );

const lightVariables = variablesFor(
  (rule) => rule.parent === themeRoot && rule.selector.includes('[data-sherick-theme="light"]')
);
const darkVariables = variablesFor(
  (rule) => rule.parent === themeRoot && rule.selector.trim() === '[data-sherick-theme="dark"]'
);
const systemDarkVariables = variablesFor(
  (rule) => rule.selector.includes(':root:not([data-sherick-theme])')
);
const rootVariables = variablesFor((rule) => rule.selector.trim() === ":root");

for (const token of [
  "--sui-canvas",
  "--sui-surface",
  "--sui-surface-high",
  "--sui-surface-float",
  "--sui-ink",
  "--sui-ink-muted",
  "--sui-ink-faint",
  "--sui-primary",
  "--sui-primary-strong",
  "--sui-primary-soft",
  "--sui-accent",
  "--sui-on-primary",
  "--sui-on-danger",
  "--sui-on-warning",
  "--sui-on-success",
  "--sui-focus",
  "--sui-edge",
  "--sui-light-top",
  "--sui-light-bottom",
  "--sui-scrim",
  "--sui-glass-blur",
  "--sui-glass-saturation",
  "--sui-glass-brightness",
  "--sui-glass-gradient",
  "--sui-glass-gradient-dense",
  "--sui-elevation-flat",
  "--sui-elevation-grounded",
  "--sui-elevation-raised",
  "--sui-elevation-floating",
  "--sui-elevation-control",
  "--sui-elevation-recessed",
  "--sui-elevation-pressed",
  "--sui-shadow-focus",
  "--sui-shadow-primary",
  "--sui-code-text",
]) {
  assert.ok(lightVariables[token], `light theme missing ${token}`);
  assert.ok(darkVariables[token], `dark theme missing ${token}`);
  assert.ok(systemDarkVariables[token], `system dark theme missing ${token}`);
}

// Motion is theme-independent, so its tokens live in a single `:root` block.
for (const token of [
  "--sui-duration-press",
  "--sui-duration-release",
  "--sui-duration-overlay",
  "--sui-duration-overlay-exit",
  "--sui-ease-press",
  "--sui-ease-release",
  "--sui-ease-exit",
]) {
  assert.ok(rootVariables[token], `root missing motion token ${token}`);
  assert.ok(!lightVariables[token], `${token} must not be duplicated per theme`);
  assert.ok(!darkVariables[token], `${token} must not be duplicated per theme`);
}

// Every elevation step derives from the two light-model colors, so a theme that drops one
// silently loses its edge lighting rather than failing loudly.
for (const shadow of ["raised", "floating", "control", "recessed"]) {
  const value = lightVariables[`--sui-elevation-${shadow}`];
  assert.match(value, /var\(--sui-light-bottom\)/, `light --sui-elevation-${shadow} must use the shade token`);
}
assert.match(lightVariables["--sui-elevation-floating"], /var\(--sui-light-top\)/);
assert.match(lightVariables["--sui-elevation-control"], /var\(--sui-light-top\)/);
assert.match(darkVariables["--sui-elevation-recessed"], /var\(--sui-light-top\)/);

// `pressed` is published, so it has to keep resolving — as the same recessed depth.
for (const variables of [lightVariables, darkVariables, systemDarkVariables]) {
  assert.equal(
    variables["--sui-elevation-pressed"],
    "var(--sui-elevation-recessed)",
    "the pressed alias must resolve to the canonical recessed depth"
  );
}

assert.deepEqual(
  normalizeVariables(systemDarkVariables),
  normalizeVariables(darkVariables),
  "forced dark and prefers-color-scheme dark tokens must stay identical"
);

const tailwindResult = await postcss([
  tailwindcss({
    presets: [sherickPreset],
    content: [
      {
        raw: '<div class="bg-sherick-canvas text-sherick-ink/90 text-sherick-ink-faint bg-sherick-surface-high/[0.66] bg-sherick-primary/[0.12] text-sherick-on-warning outline-sherick-focus ring-1 ring-inset ring-sherick-edge/[0.09] bg-sherick-glass bg-sherick-glass-dense shadow-sherick-flat shadow-sherick-grounded shadow-sherick-raised shadow-sherick-focus shadow-sherick-primary shadow-sherick-floating shadow-sherick-control shadow-sherick-recessed active:shadow-sherick-pressed duration-press duration-release ease-press ease-release animate-sherick-overlay-in animate-sherick-overlay-out animate-sherick-scrim-in animate-sherick-scrim-out backdrop-blur-[var(--sui-glass-blur,32px)] backdrop-saturate-[var(--sui-glass-saturation,1.45)] backdrop-brightness-[var(--sui-glass-brightness,1.04)]"></div>',
        extension: "html",
      },
    ],
    corePlugins: { preflight: false },
  }),
]).process("@tailwind utilities;", { from: undefined });

assert.match(tailwindResult.css, /var\(--sui-canvas/);
assert.match(tailwindResult.css, /var\(--sui-ink/);
assert.match(tailwindResult.css, /var\(--sui-ink-faint/);
assert.match(tailwindResult.css, /var\(--sui-surface-high/);
assert.match(tailwindResult.css, /var\(--sui-primary/);
assert.match(tailwindResult.css, /var\(--sui-on-warning/);
assert.match(tailwindResult.css, /var\(--sui-focus/);
assert.match(tailwindResult.css, /var\(--sui-edge/);
assert.match(tailwindResult.css, /var\(--sui-glass-gradient/);
assert.match(tailwindResult.css, /var\(--sui-glass-gradient-dense/);
assert.match(tailwindResult.css, /var\(--sui-elevation-flat/);
// Published 1.0.x utilities: an existing consumer's markup must keep its styling.
assert.match(tailwindResult.css, /var\(--sui-elevation-grounded/);
assert.match(tailwindResult.css, /var\(--sui-shadow-focus/);
assert.match(tailwindResult.css, /var\(--sui-shadow-primary/);
assert.match(tailwindResult.css, /var\(--sui-elevation-raised/);
assert.match(tailwindResult.css, /var\(--sui-elevation-floating/);
assert.match(tailwindResult.css, /var\(--sui-elevation-control/);
assert.match(tailwindResult.css, /var\(--sui-elevation-recessed/);
assert.match(tailwindResult.css, /var\(--sui-elevation-pressed/);
assert.match(tailwindResult.css, /var\(--sui-glass-blur/);
assert.match(tailwindResult.css, /var\(--sui-glass-saturation/);
assert.match(tailwindResult.css, /var\(--sui-glass-brightness/);
// The three motion families must reach the stylesheet as tokens, not as literals.
assert.match(tailwindResult.css, /var\(--sui-duration-press/);
assert.match(tailwindResult.css, /var\(--sui-duration-release/);
assert.match(tailwindResult.css, /var\(--sui-ease-press/);
assert.match(tailwindResult.css, /var\(--sui-ease-release/);
assert.match(tailwindResult.css, /@keyframes sherick-overlay-out/);
assert.match(tailwindResult.css, /@keyframes sherick-scrim-out/);

const buttonMarkup = renderToStaticMarkup(
  React.createElement(library.ActionButton, { loading: true }, "Save")
);
assert.match(buttonMarkup, /disabled=""/);
assert.match(buttonMarkup, /aria-busy="true"/);

const inputMarkup = renderToStaticMarkup(
  React.createElement(library.Input, { label: "Email", required: true, name: "email" })
);
assert.match(inputMarkup, /<label[^>]*\sfor=/);
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
const rawLiteralColors = [];
const unsafeFocusUtilities = [];
const rawShadowUtilities = [];

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

      if (entry.name !== "prism-theme.ts") {
        const literalColorPattern = /(?:#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?|hsl|oklab|oklch)\()/g;
        for (const match of source.matchAll(literalColorPattern)) {
          rawLiteralColors.push(`${path.replace(`${sourceRoot}/`, "")}: ${match[0]}`);
        }
      }

      const unsafeFocusPattern = /((?:group-)?focus(?:-visible|-within)?:(?:ring|outline)-sherick-primary|(?:group-)?focus(?:-visible|-within)?:ring-offset-sherick-canvas)/g;
      for (const match of source.matchAll(unsafeFocusPattern)) {
        unsafeFocusUtilities.push(`${path.replace(`${sourceRoot}/`, "")}: ${match[1]}`);
      }

      // Depth comes from the elevation ladder and nothing else. A one-off Tailwind
      // shadow step in reusable UI means a component invented its own elevation.
      const rawShadowPattern = /((?:[a-z-]+:)*shadow-(?:sm|md|lg|xl|2xl|inner)\b)/g;
      for (const match of source.matchAll(rawShadowPattern)) {
        rawShadowUtilities.push(`${path.replace(`${sourceRoot}/`, "")}: ${match[1]}`);
      }
    }
  }
}

await scanDirectory(join(sourceRoot, "src", "components"), { enforceThemeTokens: true });
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
assert.deepEqual(
  rawLiteralColors,
  [],
  `raw literal colors found in reusable UI:\n${rawLiteralColors.join("\n")}`
);
assert.deepEqual(
  unsafeFocusUtilities,
  [],
  `theme-unsafe focus utilities found in reusable UI:\n${unsafeFocusUtilities.join("\n")}`
);
assert.deepEqual(
  rawShadowUtilities,
  [],
  `one-off shadow recipes found in reusable UI:\n${rawShadowUtilities.join("\n")}`
);

console.log("Package smoke verification passed.");
