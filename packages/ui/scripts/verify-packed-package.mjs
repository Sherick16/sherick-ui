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
import { Button, Dialog, Select } from "sherick-ui";
import * as root from "sherick-ui";
import { CodeBlock } from "sherick-ui/content";

const dev = await import("sherick-ui/dev");
assert.equal(typeof dev.cn, "function");
assert.ok(dev.material, "dev recipe export should resolve");

for (const removed of ["ActionButton", "Dropdown", "Modal", "TabGroup", "Markdown", "CodeBlock"]) {
  assert.equal(root[removed], undefined, \`\${removed} must not be exported from the root barrel\`);
}

assert.equal(typeof Button, "object");
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

/* A Switch with no checked prop is uncontrolled, and defaultChecked must be honored: the
   rendered ARIA state is the consumer-visible proof. */
const { Switch } = root;
assert.match(
  renderToStaticMarkup(React.createElement(Switch, { "aria-label": "Off" })),
  /aria-checked="false"/
);
assert.match(
  renderToStaticMarkup(React.createElement(Switch, { "aria-label": "On", defaultChecked: true })),
  /aria-checked="true"/
);
assert.match(
  renderToStaticMarkup(React.createElement(Switch, { "aria-label": "Controlled", checked: false })),
  /aria-checked="false"/
);

/* Language-specific grammars are registered by bare side-effect imports inside the
   published content entry. A language outside core Prism (yaml, python, sql, docker)
   only produces token spans when those imports survived publication. */
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

/* Math needs both halves of the pipeline: remark-math turns \`$…$\` into a math node and
   rehype-katex renders it. Asserting the rendered equation keeps either one from being
   dropped without anyone noticing. */
const { Markdown } = await import("sherick-ui/content");
const equation = renderToStaticMarkup(
  React.createElement(Markdown, null, "Inline math: $E = mc^2$\\n\\n$$\\\\int_0^1 x\\\\,dx$$")
);
assert.match(equation, /class="[^"]*katex/, "published Markdown did not render KaTeX markup");
assert.match(equation, /<math|katex-html/, "published Markdown did not produce a rendered equation");

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
assert.ok(ui.Dialog, "CommonJS export missing Dialog");
assert.ok(ui.Select, "CommonJS export missing Select");
assert.ok(ui.Tabs, "CommonJS export missing Tabs");
assert.equal(ui.ActionButton, undefined, "removed aliases must not survive in CommonJS");
assert.equal(ui.Markdown, undefined, "rich content must not be reachable from the CommonJS root");
assert.ok(fs.existsSync(require.resolve("sherick-ui/styles.css")), "styles.css export must resolve");
assert.ok(fs.existsSync(require.resolve("sherick-ui/theme.css")), "theme.css export must resolve");

/* The rich-content stack is ESM-only (react-markdown, remark/rehype), so the package
   intentionally publishes no require() entry for the subpath instead of shipping an
   artifact that fails on runtimes without require(esm). A CommonJS consumer uses dynamic
   import(), which is the same thing react-markdown itself requires of them. */
assert.throws(
  () => require("sherick-ui/content"),
  (error) => error.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  "require('sherick-ui/content') must not be advertised, because its dependency graph is ESM-only"
);

(async () => {
  const content = await import("sherick-ui/content");
  assert.ok(content.Markdown, "dynamic import must resolve Markdown from CommonJS");
  assert.ok(content.CodeBlock, "dynamic import must resolve CodeBlock from CommonJS");
  console.log("Packed CommonJS verification passed.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;

  const typeFixture = `
import * as React from "react";
import {
  Button,
  Dialog,
  Input,
  Search,
  Select,
  Switch,
  Tabs,
  Textarea,
  type AlertProps,
  type ButtonProps,
  type DialogProps,
  type InputProps,
  type SearchProps,
  type SelectProps,
  type SkeletonProps,
  type SpinnerProps,
  type SwitchProps,
  type TabsProps,
} from "sherick-ui";
import { CodeBlock, Markdown, type CodeBlockProps, type MarkdownProps } from "sherick-ui/content";

const buttonProps: ButtonProps = { children: "Save", appearance: "filled" };
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
/* An uncontrolled Switch is part of the public contract: omitting the checked prop must
   leave the control uncontrolled, and defaultChecked must be honored. */
const uncontrolledSwitchProps: SwitchProps = { defaultChecked: true, onCheckedChange() {} };
const tabsProps: TabsProps = {
  value: "one",
  onValueChange() {},
  tabs: [{ id: "one", label: "One", content: "Panel" }],
};
const dialogProps: DialogProps = { defaultOpen: true, onOpenChange() {}, children: null };
const markdownProps: MarkdownProps = { children: "# Title" };
const codeBlockProps: CodeBlockProps = { language: "ts", children: "const a = 1;" };
const alertProps: AlertProps = { children: "Notice", onDismiss() {} };
const skeletonProps: SkeletonProps = { "aria-label": "Loading" };
const spinnerProps: SpinnerProps = { size: "small" };
void alertProps;
void skeletonProps;
void spinnerProps;

export const fixture = (
  <>
    <Button {...buttonProps} />
    <Input {...inputProps} onChange={(event) => void event.currentTarget.value} />
    <Textarea label="Body" onChange={(event) => void event.currentTarget.value} />
    <Search {...searchProps} />
    <Select {...selectProps} />
    <Switch {...switchProps} />
    <Switch {...uncontrolledSwitchProps} aria-label="Uncontrolled" />
    <Tabs {...tabsProps} />
    <Dialog {...dialogProps}>
      <Dialog.Header>Title</Dialog.Header>
      <Dialog.Content>Body</Dialog.Content>
      <Dialog.Footer>Actions</Dialog.Footer>
    </Dialog>
    <Markdown {...markdownProps} />
    <CodeBlock {...codeBlockProps} />
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
    'import React from "react"; import { createRoot } from "react-dom/client"; import { Button } from "sherick-ui"; import { Markdown } from "sherick-ui/content"; import "sherick-ui/styles.css"; createRoot(document.getElementById("root")).render(React.createElement("div", null, React.createElement(Button, null, "Packed"), React.createElement(Markdown, null, "# Packed")));'
  );
  /* This consumer deliberately imports the optional rich-content subpath, so its single
     chunk is legitimately large. The warning limit is raised instead of code-splitting a
     fixture whose only job is to prove both entries build with no Tailwind present. */
  await writeFile(
    join(consumerDir, "vite.config.mjs"),
    'export default { build: { chunkSizeWarningLimit: 1024 } };\n'
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
  assert.equal(installedPackage.exports["./content"].import, "./dist/esm/content.js");
  assert.equal(
    installedPackage.exports["./content"].require,
    undefined,
    "the ESM-only content subpath must not advertise a require entry"
  );
  assert.equal(installedPackage.exports["./styles.css"], "./dist/styles.css");
  assert.equal(installedPackage.exports["./theme.css"], "./dist/theme.css");
  assert.equal(installedPackage.exports["./tailwind-preset"], undefined);
  assert.equal(installedPackage.peerDependencies.tailwindcss, undefined);

  /* A prerelease must never publish under `latest`, and a stable version must — otherwise
     `npm install sherick-ui` either silently hands consumers an unstable API or hides a
     stable release behind a tag nobody installs. */
  const distTag = installedPackage.publishConfig?.tag ?? "latest";
  const isPrerelease = installedPackage.version.includes("-");
  assert.equal(
    isPrerelease,
    distTag !== "latest",
    isPrerelease
      ? `prerelease ${installedPackage.version} must not publish under the latest dist-tag`
      : `stable ${installedPackage.version} must publish under the latest dist-tag`
  );

  /* Only intentional publication artifacts may reach the registry: the built package
     plus npm's own metadata files. A stray source tree, Tailwind config, lint config or
     test artifact here means `files` or the build layout regressed. */
  const publishedPaths = packed[0].files.map((file) => file.path);
  const unexpected = publishedPaths.filter(
    (path) => !/^dist\//.test(path) && !["package.json", "README.md", "LICENSE"].includes(path)
  );
  assert.deepEqual(unexpected, [], `unexpected file published in the tarball: ${unexpected.join(", ")}`);
  assert.ok(
    publishedPaths.some((path) => path === "dist/esm/content.js"),
    "the packed tarball must include the content subpath build"
  );
  assert.ok(
    !publishedPaths.some((path) => /^dist\/cjs\/(content|components\/(Markdown|CodeBlock|prism-theme))\.cjs$/.test(path)),
    "the CommonJS build must not publish the ESM-only rich-content modules"
  );
  assert.ok(
    !publishedPaths.some((path) => /\.(ts|tsx)$/.test(path) && !path.endsWith(".d.ts")),
    "the packed tarball must not include TypeScript sources"
  );

  for (const artifact of [
    "dist/cjs/index.cjs",
    "dist/esm/content.js",
    "dist/types/index.d.ts",
    "dist/types/content.d.ts",
    "dist/styles.css",
    "dist/theme.css",
  ]) {
    await access(join(consumerDir, "node_modules", "sherick-ui", artifact));
  }
  await access(join(consumerDir, "node_modules", "sherick-ui", "dist", "fonts", "KaTeX_Main-Regular.woff2"));

  console.log(`Packed package verification passed: ${packed[0].filename}`);
} finally {
  await rm(work, { recursive: true, force: true });
}
