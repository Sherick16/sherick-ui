import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyConsumers } from "./packed-consumers.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const work = await mkdtemp(join(tmpdir(), "sherick-ui-packed-"));

const run = (command, args, cwd, options = {}) =>
  execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1", ...options.env },
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

  run("npm", ["install", "--no-audit", "--no-fund"], consumerDir);

  const esmFixture = `
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, Dialog, Select } from "sherick-ui";
import * as root from "sherick-ui";
import { CodeBlock } from "sherick-ui/content";
import ts from "typescript";

const dev = await import("sherick-ui/dev");
assert.equal(typeof dev.cn, "function");
assert.ok(dev.material, "dev recipe export should resolve");

// Compare every declared runtime export with the actual installed module, not selected names.
for (const [specifier, file] of [["sherick-ui", "index"], ["sherick-ui/content", "content"], ["sherick-ui/dev", "dev"]]) {
  const path = fileURLToPath(new URL("../types/" + file + ".d.ts", import.meta.resolve(specifier)));
  const program = ts.createProgram([path], { module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext });
  const checker = program.getTypeChecker();
  const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(path)));
  const values = exports.filter(symbol => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
    return target.flags & ts.SymbolFlags.Value;
  }).map(symbol => symbol.name).sort();
  assert.deepEqual(Object.keys(await import(specifier)).sort(), values, specifier + " runtime/declaration exports drifted");
}

for (const removed of ["ActionButton", "Dropdown", "Modal", "TabGroup", "Markdown", "CodeBlock"]) {
  assert.equal(root[removed], undefined, \`\${removed} must not be exported from the root barrel\`);
}

assert.equal(typeof Button, "object");
assert.equal(typeof Dialog, "object");
assert.equal(typeof Dialog.Header, "function");
assert.equal(typeof Dialog.Content, "function");
assert.equal(typeof Select, "object");
assert.equal(typeof root.DirectionProvider, "function");
assert.equal(renderToStaticMarkup(React.createElement(root.DirectionProvider, { direction: "rtl" }, "content")), "content");

/* Wave B publishes four floating surfaces through the same barrel. Each is one component with
   attached parts, and each must survive the packed build rather than only the workspace. */
for (const [name, parts] of [
  ["Accordion", ["Item", "Trigger", "Panel"]],
  ["Collapsible", ["Trigger", "Panel"]],
  ["Drawer", ["Trigger", "Content", "Header", "Description", "Footer", "Close"]],
  ["Popover", ["Trigger", "Content"]],
  ["Menu", ["Trigger", "Content", "Item", "Separator"]],
  ["ToggleGroup", ["Item"]],
  ["AlertDialog", []],
]) {
  assert.ok(
    ["function", "object"].includes(typeof root[name]),
    name + " must be exported from the root barrel"
  );
  for (const part of parts) {
    assert.ok(
      ["function", "object"].includes(typeof root[name][part]),
      name + "." + part + " must be a component"
    );
  }
}
assert.ok(root.Combobox, "ESM export missing Combobox");
for (const name of ["ToastProvider", "ToastViewport", "useToast", "createToastManager"]) {
  assert.equal(typeof root[name], "function", name + " must be a function");
}

/* An alert dialog's own semantics have to survive publication, and its surface has to render on
   the server for the state a consumer may server-render. */
assert.doesNotThrow(() =>
  renderToStaticMarkup(
    React.createElement(root.AlertDialog, {
      open: true,
      onOpenChange() {},
      title: "Delete package?",
      confirmLabel: "Delete",
    })
  )
);

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

/* A toggle chip holds its state in the primitive, so its pressed ARIA state is what proves the
   wiring survived publication. A chip with no selection prop is a tag and must not publish as a
   button at all. */
const { Chip, Progress, SegmentedControl, ToggleGroup } = root;
assert.match(
  renderToStaticMarkup(React.createElement(Chip, null, "Beta")),
  /^<span/,
  "a chip with no selection must publish as a tag, not as a button"
);
assert.match(
  renderToStaticMarkup(React.createElement(Chip, { value: "beta", defaultChecked: true }, "Beta")),
  /aria-pressed="true"/
);
assert.match(
  renderToStaticMarkup(
    React.createElement(ToggleGroup, { "aria-label": "View", defaultValue: ["list"] }, null)
  ),
  /role="group"/
);
assert.match(
  renderToStaticMarkup(
    React.createElement(SegmentedControl, {
      "aria-label": "View",
      defaultValue: "list",
      options: [{ value: "list", label: "List" }],
    })
  ),
  /aria-pressed="true"/
);
/* Base owns the meter role and the value boundaries; the packed build has to carry both. */
const determinate = renderToStaticMarkup(
  React.createElement(Progress, { value: 40, max: 100, label: "Uploading" })
);
assert.match(determinate, /role="progressbar"/);
assert.match(determinate, /aria-valuenow="40"/);
assert.doesNotMatch(
  renderToStaticMarkup(React.createElement(Progress, { value: null, label: "Working" })),
  /aria-valuenow/
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
const dev = require("sherick-ui/dev");
assert.equal(typeof dev.cn, "function");
const React = require("react");
assert.match(require("react-dom/server").renderToStaticMarkup(React.createElement(ui.Button, null, "CJS SSR")), /CJS SSR/);

assert.ok(ui.Button, "CommonJS export missing Button");
assert.ok(ui.Dialog, "CommonJS export missing Dialog");
assert.ok(ui.Select, "CommonJS export missing Select");
assert.ok(ui.Tabs, "CommonJS export missing Tabs");
assert.ok(ui.Popover, "CommonJS export missing Popover");
assert.ok(ui.Menu, "CommonJS export missing Menu");
assert.ok(ui.Combobox, "CommonJS export missing Combobox");
assert.ok(ui.Chip, "CommonJS export missing Chip");
assert.ok(ui.ChipGroup, "CommonJS export missing ChipGroup");
assert.ok(ui.Progress, "CommonJS export missing Progress");
assert.ok(ui.SegmentedControl, "CommonJS export missing SegmentedControl");
assert.ok(ui.ToggleGroup, "CommonJS export missing ToggleGroup");
assert.ok(ui.Accordion, "CommonJS export missing Accordion");
assert.ok(ui.Collapsible, "CommonJS export missing Collapsible");
assert.ok(ui.Drawer, "CommonJS export missing Drawer");
assert.ok(ui.ToastProvider, "CommonJS export missing ToastProvider");
assert.ok(ui.ToastViewport, "CommonJS export missing ToastViewport");
assert.ok(ui.useToast, "CommonJS export missing useToast");
assert.ok(ui.createToastManager, "CommonJS export missing createToastManager");
assert.ok(ui.AlertDialog, "CommonJS export missing AlertDialog");
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
  assert.deepEqual(Object.keys(await import("sherick-ui")).sort(), Object.keys(ui).sort());
  assert.deepEqual(Object.keys(await import("sherick-ui/dev")).sort(), Object.keys(dev).sort());
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
  Accordion,
  AlertDialog,
  Button,
  Chip,
  ChipGroup,
  Collapsible,
  Combobox,
  Dialog,
  Drawer,
  Input,
  Menu,
  Popover,
  Progress,
  Search,
  SegmentedControl,
  Select,
  Switch,
  Tabs,
  Textarea,
  ToastProvider,
  ToastViewport,
  ToggleGroup,
  createToastManager,
  type AccordionHeadingLevel,
  type AccordionProps,
  type AlertDialogProps,
  type AlertProps,
  type ButtonProps,
  type ChipGroupProps,
  type ChipProps,
  type CollapsibleProps,
  type ComboboxOption,
  type ComboboxProps,
  type DialogProps,
  type DrawerProps,
  type DrawerSide,
  type MenuItemProps,
  type MenuProps,
  type PopoverProps,
  type ProgressProps,
  type InputProps,
  type SearchProps,
  type SegmentedControlProps,
  type SelectProps,
  type SkeletonProps,
  type SpinnerProps,
  type SwitchProps,
  type TabsProps,
  type ToastActionOptions,
  type ToastManager,
  type ToastOptions,
  type ToastPosition,
  type ToastPromiseOptions,
  type ToastProviderProps,
  type ToastType,
  type ToastUpdateOptions,
  type ToastViewportProps,
  type ToggleGroupItemProps,
  type ToggleGroupProps,
} from "sherick-ui";
import { CodeBlock, Markdown, type CodeBlockProps, type MarkdownProps } from "sherick-ui/content";

const buttonProps: ButtonProps = { children: "Save", appearance: "filled" };
const selectProps: SelectProps = {
  options: [{ label: "Design", value: "design" }],
  defaultValue: "design",
  onValueChange(_value, eventDetails) {
    void eventDetails.reason;
  },
};
const inputProps: InputProps = {
  label: "Name",
  description: "Helper",
  error: true,
  errorMessage: "Invalid",
  onValueChange(_value, eventDetails) {
    void eventDetails.reason;
  },
};
const searchProps: SearchProps = {
  onSearch() {},
  onValueChange(_value, eventDetails) {
    void eventDetails.reason;
  },
};
const switchProps: SwitchProps = {
  checked: true,
  onCheckedChange(_checked, eventDetails) {
    void eventDetails.reason;
  },
  name: "enabled",
  value: "yes",
};
/* An uncontrolled Switch is part of the public contract: omitting the checked prop must
   leave the control uncontrolled, and defaultChecked must be honored. */
const uncontrolledSwitchProps: SwitchProps = { defaultChecked: true, onCheckedChange() {} };
const tabsProps: TabsProps = {
  value: "one",
  onValueChange(_value, eventDetails) {
    void eventDetails.reason;
  },
  tabs: [{ id: "one", label: "One", content: "Panel" }],
};
const dialogProps: DialogProps = {
  defaultOpen: true,
  onOpenChange(_open, eventDetails) {
    void eventDetails.reason;
  },
  children: null,
};
const comboboxProps: ComboboxProps = {
  options: [{ label: "Design", value: "design", disabled: false }],
  value: "design",
  onValueChange(value: string | null, eventDetails) {
    void value;
    void eventDetails.reason;
  },
};
const comboboxOption: ComboboxOption = { label: "Design", value: "design" };
const popoverProps: PopoverProps = { defaultOpen: true, onOpenChange() {}, children: null };
const menuItemProps: MenuItemProps = { children: "Rename", variant: "danger" };
const menuProps: MenuProps = { defaultOpen: true, onOpenChange() {}, children: null };
const alertDialogProps: AlertDialogProps = {
  defaultOpen: true,
  onOpenChange() {},
  title: "Delete package?",
  confirmLabel: "Delete",
};
const markdownProps: MarkdownProps = { children: "# Title" };
const codeBlockProps: CodeBlockProps = { language: "ts", children: "const a = 1;" };
const alertProps: AlertProps = { children: "Notice", onDismiss() {} };
const skeletonProps: SkeletonProps = { "aria-label": "Loading" };
const spinnerProps: SpinnerProps = { size: "small" };
/* A chip is a toggle when it is given a selection contract and a tag when it is not; both shapes
   are part of the published contract. */
const chipToggleProps: ChipProps = {
  children: "Design",
  value: "design",
  defaultChecked: true,
  onCheckedChange(pressed: boolean) {
    void pressed;
  },
};
const chipTagProps: ChipProps = { children: "Beta", variant: "warning", onRemove() {} };
const chipGroupProps: ChipGroupProps = {
  children: null,
  multiple: true,
  defaultValue: ["design"],
  onValueChange(values: string[]) {
    void values;
  },
};
const toggleGroupProps: ToggleGroupProps = {
  children: null,
  multiple: true,
  defaultValue: ["list"],
  onValueChange(values: string[]) {
    void values;
  },
};
const toggleGroupItemProps: ToggleGroupItemProps = {
  value: "list",
  variant: "primary",
  children: "List",
};
const segmentedControlProps: SegmentedControlProps = {
  options: [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid", disabled: false },
  ],
  defaultValue: "list",
  onValueChange(value: string) {
    void value;
  },
};
const progressProps: ProgressProps = {
  value: 40,
  max: 100,
  label: "Uploading",
  showValue: true,
  variant: "primary",
};
const indeterminateProgressProps: ProgressProps = { value: null, label: "Working" };
const accordionProps: AccordionProps = {
  children: null,
  multiple: true,
  defaultValue: ["one"],
  headingLevel: 3,
  onValueChange(value) {
    void value;
  },
};
const accordionHeadingLevel: AccordionHeadingLevel = 2;
const collapsibleProps: CollapsibleProps = {
  children: null,
  defaultOpen: true,
  onOpenChange(open) {
    void open;
  },
};
const drawerProps: DrawerProps = {
  children: null,
  defaultOpen: true,
  side: "right",
  onOpenChange(open, details) {
    void open;
    void details;
  },
};
const drawerSide: DrawerSide = "bottom";
const toastProviderProps: ToastProviderProps = {
  children: null,
  limit: 3,
  timeout: 5000,
};
const toastViewportProps: ToastViewportProps = { position: "bottom-end" };
const toastType: ToastType = "success";
const toastPosition: ToastPosition = "top-start";
const toastManager: ToastManager = createToastManager();
const toastOptions: ToastOptions = {
  type: "success",
  title: "Saved",
  description: "Every change was stored.",
  actionProps: { children: "Undo" },
};
const toastActionOptions: ToastActionOptions = { children: "Undo" };
const toastUpdateOptions: ToastUpdateOptions = { title: "Saved again" };
const toastPromiseOptions: ToastPromiseOptions<string> = {
  loading: "Saving",
  success: (result) => ({ description: result }),
  error: { title: "Failed", type: "danger" },
};
void alertProps;
void comboboxOption;
void skeletonProps;
void spinnerProps;
void chipToggleProps;
void chipTagProps;
void chipGroupProps;
void toggleGroupProps;
void toggleGroupItemProps;
void segmentedControlProps;
void progressProps;
void indeterminateProgressProps;
void accordionProps;
void accordionHeadingLevel;
void collapsibleProps;
void drawerProps;
void drawerSide;
void toastProviderProps;
void toastViewportProps;
void toastType;
void toastPosition;
void toastManager;
void toastOptions;
void toastActionOptions;
void toastUpdateOptions;
void toastPromiseOptions;

export const fixture = (
  <>
    <Button {...buttonProps} />
    <Input {...inputProps} onChange={(event) => void event.currentTarget.value} />
    <Textarea
      label="Body"
      onChange={(event) => void event.currentTarget.value}
      onValueChange={(_value, eventDetails) => void eventDetails.reason}
    />
    <Search {...searchProps} />
    <Select {...selectProps} />
    <Combobox {...comboboxProps} />
    <Popover {...popoverProps}>
      <Popover.Content>Body</Popover.Content>
    </Popover>
    <Menu {...menuProps}>
      <Menu.Item {...menuItemProps} />
    </Menu>
    <AlertDialog {...alertDialogProps} />
    <Switch {...switchProps} />
    <Switch {...uncontrolledSwitchProps} aria-label="Uncontrolled" />
    <Tabs {...tabsProps} />
    <Chip {...chipToggleProps} />
    <Chip {...chipTagProps} />
    <ChipGroup {...chipGroupProps}>
      <Chip value="design">Design</Chip>
    </ChipGroup>
    <ToggleGroup {...toggleGroupProps}>
      <ToggleGroup.Item {...toggleGroupItemProps} />
    </ToggleGroup>
    <SegmentedControl {...segmentedControlProps} />
    <Progress {...progressProps} />
    <Progress {...indeterminateProgressProps} />
    <Dialog {...dialogProps}>
      <Dialog.Header>Title</Dialog.Header>
      <Dialog.Content>Body</Dialog.Content>
      <Dialog.Footer>Actions</Dialog.Footer>
    </Dialog>
    <Accordion {...accordionProps}>
      <Accordion.Item value="one">
        <Accordion.Trigger>One</Accordion.Trigger>
        <Accordion.Panel>Panel</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
    <Collapsible {...collapsibleProps}>
      <Collapsible.Trigger>Details</Collapsible.Trigger>
      <Collapsible.Panel>Body</Collapsible.Panel>
    </Collapsible>
    <Drawer {...drawerProps}>
      <Drawer.Trigger render={<Button>Open</Button>} />
      <Drawer.Content>
        <Drawer.Header>Sheet</Drawer.Header>
        <Drawer.Description>Copy</Drawer.Description>
        <Drawer.Footer>
          <Drawer.Close render={<Button>Close</Button>} />
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
    <ToastProvider
      limit={toastProviderProps.limit}
      timeout={toastProviderProps.timeout}
      manager={toastManager}
    >
      <ToastViewport {...toastViewportProps} />
    </ToastProvider>
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
  /* This consumer deliberately imports the optional rich-content subpath, so its single
     chunk is legitimately large. The warning limit is raised instead of code-splitting a
     fixture whose only job is to prove both entries build with no Tailwind present. */
  await writeFile(
    join(consumerDir, "vite.config.mjs"),
    'export default { build: { chunkSizeWarningLimit: 1024 } };\n'
  );

  run(process.execPath, ["esm.mjs"], consumerDir);
  run(process.execPath, ["cjs.cjs"], consumerDir);
  await verifyConsumers({ consumerDir, work, tarball, run });

  const installedPackage = JSON.parse(
    await readFile(join(consumerDir, "node_modules", "sherick-ui", "package.json"), "utf8")
  );
  assert.equal(installedPackage.main, "dist/cjs/index.cjs");
  assert.equal(installedPackage.style, "dist/styles.css");
  assert.equal(installedPackage.exports["."].require.default, "./dist/cjs/index.cjs");
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
  for (const path of publishedPaths.filter((path) => path.endsWith(".map"))) {
    const map = JSON.parse(await readFile(join(consumerDir, "node_modules", "sherick-ui", path), "utf8"));
    assert.ok(map.sources.every((_, index) => typeof map.sourcesContent?.[index] === "string"), `${path} must embed its unpublished sources`);
  }
  assert.ok(publishedPaths.includes("dist/KaTeX-LICENSE"), "redistributed KaTeX assets need their license");
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
  if (process.env.KEEP_PACKED_CONSUMERS) console.log(`Packed consumer artifacts retained: ${work}`);
  else await rm(work, { recursive: true, force: true });
}
