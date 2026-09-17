#!/usr/bin/env node
/*
 Deterministic style-contract gate
 =================================
 This gate pins the exact generated theme tokens, the published scoped component CSS,
 component specimen markup and shared overlay recipes. Browser screenshots separately
 protect pixel output; this file protects the deterministic styling contract that feeds
 those pixels.

 Usage:
   bun scripts/visual-regression.mjs
   bun scripts/visual-regression.mjs --update
   bun scripts/visual-regression.mjs --preview
*/

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { motion, overlay } from "../src/components/ui.common.ts";

const library = await import("../dist/esm/index.js");
const content = await import("../dist/esm/content.js");

const {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  IconButton,
  Input,
  NavGroup,
  Search,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  Table,
  Textarea,
  Tooltip,
} = library;

const { CodeBlock, Markdown } = content;

const { Header: DialogHeader, Content: DialogContent, Footer: DialogFooter } = library.Dialog;

const root = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = join(root, "scripts", "visual-baselines", "visual-regression.json");
const update = process.argv.includes("--update");
const preview = process.argv.includes("--preview");

const h = React.createElement;
const noop = () => undefined;
const inDialogContext = (child) => h(BaseDialog.Root, { open: true }, child);

const specimens = {
  "button.filled": h(Button, { appearance: "filled" }, "Save"),
  "button.filled.danger": h(Button, { appearance: "filled", variant: "danger" }, "Delete"),
  "button.tonal": h(Button, { appearance: "tonal", variant: "secondary" }, "Cancel"),
  "button.tonal.primary": h(Button, {}, "Continue"),
  "button.text": h(Button, { appearance: "text", variant: "secondary" }, "Skip"),
  "button.icon": h(Button, { icon: h(Spinner, { size: "small" }) }, "Sync"),
  "button.size.sm": h(Button, { size: "sm" }, "Small"),
  "button.size.md": h(Button, { size: "md" }, "Medium"),
  "button.size.lg": h(Button, { size: "lg" }, "Large"),
  "button.disabled": h(Button, { disabled: true }, "Disabled"),
  "button.loading": h(Button, { loading: true }, "Saving"),
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
  "code-block.block": h(CodeBlock, { language: "tsx" }, '<Button appearance="filled">Save</Button>'),
  "code-block.inline": h(CodeBlock, { inline: true }, "Button"),
  "divider.horizontal": h(Divider, {}),
  "divider.vertical": h(Divider, { orientation: "vertical" }),
  "select.trigger": h(Select, { options: [{ label: "Design system", value: "design" }], value: "design", onValueChange: noop }),
  "select.disabled": h(Select, { options: [{ label: "Design system", value: "design" }], disabled: true }),
  "icon-button.tonal": h(IconButton, { icon: h("span", null, "·"), "aria-label": "Notifications" }),
  "icon-button.ghost": h(IconButton, { appearance: "ghost", variant: "secondary", icon: h("span", null, "·"), "aria-label": "Search" }),
  "icon-button.acrylic": h(IconButton, { appearance: "acrylic", variant: "secondary", icon: h("span", null, "·"), "aria-label": "Download" }),
  "icon-button.disabled": h(IconButton, { disabled: true, icon: h("span", null, "·"), "aria-label": "Favorite" }),
  "input.default": h(Input, { label: "Project name", placeholder: "Sherick UI" }),
  "input.required": h(Input, { label: "Email", required: true, name: "email", type: "email" }),
  "input.error": h(Input, { label: "Invalid", error: true, placeholder: "Required value" }),
  "input.disabled": h(Input, { label: "Disabled", disabled: true, placeholder: "Unavailable" }),
  "markdown.document": h(Markdown, {}, "## Example\n\nBody copy with `inline` code.\n\n> A quote.\n\n```ts\nconst a = 1;\n```\n"),
  "dialog.header": inDialogContext(h(DialogHeader, {}, "Dialog specimen")),
  "dialog.content": inDialogContext(h(DialogContent, {}, "Focused, translucent and separated from the page beneath it.")),
  "dialog.footer": inDialogContext(h(DialogFooter, {}, h(Button, { appearance: "filled" }, "Confirm"))),
  "nav-group": h(NavGroup, { title: "Components", activeHref: "#fields", items: [{ label: "Buttons", href: "#buttons" }, { label: "Fields", href: "#fields" }] }),
  "search.default": h(Search, { onSearch: noop, placeholder: "Search components" }),
  "search.loading": h(Search, { onSearch: noop, loading: true }),
  "search.variant.primary": h(Search, { onSearch: noop, variant: "primary" }),
  "skeleton": h(Skeleton, { className: "h-4 w-3/4" }),
  "spinner.small": h(Spinner, { size: "small" }),
  "switch.on": h(Switch, { checked: true, onCheckedChange: noop }),
  "switch.off": h(Switch, { checked: false, onCheckedChange: noop }),
  "switch.disabled": h(Switch, { checked: true, disabled: true }),
  "tabs": h(Tabs, {
    tabs: [
      { id: "one", label: "Overview", content: "Overview" },
      { id: "two", label: "Motion", content: "Motion" },
    ],
  }),
  "table": h(Table, { headers: ["Component", "Role"], rows: [["Select", "Selection"], ["Table", "Data"]] }),
  "textarea.default": h(Textarea, { label: "Notes", placeholder: "Describe what you want to build…" }),
  "textarea.error": h(Textarea, { label: "Invalid notes", error: true }),
  "tooltip.trigger": h(Tooltip, { content: "Hint" }, h(Button, { appearance: "tonal" }, "Hover")),
};

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

const collectDeclarations = (rule) => {
  const declarations = [];
  rule.each((node) => {
    if (node.type === "decl") declarations.push(`${node.prop}: ${node.value}`);
  });
  return declarations.sort();
};

const stylesCss = await readFile(join(root, "dist", "styles.css"), "utf8");
const stylesRoot = postcss.parse(stylesCss);
const utilities = {};
const walkCss = (container, context = "") => {
  container.each((node) => {
    if (node.type === "atrule") {
      if (node.name === "layer" && node.params === "sherick-ui-theme") return;
      walkCss(node, `${context}@${node.name} ${node.params} | `);
    } else if (node.type === "rule") {
      if (node.selector.includes(".katex")) return;
      utilities[`${context}${node.selector}`] = collectDeclarations(node);
    }
  });
};
walkCss(stylesRoot);

const themeRoot = postcss.parse(await readFile(join(root, "dist", "theme.css"), "utf8"));
const tokens = {};
const collectTokenRules = (container, context = "") => {
  container.each((node) => {
    if (node.type === "atrule") {
      collectTokenRules(node, `${context}@${node.name} ${node.params} | `);
      return;
    }
    if (node.type !== "rule") return;
    const collected = {};
    node.walkDecls(/^--sui-/, (declaration) => {
      collected[declaration.prop] = declaration.value.replace(/\s+/g, " ").trim();
    });
    if (Object.keys(collected).length > 0) {
      tokens[`${context}${node.selector.replace(/\s+/g, " ")}`] = collected;
    }
  });
};
collectTokenRules(themeRoot);

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
  console.error(`Style contract: no baseline at ${baselinePath.replace(`${root}/`, "")}.
Create it with: bun run visual --update`);
  process.exit(1);
}

if (update) {
  await mkdir(join(root, "scripts", "visual-baselines"), { recursive: true });
  await writeFile(baselinePath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Style-contract baseline written (${Object.keys(rendered).length} specimens).`);
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
    console.error(`Style contract: ${changes.length} change(s) against scripts/visual-baselines/visual-regression.json\n`);
    console.error(changes.slice(0, 40).join("\n"));
    if (changes.length > 40) console.error(`\n… ${changes.length - 40} more`);
    console.error("\nReview each deterministic change, then re-run with --update to accept it.");
    process.exit(1);
  }

  console.log(`Style contract passed (${Object.keys(rendered).length} specimens, ${Object.keys(overlayRecipes).length} overlay recipes, ${Object.keys(utilities).length} scoped rules, ${Object.keys(tokens).length} token blocks).`);
}

if (preview) {
  const previewDir = join(root, ".visual");
  await mkdir(previewDir, { recursive: true });
  await writeFile(join(previewDir, "preview.css"), stylesCss, "utf8");
  const body = Object.entries(rendered)
    .map(([id, html]) => `<section><h2>${id}</h2><div class="specimen">${html}</div></section>`)
    .join("\n");
  await writeFile(
    join(previewDir, "preview.html"),
    `<!doctype html><meta charset="utf-8"><title>Sherick UI style preview</title>
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
