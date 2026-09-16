#!/usr/bin/env node
/*
 Visual regression gate
 ======================
 A token refactor can quietly restyle the entire library: every component keeps
 working, every type still checks, and the only symptom is that the product looks
 different. This script makes that visible to CI by pinning three things that
 together define what the library looks like:

   1. tokens      every `--sui-*` value in every theme block of theme.css
   2. utilities   what each Tailwind utility the components use actually resolves to
   3. specimens   the exact class recipe each component applies, per variant/state

 Specimens are server-rendered, so a recipe is captured as the set of utilities the
 component applies — including every stateful one (`hover:`, `active:`, `disabled:`,
 `focus-visible:`) — plus its structure, roles and aria attributes. That covers rest,
 hover, pressed, selected, disabled and focus without a browser, which keeps the gate
 deterministic across machines and free of pixel anti-aliasing flake.

 `Modal` portals its open shell in the browser, so this deterministic pass snapshots its
 Header/Content/Footer parts inside the Base Dialog root context they require. The actual
 portal, focus and popup lifecycle remain browser concerns rather than being simulated by
 this source-level gate.

 The open overlay recipes (menu, tooltip, dialog) only exist while an overlay is open,
 so no closed-state render can reach them and a portal cannot be server-rendered. They
 are owned once, as data, by `overlay` in the primitives module, and pinned here from
 source — which is why this script runs under Bun (it can import the TypeScript module
 directly) and why those recipes are snapshotted as data rather than as markup.

 Usage:
   bun scripts/visual-regression.mjs             check against the baseline
   bun scripts/visual-regression.mjs --update    rewrite the baseline
   bun scripts/visual-regression.mjs --preview   also write .visual/preview.html
*/

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import tailwindcss from "tailwindcss";
import preset from "../tailwind.preset.cjs";
/* Source import: the primitives module is TypeScript and is not part of the published
   entry point, and these recipes are internal data rather than public API. */
import { motion, overlay } from "../src/components/ui.common.ts";

const library = await import("../dist/esm/index.js");

const {
  ActionButton,
  Alert,
  Avatar,
  Badge,
  Card,
  CodeBlock,
  Divider,
  Dropdown,
  IconButton,
  Input,
  Markdown,
  NavGroup,
  Search,
  Skeleton,
  Spinner,
  Switch,
  TabGroup,
  Table,
  Textarea,
  Tooltip,
} = library;

const { Header: ModalHeader, Content: ModalContent, Footer: ModalFooter } = library.Modal;

const root = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = join(root, "scripts", "visual-baselines", "visual-regression.json");
const update = process.argv.includes("--update");
const preview = process.argv.includes("--preview");

const h = React.createElement;
const noop = () => undefined;
const inDialogContext = (child) => h(BaseDialog.Root, { open: true }, child);

/* One specimen per visual decision a component makes. Variants and sizes stand in for
   the API surface; states are carried by the recipes themselves. */
const specimens = {
  "action-button.filled": h(ActionButton, { appearance: "filled" }, "Save"),
  "action-button.filled.danger": h(ActionButton, { appearance: "filled", variant: "danger" }, "Delete"),
  "action-button.tonal": h(ActionButton, { appearance: "tonal", variant: "secondary" }, "Cancel"),
  "action-button.tonal.primary": h(ActionButton, {}, "Continue"),
  "action-button.text": h(ActionButton, { appearance: "text", variant: "secondary" }, "Skip"),
  "action-button.icon": h(ActionButton, { icon: h(Spinner, { size: "small" }) }, "Sync"),
  "action-button.size.sm": h(ActionButton, { size: "sm" }, "Small"),
  "action-button.size.md": h(ActionButton, { size: "md" }, "Medium"),
  "action-button.size.lg": h(ActionButton, { size: "lg" }, "Large"),
  "action-button.disabled": h(ActionButton, { disabled: true }, "Disabled"),
  "action-button.loading": h(ActionButton, { loading: true }, "Saving"),
  "alert.primary": h(Alert, {}, "A useful piece of information."),
  "alert.danger.closeable": h(Alert, { variant: "danger", closeable: true }, "Something needs your attention."),
  "alert.success": h(Alert, { variant: "success" }, "Changes were saved."),
  "avatar.circle.sm": h(Avatar, { src: "/avatar.png", alt: "Example avatar", size: "sm" }),
  "avatar.rounded.md": h(Avatar, { src: "/avatar.png", alt: "Example avatar", shape: "rounded" }),
  "badge.primary": h(Badge, {}, "Primary"),
  "badge.secondary": h(Badge, { variant: "secondary" }, "Neutral"),
  "badge.success.icon": h(Badge, { variant: "success", icon: h("span", null, "·") }, "Ready"),
  "card.secondary": h(Card, {}, "Neutral card"),
  "card.primary": h(Card, { variant: "primary" }, "Tonal card"),
  "code-block.block": h(CodeBlock, { language: "tsx" }, '<ActionButton appearance="filled">Save</ActionButton>'),
  "code-block.inline": h(CodeBlock, { inline: true }, "ActionButton"),
  "divider.horizontal": h(Divider, {}),
  "divider.vertical": h(Divider, { orientation: "vertical" }),
  "dropdown.trigger": h(Dropdown, { options: [{ label: "Design system", value: "design" }], selected: "design", onSelect: noop }),
  "dropdown.disabled": h(Dropdown, { options: [{ label: "Design system", value: "design" }], disabled: true }),
  "icon-button.tonal": h(IconButton, { icon: h("span", null, "·"), "aria-label": "Notifications" }),
  "icon-button.ghost": h(IconButton, { appearance: "ghost", variant: "secondary", icon: h("span", null, "·"), "aria-label": "Search" }),
  "icon-button.acrylic": h(IconButton, { appearance: "acrylic", variant: "secondary", icon: h("span", null, "·"), "aria-label": "Download" }),
  "icon-button.disabled": h(IconButton, { disabled: true, icon: h("span", null, "·"), "aria-label": "Favorite" }),
  "input.default": h(Input, { label: "Project name", placeholder: "Sherick UI" }),
  "input.required": h(Input, { label: "Email", required: true, name: "email", type: "email" }),
  "input.error": h(Input, { label: "Invalid", error: true, placeholder: "Required value" }),
  "input.disabled": h(Input, { label: "Disabled", disabled: true, placeholder: "Unavailable" }),
  "markdown.document": h(Markdown, {}, "## Example\n\nBody copy with `inline` code.\n\n> A quote.\n\n```ts\nconst a = 1;\n```\n"),
  "modal.header": inDialogContext(h(ModalHeader, {}, "Modal specimen")),
  "modal.content": inDialogContext(h(ModalContent, {}, "Focused, translucent and separated from the page beneath it.")),
  "modal.footer": inDialogContext(h(ModalFooter, {}, h(ActionButton, { appearance: "filled" }, "Confirm"))),
  "nav-group": h(NavGroup, { title: "Components", activeHref: "#fields", items: [{ label: "Buttons", href: "#buttons" }, { label: "Fields", href: "#fields" }] }),
  "search.default": h(Search, { onSearch: noop, placeholder: "Search components" }),
  "search.loading": h(Search, { onSearch: noop, loading: true }),
  "search.variant.primary": h(Search, { onSearch: noop, variant: "primary" }),
  "skeleton": h(Skeleton, { className: "h-4 w-3/4" }),
  "spinner.small": h(Spinner, { size: "small" }),
  "switch.on": h(Switch, { checked: true, onChange: noop }),
  "switch.off": h(Switch, { checked: false, onChange: noop }),
  "switch.disabled": h(Switch, { checked: true, disabled: true }),
  "tab-group": h(TabGroup, {
    tabs: [
      { id: "one", label: "Overview", content: "Overview" },
      { id: "two", label: "Motion", content: "Motion" },
    ],
  }),
  "table": h(Table, { headers: ["Component", "Role"], rows: [["Dropdown", "Selection"], ["Table", "Data"]] }),
  "textarea.default": h(Textarea, { label: "Notes", placeholder: "Describe what you want to build…" }),
  "textarea.error": h(Textarea, { label: "Invalid notes", error: true }),
  "tooltip.trigger": h(Tooltip, { content: "Hint" }, h(ActionButton, { appearance: "tonal" }, "Hover")),
};

/* React's generated ids carry no visual meaning and change between renders; class
   order is irrelevant to the cascade, so both are normalised out. */
const normalizeMarkup = (html) =>
  html
    .replace(/(id|for|aria-controls|aria-labelledby|aria-describedby)="[^"]*"/g, '$1="#"')
    .replace(/class="([^"]*)"/g, (_match, list) => `class="${list.split(/\s+/).filter(Boolean).sort().join(" ")}"`);

const rendered = Object.fromEntries(
  Object.entries(specimens).map(([id, element]) => [id, normalizeMarkup(renderToStaticMarkup(element))])
);

const overlayRecipes = {
  menu: overlay.menu,
  tooltip: overlay.tooltip,
  dialog: overlay.dialog,
  "motion.in": motion.overlayIn,
  "motion.out": motion.overlayOut,
  "motion.scrimIn": motion.scrimIn,
  "motion.scrimOut": motion.scrimOut,
};

const markup = [Object.values(rendered).join("\n"), ...Object.values(overlayRecipes)].join("\n");

const utilityCss = (
  await postcss([
    tailwindcss({
      presets: [preset],
      content: [{ raw: markup, extension: "html" }],
      corePlugins: { preflight: false },
    }),
  ]).process("@tailwind utilities;", { from: undefined })
).css;

/* Key every generated rule by its selector (and the at-rule it lives in) so a change in
   what a utility resolves to — including the keyframes an animation refers to — shows
   up as a diff rather than a silently different product. */
const utilities = {};
const collectDeclarations = (rule) => {
  const declarations = [];
  rule.each((node) => {
    if (node.type === "decl") declarations.push(`${node.prop}: ${node.value}`);
  });
  return declarations.sort();
};
const walkCss = (container, context = "") => {
  container.each((node) => {
    if (node.type === "atrule") walkCss(node, `${context}@${node.name} ${node.params} | `);
    else if (node.type === "rule") utilities[`${context}${node.selector}`] = collectDeclarations(node);
  });
};
walkCss(postcss.parse(utilityCss));

const themeRoot = postcss.parse(await readFile(join(root, "theme.css"), "utf8"));
const tokens = {};
const collectTokens = (rule, context) => {
  const collected = {};
  rule.walkDecls(/^--sui-/, (declaration) => {
    collected[declaration.prop] = declaration.value.replace(/\s+/g, " ").trim();
  });
  if (Object.keys(collected).length > 0) tokens[`${context}${rule.selector.replace(/\s+/g, " ")}`] = collected;
};
themeRoot.each((node) => {
  if (node.type === "atrule") node.each((rule) => collectTokens(rule, `@${node.name} ${node.params} | `));
  else if (node.type === "rule") collectTokens(node, "");
});

/* Group a few decorative token families so a diff says what changed rather than
   dumping the whole palette. */
const snapshot = { tokens, utilities, specimens: rendered, overlays: overlayRecipes };

const flatten = (value, prefix = "", out = {}) => {
  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else {
    out[prefix] = value;
  }
  return out;
};

const baselineRaw = await readFile(baselinePath, "utf8").catch(() => null);

if (baselineRaw === null && !update) {
  console.error(`Visual regression: no baseline at ${baselinePath.replace(`${root}/`, "")}.

The gate compares the library against a recorded baseline; without one it cannot tell a
deliberate change from a silent restyle. Create it with:
  bun run visual --update
and review the diff before committing it.`);
  process.exit(1);
}

if (update) {
  await mkdir(join(root, "scripts", "visual-baselines"), { recursive: true });
  await writeFile(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Visual baseline written (${Object.keys(rendered).length} specimens).`);
} else {
  const baseline = flatten(JSON.parse(baselineRaw));
  const current = flatten(snapshot);
  const changes = [];
  for (const key of new Set([...Object.keys(baseline), ...Object.keys(current)])) {
    if (!(key in baseline)) changes.push(`+ ${key} = ${JSON.stringify(current[key])}`);
    else if (!(key in current)) changes.push(`- ${key}`);
    else if (baseline[key] !== current[key]) {
      changes.push(`~ ${key}\n    baseline: ${JSON.stringify(baseline[key])}\n    current:  ${JSON.stringify(current[key])}`);
    }
  }

  if (changes.length > 0) {
    console.error(`Visual regression: ${changes.length} change(s) against scripts/visual-baselines/visual-regression.json\n`);
    console.error(changes.slice(0, 40).join("\n"));
    if (changes.length > 40) console.error(`\n… ${changes.length - 40} more`);
    console.error("\nReview each change against the design language, then re-run with --update to accept it.");
    process.exit(1);
  }

  console.log(`Visual regression passed (${Object.keys(rendered).length} specimens, ${Object.keys(overlayRecipes).length} overlay recipes, ${Object.keys(utilities).length} utilities, ${Object.keys(tokens).length} token blocks).`);
}

if (preview) {
  const previewDir = join(root, ".visual");
  await mkdir(previewDir, { recursive: true });
  /* Self-contained: the theme tokens plus the utilities the specimens use, so the
     preview renders exactly what the gate pinned. */
  const previewTheme = (await readFile(join(root, "theme.css"), "utf8")).replace(/^@tailwind.*$/gm, "");
  await writeFile(
    join(previewDir, "preview.css"),
    `${previewTheme}\n*,::before,::after{box-sizing:border-box}\n${utilityCss}\n`,
    "utf8"
  );
  const body = Object.entries(rendered)
    .map(([id, html]) => `<section><h2>${id}</h2><div class="specimen">${html}</div></section>`)
    .join("\n");
  await writeFile(
    join(previewDir, "preview.html"),
    `<!doctype html><meta charset="utf-8"><title>Sherick UI visual preview</title>
<link rel="stylesheet" href="preview.css">
<style>body{background:oklch(var(--sui-canvas));color:oklch(var(--sui-ink));font-family:system-ui,sans-serif;padding:32px;margin:0}
section{margin-bottom:32px}h2{font:600 14px/1.4 ui-monospace,monospace;margin:0 0 8px}
.specimen{display:inline-block;min-width:320px;padding:16px;border-radius:20px;background:oklch(var(--sui-surface) / 0.78)}</style>
${body}
`,
    "utf8"
  );
  console.log(".visual/preview.html written.");
}