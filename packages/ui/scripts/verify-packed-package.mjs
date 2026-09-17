import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const work = await mkdtemp(join(tmpdir(), "sherick-ui-packed-"));

const run = (command, args, cwd, options = {}) =>
  execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    env: { ...process.env, CI: "1" },
  });

try {
  const packDir = join(work, "pack");
  const consumerDir = join(work, "consumer");
  await mkdir(packDir, { recursive: true });
  await mkdir(consumerDir, { recursive: true });

  const packOutput = run(
    "npm",
    ["pack", "--json", "--ignore-scripts", "--pack-destination", packDir],
    root,
    { capture: true }
  );
  const packed = JSON.parse(packOutput);
  assert.equal(packed.length, 1, "npm pack should produce exactly one artifact");

  const tarball = join(packDir, packed[0].filename);
  await access(tarball);

  await writeFile(
    join(consumerDir, "package.json"),
    `${JSON.stringify(
      {
        name: "sherick-ui-packed-consumer",
        private: true,
        type: "module",
        dependencies: {
          "sherick-ui": `file:${tarball}`,
          react: "19.3.0",
          "react-dom": "19.3.0",
          typescript: "5.9.3",
          vite: "7.1.7",
          "@types/react": "19.3.0",
          "@types/react-dom": "19.3.0"
        }
      },
      null,
      2
    )}\n`
  );

  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumerDir);

  const esmFixture = `
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ActionButton,
  Button,
  CodeBlock,
  Dialog,
  Select,
} from "sherick-ui";

const dev = await import("sherick-ui/dev");
assert.equal(typeof dev.cn, "function");
assert.ok(dev.material, "dev recipe export should resolve");

assert.equal(typeof Button, "object");
assert.equal(ActionButton, Button, "ActionButton should remain a compatibility alias for Button");
assert.equal(typeof Dialog, "object");
assert.equal(typeof Dialog.Header, "function");
assert.equal(typeof Dialog.Content, "function");
assert.equal(typeof Select, "object");

for (const open of [false, true]) {
  assert.doesNotThrow(() =>
    renderToStaticMarkup(
      React.createElement(
        Dialog,
        { open, onOpenChange() {} },
        React.createElement(Dialog.Header, null, "Package dialog"),
        React.createElement(Dialog.Content, null, "SSR package fixture")
      )
    )
  );
}

for (const [language, sample] of [
  ["typescript", "const answer: number = 42"],
  ["python", "def answer():\\n    return 42"],
  ["sql", "select * from answers where value = 42"],
  ["yaml", "answer: 42"],
]) {
  const highlighted = renderToStaticMarkup(
    React.createElement(CodeBlock, { language }, sample)
  );
  assert.match(
    highlighted,
    /class="[^"]*token [^"]+"/,
    \`published CodeBlock did not tokenize \${language}\`
  );
}

const stylesPath = fileURLToPath(import.meta.resolve("sherick-ui/styles.css"));
const themePath = fileURLToPath(import.meta.resolve("sherick-ui/theme.css"));
await access(stylesPath);
await access(themePath);
const styles = await readFile(stylesPath, "utf8");
assert.match(styles, /sui-scope/, "published styles must contain the Sherick scope");
assert.match(styles, /@font-face/, "published styles must include KaTeX font declarations");
console.log("Packed ESM/SSR/Prism/CSS verification passed.");
`;

  const cjsFixture = `
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ui = require("sherick-ui");

assert.ok(ui.Button, "CommonJS export missing Button");
assert.strictEqual(ui.ActionButton, ui.Button, "ActionButton should alias Button in CommonJS");
assert.ok(ui.Dialog, "CommonJS export missing Dialog");
assert.ok(ui.Select, "CommonJS export missing Select");
assert.ok(fs.existsSync(require.resolve("sherick-ui/styles.css")), "styles.css export must resolve");
assert.ok(fs.existsSync(require.resolve("sherick-ui/theme.css")), "theme.css export must resolve");
console.log("Packed CommonJS verification passed.");
`;

  const typeFixture = `
import * as React from "react";
import {
  ActionButton,
  Button,
  Dialog,
  Input,
  Search,
  Select,
  Switch,
  Tabs,
  type ActionButtonProps,
  type AlertProps,
  type ButtonProps,
  type InputProps,
  type SearchProps,
  type SelectProps,
  type SkeletonProps,
  type SpinnerProps,
  type SwitchProps,
  type TabsProps,
} from "sherick-ui";

const buttonProps: ButtonProps = { children: "Save", appearance: "filled" };
const legacyButtonProps: ActionButtonProps = buttonProps;
const selectProps: SelectProps = {
  options: [{ label: "Design", value: "design" }],
  defaultValue: "design",
};
const inputProps: InputProps = {
  label: "Name",
  description: "Helper",
  error: true,
  errorMessage: "Invalid",
  onValueChange() {},
};
const searchProps: SearchProps = {
  onSearch() {},
  onValueChange() {},
};
const switchProps: SwitchProps = {
  checked: true,
  onCheckedChange() {},
  name: "enabled",
  value: "yes",
};
const tabsProps: TabsProps = {
  value: "one",
  onValueChange() {},
  tabs: [{ id: "one", label: "One", content: "Panel" }],
};
const alertProps: AlertProps = { children: "Notice", onDismiss() {} };
const skeletonProps: SkeletonProps = { "aria-label": "Loading" };
const spinnerProps: SpinnerProps = { size: "small" };
void alertProps;
void skeletonProps;
void spinnerProps;

export const fixture = (
  <>
    <Button {...buttonProps} />
    <ActionButton {...legacyButtonProps} />
    <Input {...inputProps} />
    <Search {...searchProps} />
    <Select {...selectProps} />
    <Switch {...switchProps} />
    <Tabs {...tabsProps} />
    <Dialog defaultOpen onOpenChange={() => undefined}>
      <Dialog.Header>Title</Dialog.Header>
      <Dialog.Content>Body</Dialog.Content>
    </Dialog>
  </>
);
`;

  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      skipLibCheck: false
    },
    include: ["consumer.tsx"]
  };

  await writeFile(join(consumerDir, "esm.mjs"), esmFixture);
  await writeFile(join(consumerDir, "cjs.cjs"), cjsFixture);
  await writeFile(join(consumerDir, "consumer.tsx"), typeFixture);
  await writeFile(join(consumerDir, "tsconfig.json"), `${JSON.stringify(tsconfig, null, 2)}\n`);

  await mkdir(join(consumerDir, "src"), { recursive: true });
  await writeFile(
    join(consumerDir, "index.html"),
    '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>'
  );
  await writeFile(
    join(consumerDir, "src", "main.jsx"),
    'import React from "react"; import { createRoot } from "react-dom/client"; import { Button } from "sherick-ui"; import "sherick-ui/styles.css"; createRoot(document.getElementById("root")).render(React.createElement(Button, null, "Packed"));'
  );

  run(process.execPath, ["esm.mjs"], consumerDir);
  run(process.execPath, ["cjs.cjs"], consumerDir);
  run(join(consumerDir, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json"], consumerDir);
  run(join(consumerDir, "node_modules", ".bin", "vite"), ["build"], consumerDir);

  const installedPackage = JSON.parse(
    await readFile(join(consumerDir, "node_modules", "sherick-ui", "package.json"), "utf8")
  );
  assert.equal(installedPackage.main, "dist/cjs/index.cjs");
  assert.equal(installedPackage.style, "dist/styles.css");
  assert.equal(installedPackage.exports["."].require, "./dist/cjs/index.cjs");
  assert.equal(installedPackage.exports["./styles.css"], "./dist/styles.css");
  assert.equal(installedPackage.exports["./theme.css"], "./dist/theme.css");
  assert.equal(installedPackage.exports["./tailwind-preset"], undefined);
  assert.equal(installedPackage.peerDependencies.tailwindcss, undefined);
  await access(join(consumerDir, "node_modules", "sherick-ui", "dist", "cjs", "index.cjs"));
  await access(join(consumerDir, "node_modules", "sherick-ui", "dist", "styles.css"));
  await access(join(consumerDir, "node_modules", "sherick-ui", "dist", "theme.css"));
  await access(join(consumerDir, "node_modules", "sherick-ui", "dist", "fonts", "KaTeX_Main-Regular.woff2"));

  console.log(`Packed package verification passed: ${packed[0].filename}`);
} finally {
  await rm(work, { recursive: true, force: true });
}
