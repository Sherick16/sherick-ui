import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const library = await import("../dist/esm/index.js");
const esm = await readFile(new URL("../dist/esm/index.js", import.meta.url), "utf8");
const declarations = await readFile(new URL("../dist/types/index.d.ts", import.meta.url), "utf8");
const stylesCss = await readFile(new URL("../dist/styles.css", import.meta.url), "utf8");
const themeCss = await readFile(new URL("../dist/theme.css", import.meta.url), "utf8");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

for (const exportName of [
  "ActionButton",
  "Avatar",
  "Button",
  "Dialog",
  "Dropdown",
  "Input",
  "Modal",
  "Search",
  "Select",
  "Switch",
  "Tabs",
  "TabGroup",
  "Tooltip",
]) {
  assert.ok(library[exportName], `missing public export: ${exportName}`);
}

assert.ok(!esm.includes("next/image"), "bundle must not depend on next/image");
assert.ok(!esm.includes("next/link"), "bundle must not depend on next/link");
assert.ok(!esm.includes("@/"), "bundle must not contain unresolved source aliases");
assert.ok(declarations.includes("ButtonProps"), "declarations should expose Button props");
assert.ok(declarations.includes("SelectProps"), "declarations should expose Select props");

const buttonModule = await readFile(new URL("../dist/esm/components/Button.js", import.meta.url), "utf8");
const cardModule = await readFile(new URL("../dist/esm/components/Card.js", import.meta.url), "utf8");
assert.match(buttonModule, /^\s*["']use client["'];/, "interactive modules must preserve their client boundary");
assert.doesNotMatch(cardModule, /^\s*["']use client["'];/, "passive modules must remain server-usable");
assert.doesNotMatch(esm, /^\s*["']use client["'];/, "the package barrel must not blanket the package as client-only");

assert.equal(packageJson.style, "dist/styles.css");
assert.equal(packageJson.exports["./styles.css"], "./dist/styles.css");
assert.equal(packageJson.exports["./theme.css"], "./dist/theme.css");
assert.equal(packageJson.exports["./tailwind-preset"], undefined, "Tailwind preset must not remain public");
assert.equal(packageJson.peerDependencies.tailwindcss, undefined, "Tailwind must not remain a consumer peer");
assert.deepEqual(packageJson.files, ["dist"], "the package should publish only finished artifacts");
assert.ok(packageJson.sideEffects.includes("./dist/styles.css"));
assert.ok(packageJson.sideEffects.includes("./dist/theme.css"));

const themeRoot = postcss.parse(themeCss);
const variablesForSelector = (selector) => {
  const variables = {};
  themeRoot.walkRules((rule) => {
    if (rule.selector !== selector) return;
    rule.walkDecls(/^--sui-/, (declaration) => {
      variables[declaration.prop] = declaration.value.replace(/\s+/g, " ").trim();
    });
  });
  return variables;
};

const lightVariables = variablesForSelector('[data-sherick-theme="light"]');
const darkVariables = variablesForSelector('[data-sherick-theme="dark"]');
const systemDarkVariables = variablesForSelector(':root:not([data-sherick-theme])');
const sharedVariables = variablesForSelector(":root");

for (const token of [
  "--sui-canvas",
  "--sui-surface",
  "--sui-surface-high",
  "--sui-surface-float",
  "--sui-surface-overlay",
  "--sui-ink",
  "--sui-ink-muted",
  "--sui-primary",
  "--sui-primary-strong",
  "--sui-danger",
  "--sui-warning",
  "--sui-success",
  "--sui-on-primary",
  "--sui-on-danger",
  "--sui-on-warning",
  "--sui-on-success",
  "--sui-focus",
  "--sui-edge",
  "--sui-elevation-raised",
  "--sui-elevation-floating",
  "--sui-elevation-control",
  "--sui-elevation-recessed",
  "--sui-glass-gradient",
  "--sui-code-text",
]) {
  assert.ok(lightVariables[token], `light theme missing ${token}`);
  assert.ok(darkVariables[token], `dark theme missing ${token}`);
  assert.ok(systemDarkVariables[token], `system dark theme missing ${token}`);
}

assert.deepEqual(systemDarkVariables, darkVariables, "system dark must be generated from the canonical dark token set");
for (const token of [
  "--sui-duration-press",
  "--sui-duration-release",
  "--sui-duration-overlay",
  "--sui-duration-overlay-exit",
  "--sui-ease-press",
  "--sui-ease-release",
  "--sui-ease-exit",
]) {
  assert.ok(sharedVariables[token], `shared theme missing ${token}`);
}

assert.doesNotMatch(themeCss, /--sui-elevation-grounded|--sui-shadow-focus|--sui-shadow-primary/, "pre-alpha compatibility token aliases should be gone");
assert.match(stylesCss, /@layer sherick-ui-theme, sherick-ui/);
assert.match(stylesCss, /\.sui-scope/);
assert.match(stylesCss, /@font-face/);
assert.match(stylesCss, /KaTeX_Main-Regular/);
assert.match(stylesCss, /@media \(forced-colors: active\)/);

const stylesRoot = postcss.parse(stylesCss);
const isInKeyframes = (rule) => {
  let parent = rule.parent;
  while (parent) {
    if (parent.type === "atrule" && /keyframes$/i.test(parent.name)) return true;
    parent = parent.parent;
  }
  return false;
};
const layerFor = (rule) => {
  let parent = rule.parent;
  while (parent) {
    if (parent.type === "atrule" && parent.name === "layer") return parent.params;
    parent = parent.parent;
  }
  return null;
};

stylesRoot.walkDecls((declaration) => {
  assert.equal(declaration.important, false, `published CSS may not use !important: ${declaration.toString()}`);
});

stylesRoot.walkRules((rule) => {
  if (isInKeyframes(rule)) return;
  const layer = layerFor(rule);
  if (layer === "sherick-ui-theme") return;
  assert.match(
    rule.selector,
    /:where\(\.sui-scope,\s*\.sui-scope \*\)/,
    `component/accessibility selector escaped Sherick scope: ${rule.selector}`
  );
});

for (const forbidden of [
  /(^|})\s*\*\s*\{/,
  /(^|})\s*button\s*\{/,
  /(^|})\s*input\s*\{/,
  /(^|})\s*textarea\s*\{/,
  /(^|})\s*html\s*\{/,
  /(^|})\s*body\s*\{/,
]) {
  assert.doesNotMatch(stylesCss, forbidden, "styles.css must not ship a reset/preflight selector");
}

const buttonMarkup = renderToStaticMarkup(React.createElement(library.Button, null, "Save"));
assert.match(buttonMarkup, /sui-scope/, "component roots must establish the Sherick style scope");
const inputMarkup = renderToStaticMarkup(
  React.createElement(library.Input, { label: "Email", required: true, name: "email" })
);
assert.match(inputMarkup, /sui-scope/);
assert.match(inputMarkup, /<label[^>]*\sfor=/);
assert.match(inputMarkup, /required=""/);

const rawNeutralUtilities = [];
const rawLiteralColors = [];
const rawShadowUtilities = [];

async function scanDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scanDirectory(path);
      continue;
    }
    if (![".ts", ".tsx"].includes(extname(entry.name))) continue;
    const source = await readFile(path, "utf8");
    if (/\b(?:bg|text|border|ring)-(?:slate|gray|zinc|neutral|stone)-/.test(source)) rawNeutralUtilities.push(path);
    if (/(?:#[0-9a-fA-F]{3,8}\b|\brgb\(|\bhsl\()/g.test(source) && !path.endsWith("prism-theme.ts")) rawLiteralColors.push(path);
    if (/\bshadow-(?!sherick-)(?:sm|md|lg|xl|2xl|inner|\[)/.test(source)) rawShadowUtilities.push(path);
  }
}
await scanDirectory(join(packageRoot, "src", "components"));
assert.deepEqual(rawNeutralUtilities, [], `raw neutral utilities found: ${rawNeutralUtilities.join(", ")}`);
assert.deepEqual(rawLiteralColors, [], `literal colors found outside prism theme: ${rawLiteralColors.join(", ")}`);
assert.deepEqual(rawShadowUtilities, [], `raw Tailwind shadows found: ${rawShadowUtilities.join(", ")}`);

console.log("Package and scoped styling verification passed.");
