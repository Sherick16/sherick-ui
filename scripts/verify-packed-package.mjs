import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Prism from "prismjs";
import {
  ActionButton,
  Dialog,
  Select,
} from "sherick-ui";

assert.equal(typeof ActionButton, "object");
assert.equal(typeof Dialog, "function");
assert.equal(typeof Select, "object");

for (const open of [false, true]) {
  assert.doesNotThrow(() =>
    renderToStaticMarkup(
      React.createElement(
        Dialog,
        { open, onClose() {} },
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
  assert.ok(Prism.languages[language], \`Prism grammar was not registered: \${language}\`);
  const highlighted = Prism.highlight(sample, Prism.languages[language], language);
  assert.match(highlighted, /token/, \`Prism did not tokenize \${language}\`);
}

const themePath = fileURLToPath(import.meta.resolve("sherick-ui/theme.css"));
await access(themePath);
console.log("Packed ESM/SSR/Prism verification passed.");
`;

  const cjsFixture = `
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ui = require("sherick-ui");

assert.ok(ui.ActionButton, "CommonJS export missing ActionButton");
assert.ok(ui.Dialog, "CommonJS export missing Dialog");
assert.ok(ui.Select, "CommonJS export missing Select");
assert.ok(fs.existsSync(require.resolve("sherick-ui/theme.css")), "theme.css export must resolve");
assert.ok(require("sherick-ui/tailwind-preset"), "Tailwind preset export must be require-able");
console.log("Packed CommonJS verification passed.");
`;

  const typeFixture = `
import * as React from "react";
import {
  ActionButton,
  Dialog,
  Select,
  type ActionButtonProps,
  type SelectProps,
} from "sherick-ui";

const buttonProps: ActionButtonProps = { children: "Save", appearance: "filled" };
const selectProps: SelectProps = {
  options: [{ label: "Design", value: "design" }],
  defaultValue: "design",
};

export const fixture = (
  <>
    <ActionButton {...buttonProps} />
    <Select {...selectProps} />
    <Dialog open={false} onClose={() => undefined}>
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

  run(process.execPath, ["esm.mjs"], consumerDir);
  run(process.execPath, ["cjs.cjs"], consumerDir);
  run(join(consumerDir, "node_modules", ".bin", "tsc"), ["-p", "tsconfig.json"], consumerDir);

  const installedPackage = JSON.parse(
    await readFile(join(consumerDir, "node_modules", "sherick-ui", "package.json"), "utf8")
  );
  assert.equal(installedPackage.main, "dist/index.cjs");
  assert.equal(installedPackage.exports["."].require, "./dist/index.cjs");
  await access(join(consumerDir, "node_modules", "sherick-ui", "dist", "index.cjs"));

  console.log(`Packed package verification passed: ${packed[0].filename}`);
} finally {
  await rm(work, { recursive: true, force: true });
}
