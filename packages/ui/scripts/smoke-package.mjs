import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import selectorParser from "postcss-selector-parser";
import postcss from "postcss";
import ts from "typescript";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const library = await import("../dist/esm/index.js");
const content = await import("../dist/esm/content.js");
const esm = await readFile(new URL("../dist/esm/index.js", import.meta.url), "utf8");
const declarations = await readFile(new URL("../dist/types/index.d.ts", import.meta.url), "utf8");
const contentDeclarations = await readFile(new URL("../dist/types/content.d.ts", import.meta.url), "utf8");
const stylesCss = await readFile(new URL("../dist/styles.css", import.meta.url), "utf8");
const themeCss = await readFile(new URL("../dist/theme.css", import.meta.url), "utf8");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

for (const exportName of [
  "Alert",
  "AlertDialog",
  "Avatar",
  "Badge",
  "Button",
  "Card",
  "Checkbox",
  "Combobox",
  "Dialog",
  "Divider",
  "Field",
  "IconButton",
  "Input",
  "Menu",
  "NavGroup",
  "NavItem",
  "NumberField",
  "Popover",
  "RadioGroup",
  "Search",
  "Select",
  "Skeleton",
  "Slider",
  "Spinner",
  "Switch",
  "Table",
  "Tabs",
  "Textarea",
  "Tooltip",
]) {
  assert.ok(library[exportName], `missing public export: ${exportName}`);
}

for (const removed of [
  "ActionButton",
  "Dropdown",
  "Modal",
  "TabGroup",
  "Markdown",
  "CodeBlock",
]) {
  assert.equal(library[removed], undefined, `${removed} must not remain on the root barrel`);
}

for (const exportName of ["Markdown", "CodeBlock"]) {
  assert.ok(content[exportName], `missing content export: ${exportName}`);
}
assert.ok(contentDeclarations.includes("MarkdownProps"), "content declarations should expose Markdown props");

assert.ok(!esm.includes("next/image"), "bundle must not depend on next/image");
assert.ok(!esm.includes("next/link"), "bundle must not depend on next/link");
assert.ok(!esm.includes("@/"), "bundle must not contain unresolved source aliases");
assert.ok(declarations.includes("ButtonProps"), "declarations should expose Button props");
assert.ok(declarations.includes("SelectProps"), "declarations should expose Select props");
for (const propType of [
  "FieldProps",
  "CheckboxProps",
  "RadioGroupProps",
  "RadioGroupOption",
  "SliderProps",
  "NumberFieldProps",
  "AlertDialogProps",
  "PopoverProps",
  "MenuProps",
  "MenuItemProps",
  "ComboboxProps",
  "ComboboxOption",
]) {
  assert.ok(declarations.includes(propType), `declarations should expose ${propType}`);
}

const buttonModule = await readFile(new URL("../dist/esm/components/Button.js", import.meta.url), "utf8");
const cardModule = await readFile(new URL("../dist/esm/components/Card.js", import.meta.url), "utf8");
assert.match(buttonModule, /^\s*["']use client["'];/, "interactive modules must preserve their client boundary");
assert.doesNotMatch(cardModule, /^\s*["']use client["'];/, "passive modules must remain server-usable");
assert.doesNotMatch(esm, /^\s*["']use client["'];/, "the package barrel must not blanket the package as client-only");

assert.equal(packageJson.style, "dist/styles.css");
assert.equal(packageJson.exports["./styles.css"], "./dist/styles.css");
assert.equal(packageJson.exports["./theme.css"], "./dist/theme.css");
assert.equal(packageJson.exports["./content"].import, "./dist/esm/content.js");
assert.equal(packageJson.exports["./content"].types, "./dist/types/content.d.ts");
assert.equal(
  packageJson.exports["./content"].require,
  undefined,
  "the ESM-only content subpath must not advertise a require entry"
);
assert.equal(packageJson.exports["./tailwind-preset"], undefined, "Tailwind preset must not remain public");
assert.equal(packageJson.peerDependencies.tailwindcss, undefined, "Tailwind must not remain a consumer peer");
assert.deepEqual(packageJson.files, ["dist"], "the package should publish only finished artifacts");
assert.ok(packageJson.sideEffects.includes("./dist/styles.css"));
assert.ok(packageJson.sideEffects.includes("./dist/theme.css"));

const themeRoot = postcss.parse(themeCss);
const collectVariables = (matches) => {
  const variables = {};
  themeRoot.walkRules((rule) => {
    if (!matches(rule)) return;
    rule.walkDecls(/^--sui-/, (declaration) => {
      variables[declaration.prop] = declaration.value.replace(/\s+/g, " ").trim();
    });
  });
  return variables;
};
const selectorParts = (rule) => rule.selector.split(",").map((selector) => selector.trim());
const variablesForSelector = (selector) =>
  collectVariables((rule) => selectorParts(rule).includes(selector));
const variablesForExactSelector = (selector) =>
  collectVariables((rule) => rule.selector.trim() === selector);

const lightVariables = variablesForSelector('[data-sherick-theme="light"]');
const darkVariables = variablesForExactSelector('[data-sherick-theme="dark"]');
const systemDarkVariables = variablesForExactSelector(':root:not([data-sherick-theme])');
const sharedVariables = variablesForExactSelector(":root");

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
  "--sui-glass-fill",
  "--sui-glass-dense-fill",
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
assert.match(stylesCss, /@layer sherick-ui-theme/);
assert.match(stylesCss, /\.sui-scope/);
assert.match(stylesCss, /@font-face/);
assert.match(stylesCss, /KaTeX_Main-Regular/);
assert.match(stylesCss, /@media \(forced-colors: active\)/);
assert.match(stylesCss, /:where\(\.sui-scope\)\s*\{/,
  "Tailwind runtime plumbing must initialize only explicitly owned nodes");

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

stylesRoot.walkAtRules("layer", (rule) => {
  assert.notEqual(
    rule.params.trim(),
    "sherick-ui",
    "component CSS must stay unlayered so host resets/preflight cannot outrank it"
  );
});

stylesRoot.walkDecls((declaration) => {
  assert.ok(!declaration.important, `published CSS may not use !important: ${declaration.toString()}`);
});

stylesRoot.walkRules((rule) => {
  if (isInKeyframes(rule)) return;
  const layer = layerFor(rule);
  if (layer === "sherick-ui-theme") return;
  assert.match(
    rule.selector,
    /:where\(\.sui-scope(?:,\s*\.sui-scope \*)?\)/,
    `component/accessibility selector escaped Sherick scope: ${rule.selector}`
  );
});

// Generic Tailwind utilities may never use descendant ownership. Consumer children can
// legally sit inside Button/Card/etc. and must not become styled merely by ancestry.
for (const dangerousUtility of [
  "absolute",
  "relative",
  "flex",
  "text-sm",
  "px-6",
  "rounded-full",
  "shadow-sherick-raised",
  "shadow-sherick-recessed",
]) {
  const rules = [];
  stylesRoot.walkRules((rule) => {
    if (rule.selector.includes(dangerousUtility)) rules.push(rule);
  });
  assert.ok(rules.length > 0, `published CSS is missing ownership sentinel utility: ${dangerousUtility}`);
  for (const rule of rules) {
    assert.doesNotMatch(
      rule.selector,
      /:where\(\.sui-scope,\s*\.sui-scope \*\)/,
      `generic utility may not style unowned descendants: ${rule.selector}`
    );
    assert.match(
      rule.selector,
      /:where\(\.sui-scope\)/,
      `generic utility must require explicit ownership: ${rule.selector}`
    );
  }
}

for (const criticalUtility of [
  "shadow-sherick-raised",
  "shadow-sherick-floating",
  "shadow-sherick-control",
  "shadow-sherick-recessed",
  "border-sherick-edge",
]) {
  const rules = [];
  stylesRoot.walkRules((rule) => {
    if (rule.selector.includes(criticalUtility)) rules.push(rule);
  });
  assert.ok(rules.length > 0, `published CSS is missing critical visual utility: ${criticalUtility}`);
  for (const rule of rules) {
    assert.equal(
      layerFor(rule),
      null,
      `${criticalUtility} must remain unlayered so host CSS cannot erase its visual role`
    );
  }
}

/* Every class name an authored recipe produces has to have a rule in the published stylesheet.
   The stylesheet compiler reads class names as literal text, so a name that only exists once
   the recipe is evaluated compiles to nothing and that step of the recipe silently disappears —
   which is how every state layer once shipped without its hover rule, leaving every hover tint
   in the library inert. This walks the published recipes and the published CSS, so the two
   cannot disagree without failing here. */
const styledClassNames = new Set();
stylesRoot.walkRules((rule) => {
  if (isInKeyframes(rule)) return;
  selectorParser((selectors) => {
    selectors.walkClasses((node) => styledClassNames.add(node.value));
  }).processSync(rule.selector);
});

const devRecipes = await import("../dist/esm/dev.js");
const missingRecipeClasses = [];
const checkRecipe = (path, value) => {
  if (typeof value !== "string") return;
  for (const className of value.split(/\s+/).filter(Boolean)) {
    if (!styledClassNames.has(className)) missingRecipeClasses.push(`${path} → ${className}`);
  }
};
for (const [name, value] of Object.entries(devRecipes)) {
  if (typeof value === "string") {
    checkRecipe(name, value);
    continue;
  }
  if (value === null || typeof value !== "object") continue;
  for (const [group, nested] of Object.entries(value)) {
    if (typeof nested === "string") checkRecipe(`${name}.${group}`, nested);
    else if (nested !== null && typeof nested === "object") {
      for (const [entry, recipe] of Object.entries(nested)) checkRecipe(`${name}.${group}.${entry}`, recipe);
    }
  }
}
assert.deepEqual(
  missingRecipeClasses,
  [],
  `published recipes render classes that styles.css has no rule for:\n  ${missingRecipeClasses.join("\n  ")}`
);

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
assert.match(inputMarkup, /required=""/);

/* Base's popup portal renders nothing on the server, so server rendering proves only that a
   floating surface is safe to render there. The scope of a portaled subtree is asserted where
   the portal actually exists: the browser suites.
*/
const serverSurfaces = [
  ["AlertDialog", { defaultOpen: true, title: "Delete project?", confirmLabel: "Delete" }],
  ["Popover", { defaultOpen: true }],
  ["Menu", { defaultOpen: true }],
  ["Combobox", { options: [{ label: "Design system", value: "design" }] }],
];
for (const [componentName, props] of serverSurfaces) {
  for (const open of [false, true]) {
    assert.doesNotThrow(
      () => renderToStaticMarkup(React.createElement(library[componentName], { ...props, open, onOpenChange() {} })),
      `${componentName} must render on the server`
    );
  }
}

const rawNeutralUtilities = [];
const rawLiteralColors = [];
const rawShadowUtilities = [];
const unownedClassNames = [];

const expressionUsesCn = (expression) => {
  if (!expression) return false;
  if (
    ts.isCallExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    expression.expression.text === "cn"
  ) return true;

  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
    if (!ts.isBlock(expression.body)) return expressionUsesCn(expression.body);
    const returns = [];
    const visitReturn = (node) => {
      if (ts.isReturnStatement(node) && node.expression) returns.push(node.expression);
      ts.forEachChild(node, visitReturn);
    };
    ts.forEachChild(expression.body, visitReturn);
    return returns.length > 0 && returns.every(expressionUsesCn);
  }

  return false;
};

const verifyClassOwnership = (path, source) => {
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxAttribute(node) && node.name.text === "className" && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) {
        unownedClassNames.push(`${path}:${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
      } else if (
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression &&
        !expressionUsesCn(node.initializer.expression)
      ) {
        unownedClassNames.push(`${path}:${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
};

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
    if (path.endsWith(".tsx")) verifyClassOwnership(path, source);
  }
}
await scanDirectory(join(packageRoot, "src", "components"));
assert.deepEqual(rawNeutralUtilities, [], `raw neutral utilities found: ${rawNeutralUtilities.join(", ")}`);
assert.deepEqual(rawLiteralColors, [], `literal colors found outside prism theme: ${rawLiteralColors.join(", ")}`);
assert.deepEqual(rawShadowUtilities, [], `raw Tailwind shadows found: ${rawShadowUtilities.join(", ")}`);
assert.deepEqual(unownedClassNames, [], `Sherick-styled JSX must route className through cn(): ${unownedClassNames.join(", ")}`);

console.log("Package and explicit style ownership verification passed.");
