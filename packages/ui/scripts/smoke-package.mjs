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
  "Accordion",
  "Alert",
  "AlertDialog",
  "Avatar",
  "Badge",
  "Button",
  "Card",
  "Checkbox",
  "Chip",
  "ChipGroup",
  "Collapsible",
  "Combobox",
  "Dialog",
  "Divider",
  "Drawer",
  "Field",
  "IconButton",
  "Input",
  "Menu",
  "NavGroup",
  "NavItem",
  "NumberField",
  "Popover",
  "Progress",
  "RadioGroup",
  "Search",
  "SegmentedControl",
  "Select",
  "Skeleton",
  "Slider",
  "Spinner",
  "Switch",
  "Table",
  "Tabs",
  "ToggleGroup",
  "Textarea",
  "ToastProvider",
  "ToastViewport",
  "Tooltip",
  "createToastManager",
  "useToast",
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
  "AccordionProps",
  "AccordionHeadingLevel",
  "CollapsibleProps",
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
  "ChipProps",
  "ChipGroupProps",
  "ToggleGroupProps",
  "ToggleGroupItemProps",
  "SegmentedControlProps",
  "SegmentedControlOption",
  "ProgressProps",
  "DrawerProps",
  "DrawerSide",
  "ToastProviderProps",
  "ToastViewportProps",
  "ToastOptions",
  "ToastType",
  "ToastPosition",
  "ToastManager",
  "ToastActionOptions",
  "ToastUpdateOptions",
  "ToastPromiseOptions",
]) {
  assert.ok(declarations.includes(propType), `declarations should expose ${propType}`);
}

const buttonModule = await readFile(new URL("../dist/esm/components/Button.js", import.meta.url), "utf8");
const cardModule = await readFile(new URL("../dist/esm/components/Card.js", import.meta.url), "utf8");
const drawerModule = await readFile(new URL("../dist/esm/components/Drawer.js", import.meta.url), "utf8");
assert.match(buttonModule, /^\s*["']use client["'];/, "interactive modules must preserve their client boundary");
assert.match(drawerModule, /^\s*["']use client["'];/, "interactive modules must preserve their client boundary");
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
  "--sui-duration-activity",
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
assert.match(stylesCss, /:where\(\.sui-scope\)\s*\{/,
  "Tailwind runtime plumbing must initialize only explicitly owned nodes");

/* ---------------------------------------------------------------------------------------------
   Contrast contract.

   Every pairing the design language requires to be readable is measured from the published token
   values, in both themes: text against each surface a component composites over, a tinted control's
   label against its own tint, a filled control's on-colour against its fill, and the focus
   indicator against every surface. WCAG AA asks 4.5:1 of text and 3:1 of the parts of a control
   that identify it.

   The automated axe scan cannot cover all of this: it does not evaluate `::placeholder` text, and
   a node it cannot measure is a node a regression can hide in. What it *does* cover is checked in
   the browser suite; what can be checked deterministically is checked here, against the artifact
   the package actually publishes.

   The authored palette does not meet the text requirement for the pairs in `recordedContrastGaps`
   yet. That gap is recorded in `docs/DESIGN_LANGUAGE.md` §14 and `docs/RELEASE.md`, and closing it
   is a palette decision rather than a component defect, so exactly those entries are allowed and
   nothing else. The record is exact in both directions: a new failing pair fails this check, and a
   pair that starts passing fails it too, so it cannot outlive the gap it describes. Delete it whole
   when the palette lands.
   --------------------------------------------------------------------------------------------- */
const oklchChannels = (value) => {
  const [lightness, chroma, hue] = value.split(/\s+/).map(Number);
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};
/** A token value as an encoded sRGB triple, which is the space a browser composites in. */
const encodedColor = (value) =>
  oklchChannels(value).map((channel) => {
    const encoded = channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.max(channel, 0) ** (1 / 2.4) - 0.055;
    return Math.min(1, Math.max(0, encoded));
  });
const relativeLuminance = ([red, green, blue]) => {
  const linear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
};
const contrastRatio = (foreground, background) => {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};
/** A translucent fill composited over the surface it sits on. */
const composited = (top, alpha, bottom) => top.map((channel, index) => channel * alpha + bottom[index] * (1 - alpha));

const contrastSurfaces = (variables) => {
  const token = (name) => encodedColor(variables[`--sui-${name}`]);
  const canvas = token("canvas");
  const surface = token("surface");
  const high = token("surface-high");
  const float = token("surface-float");
  return {
    canvas,
    "surface 0.42": composited(surface, 0.42, canvas),
    "surface 0.78": composited(surface, 0.78, canvas),
    "surface-high 0.56": composited(high, 0.56, canvas),
    "surface-high 0.66": composited(high, 0.66, canvas),
    "surface-high 0.72": composited(high, 0.72, canvas),
    "surface-high 0.82": composited(high, 0.82, canvas),
    "surface-high 0.90": composited(high, 0.9, canvas),
    "surface-float 0.86": composited(float, 0.86, canvas),
    "surface-float 0.90": composited(float, 0.9, canvas),
    "surface-overlay 0.90": composited(token("surface-overlay"), 0.9, canvas),
  };
};

const measureContrast = (variables) => {
  const token = (name) => encodedColor(variables[`--sui-${name}`]);
  const surfaces = Object.entries(contrastSurfaces(variables));
  const nestedAndEngaged = surfaces.filter(([name]) => /surface-high 0\.(56|66|72|82|90)/.test(name));
  const tinted = (name, alpha) => surfaces.map(([surface, base]) => [surface, composited(token(name), alpha, base)]);

  const pairs = [
    ["text.high on every authored surface", 4.5, surfaces.map(([where, bg]) => [where, token("ink"), bg])],
    ["text.medium on every authored surface", 4.5, surfaces.map(([where, bg]) => [where, token("ink-muted"), bg])],
    ["text.low on every authored surface", 4.5, surfaces.map(([where, bg]) => [where, token("ink-faint"), bg])],
    ["tone.text.primary on tone.tonal.primary", 4.5, tinted("primary", 0.12).map(([where, bg]) => [where, token("primary"), bg])],
    ["tone.text.danger on tone.soft.danger", 4.5, tinted("danger", 0.09).map(([where, bg]) => [where, token("danger"), bg])],
    ["tone.text.warning on tone.soft.warning", 4.5, tinted("warning", 0.09).map(([where, bg]) => [where, token("warning"), bg])],
    ["tone.text.success on tone.soft.success", 4.5, tinted("success", 0.09).map(([where, bg]) => [where, token("success"), bg])],
    [
      "semantic copy in a nested or engaged field",
      4.5,
      nestedAndEngaged.flatMap(([where, bg]) =>
        ["danger", "warning", "success"].map((role) => [`${role} on ${where}`, token(role), bg])
      ),
    ],
    ["the selected mark on tone.selected.primary", 3, tinted("primary", 0.22).map(([where, bg]) => [where, token("primary"), bg])],
    [
      "an on-colour on its strong fill",
      4.5,
      [
        ["primary", "primary-strong"],
        ["danger", "danger"],
        ["warning", "warning"],
        ["success", "success"],
      ].map(([role, fill]) => [`on-${role} on ${fill}`, token(`on-${role}`), token(fill)]),
    ],
    [
      "the error placeholder on the invalid field",
      4.5,
      ["canvas", "surface 0.78"].flatMap((base) =>
        [0.075, 0.13].map((alpha) => [
          `danger on its ${alpha} fill over ${base}`,
          token("danger"),
          composited(token("danger"), alpha, contrastSurfaces(variables)[base]),
        ])
      ),
    ],
    ["the focus indicator on every authored surface", 3, surfaces.map(([where, bg]) => [where, token("focus"), bg])],
  ];

  return pairs.map(([name, target, checks]) => {
    const worst = checks.reduce(
      (lowest, [where, foreground, background]) => {
        const ratio = contrastRatio(foreground, background);
        return ratio < lowest.ratio ? { ratio, where } : lowest;
      },
      { ratio: Number.POSITIVE_INFINITY, where: "" }
    );
    return { name, target, ratio: worst.ratio, where: worst.where, pass: worst.ratio >= target };
  });
};

const recordedContrastGaps = [
  "dark:text.low on every authored surface",
  "light:semantic copy in a nested or engaged field",
  "light:text.low on every authored surface",
  "light:the error placeholder on the invalid field",
  "light:tone.text.danger on tone.soft.danger",
  "light:tone.text.primary on tone.tonal.primary",
  "light:tone.text.success on tone.soft.success",
  "light:tone.text.warning on tone.soft.warning",
];

const measuredContrast = [
  ...measureContrast(lightVariables).map((pair) => ({ theme: "light", ...pair })),
  ...measureContrast(darkVariables).map((pair) => ({ theme: "dark", ...pair })),
];
assert.deepEqual(
  measuredContrast.filter((pair) => !pair.pass).map((pair) => `${pair.theme}:${pair.name}`).sort(),
  [...recordedContrastGaps].sort(),
  `contrast against the published tokens:\n${measuredContrast
    .map(
      (pair) =>
        `  ${pair.pass ? "ok  " : "FAIL"} ${pair.theme}:${pair.name} — ${pair.ratio.toFixed(2)}:1 on ${pair.where} (target ${pair.target})`
    )
    .join("\n")}`
);

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

/* The composition-shaped surfaces take their parts as children rather than as props, so each one
   is assembled once here: a disclosure group, a sheet and the toast stack. All three render
   nothing portable on the server — a portal and a measured panel are client facts — so what
   this proves is that composing them is safe to render there at all. */
const serverCompositions = [
  [
    "Accordion",
    React.createElement(
      library.Accordion,
      { defaultValue: ["a"] },
      React.createElement(
        library.Accordion.Item,
        { value: "a" },
        React.createElement(library.Accordion.Trigger, null, "Section"),
        React.createElement(library.Accordion.Panel, null, "Content")
      )
    ),
  ],
  [
    "Collapsible",
    React.createElement(
      library.Collapsible,
      { defaultOpen: true },
      React.createElement(library.Collapsible.Trigger, null, "Details"),
      React.createElement(library.Collapsible.Panel, null, "Content")
    ),
  ],
  [
    "Drawer",
    React.createElement(
      library.Drawer,
      { open: true, onOpenChange() {} },
      React.createElement(
        library.Drawer.Content,
        null,
        React.createElement(library.Drawer.Header, null, "Sheet")
      )
    ),
  ],
  [
    "ToastProvider",
    React.createElement(
      library.ToastProvider,
      null,
      React.createElement(library.ToastViewport)
    ),
  ],
];
for (const [componentName, element] of serverCompositions) {
  assert.doesNotThrow(
    () => renderToStaticMarkup(element),
    `${componentName} must render on the server`
  );
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
