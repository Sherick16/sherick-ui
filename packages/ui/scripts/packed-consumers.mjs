import assert from "node:assert/strict";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const fixtureRoot = fileURLToPath(new URL("./fixtures/packed/", import.meta.url));
const require = createRequire(new URL("../../../apps/no-tailwind/package.json", import.meta.url));
// Browser tools are fixture dependencies, not library dependencies. Match the repository's
// installed runner so the normal `playwright install` bootstrap also supplies this browser.
export const playwrightVersion = require("@playwright/test/package.json").version;

const showcaseRequire = createRequire(new URL("../../../apps/showcase/package.json", import.meta.url));
export const axeVersion = JSON.parse(
  await readFile(join(dirname(showcaseRequire.resolve("@axe-core/playwright")), "..", "package.json")),
).version;

// Each lane serves its fixture on a port nothing else holds, so lanes and parallel runs never meet.
const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer().once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });

const playwrightConfig = (port, server) => `export default {
  testDir: "./tests", workers: 1, use: { baseURL: "http://127.0.0.1:${port}" },
  webServer: { command: "${server}", url: "http://127.0.0.1:${port}", reuseExistingServer: false }
};`;

/* Three consumers install the same tarball: React 19 with Vite, React 18 with Vite, and React 19
   with Next. Each lane owns its directory, so the three run at the same time. */
export async function verifyConsumers({ consumerDir, work, tarball, run, stop }) {
  const bin = (dir, name) => join(dir, "node_modules", ".bin", name);
  await cp(join(fixtureRoot, "App.jsx"), join(consumerDir, "App.jsx"));
  await cp(join(fixtureRoot, "host.css"), join(consumerDir, "host.css"));
  await cp(join(fixtureRoot, "v21-types.tsx"), join(consumerDir, "v21-types.tsx"));
  await mkdir(join(consumerDir, "tests"));
  await cp(join(fixtureRoot, "package.spec.mjs"), join(consumerDir, "tests", "package.spec.mjs"));
  await mkdir(join(consumerDir, "public"));
  await writeFile(join(consumerDir, "public", "theme-only.html"), '<!doctype html><html><head><link rel="stylesheet" href="/theme-only.css"></head><body><div id="token" class="flex absolute" style="background:oklch(var(--sui-canvas))">Token only</div><button>Native</button></body></html>');
  await writeFile(join(consumerDir, "src", "main.jsx"), `import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App.jsx";
import "../host.css";
import "sherick-ui/styles.css";
createRoot(document.getElementById("root")).render(<App />);
`);
  await writeFile(join(consumerDir, "index.html"), '<!doctype html><html lang="en" dir="rtl"><head><title>Packed</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>');
  const vitePreview = (port) => playwrightConfig(port, `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${port} --strictPort`);
  await writeFile(join(consumerDir, "playwright.config.mjs"), vitePreview(await freePort()));
  await writeFile(join(consumerDir, "commonjs.cts"), `import ui = require("sherick-ui");
import dev = require("sherick-ui/dev");
const props: ui.ButtonProps = { children: "CJS" };
const range: ui.DateRange = { start: "2024-06-10", end: null };
const calendar: ui.CalendarProps = { mode: "range", value: range };
const upload: ui.FileUploadProps = { label: "Files", onFilesChange: files => void files };
console.log(ui.Calendar, ui.DatePicker, ui.DateRangePicker, ui.DateTimePicker, ui.Command, ui.CommandPalette, ui.Pagination, ui.Breadcrumb, ui.FileUpload, ui.Stepper, ui.TreeView, calendar, upload);
console.log(ui.Button, dev.cn(props.children));
`);
  await writeFile(join(consumerDir, "public-types.tsx"), `import * as React from "react";
import { Button, Input, Select, DirectionProvider, Menu, Popover,
  type MenuTriggerProps, type PopoverTriggerProps, type DirectionProviderProps } from "sherick-ui";
import { cn } from "sherick-ui/dev";
const menu: MenuTriggerProps = { render: <Button>Menu</Button> };
const popover: PopoverTriggerProps = { render: <Button>Popover</Button> };
const direction: DirectionProviderProps = { direction: "rtl", children: null };
export const fixture = <DirectionProvider {...direction}><Menu.Trigger {...menu}/><Popover.Trigger {...popover}/>
<Button ref={React.createRef<HTMLButtonElement>()} className={cn("w-full")}>Save</Button>
<Input ref={React.createRef<HTMLInputElement>()} onChange={event => void event.currentTarget.value} />
<Select ref={React.createRef<HTMLButtonElement>()} options={[]} onValueChange={value => { const checked: string | null = value; void checked; }} />
</DirectionProvider>;
// @ts-expect-error removed alias is not consumer API
import { ActionButton } from "sherick-ui";
// @ts-expect-error rich content is not a core export
import { Markdown } from "sherick-ui";
// @ts-expect-error wrong DOM ref must be rejected
export const invalidRef = <Button ref={React.createRef<HTMLInputElement>()}>Invalid</Button>;
`);
  const types = (lane, dir) => {
    const common = ["--noEmit", "--strict", "--target", "ES2022"];
    return Promise.all([
      run(lane, bin(dir, "tsc"), [...common, "--jsx", "react-jsx", "--module", "NodeNext", "--moduleResolution", "NodeNext", "consumer.tsx", "public-types.tsx", "v21-types.tsx"], dir),
      run(lane, bin(dir, "tsc"), [...common, "--module", "Node16", "--moduleResolution", "Node16", "commonjs.cts"], dir),
      run(lane, bin(dir, "tsc"), [...common, "--jsx", "react-jsx", "--module", "ESNext", "--moduleResolution", "Bundler", "consumer.tsx", "public-types.tsx", "v21-types.tsx"], dir),
    ]);
  };
  // Server, CommonJS, declaration and production-browser checks against one installed tree.
  const consumerChecks = (lane, dir) =>
    Promise.all([
      run(lane, process.execPath, ["esm.mjs"], dir),
      run(lane, process.execPath, ["cjs.cjs"], dir),
      types(lane, dir),
      run(lane, bin(dir, "vite"), ["build"], dir).then(() => run(lane, bin(dir, "playwright"), ["test"], dir)),
    ]);
  const fixtureFiles = ["esm.mjs", "cjs.cjs", "consumer.tsx", "public-types.tsx", "v21-types.tsx", "commonjs.cts", "App.jsx", "host.css", "src", "tests", "public", "index.html", "vite.config.mjs"];
  const copyFixture = (dir) => Promise.all(fixtureFiles.map((file) => cp(join(consumerDir, file), join(dir, file), { recursive: true })));
  const consumerPackage = JSON.parse(await readFile(join(consumerDir, "package.json"), "utf8"));
  // The token-only page is served the installed `theme.css`, so each lane installs before its fixture is complete.
  const install = async (lane, dir) => {
    await run(lane, "npm", ["install", "--no-audit", "--no-fund"], dir);
    await cp(join(dir, "node_modules", "sherick-ui", "dist", "theme.css"), join(dir, "public", "theme-only.css"));
  };
  // npm's dependency validation fails on missing/invalid runtime peers instead of relying on
  // repository hoists: each installed tree is an ordinary directory, not a workspace link.
  const validateTree = async (lane, dir) => {
    await run(lane, "npm", ["ls", "--omit=dev", "--all"], dir, { capture: true });
    const pkg = JSON.parse(await readFile(join(dir, "node_modules", "sherick-ui", "package.json")));
    assert.equal(pkg.name, "sherick-ui");
  };

  const react19 = async () => {
    await install("react19", consumerDir);
    await Promise.all([
      consumerChecks("react19", consumerDir),
      // Run the existing budget owner against installed files, without workspace self-reference.
      run("react19", process.execPath, [fileURLToPath(new URL("./bundle-budget.mjs", import.meta.url))], consumerDir,
        { env: { SHERICK_CONSUMER_DIR: consumerDir } }),
    ]);
    await validateTree("react19", consumerDir);
  };

  // A separate install at the React 18 peer floor; no Next peer range can lift that floor.
  const react18Dir = join(work, "react18");
  await mkdir(react18Dir);
  await writeFile(join(react18Dir, "package.json"), JSON.stringify({
    name: "packed-react18", private: true, type: "module", dependencies: {
      "sherick-ui": `file:${tarball}`, react: "18.0.0", "react-dom": "18.0.0",
      "@types/react": "18.3.27", "@types/react-dom": "18.3.7", typescript: "5.9.3",
      vite: "7.1.7", "@playwright/test": playwrightVersion, "@axe-core/playwright": axeVersion,
    },
  }));
  await copyFixture(react18Dir);
  await writeFile(join(react18Dir, "playwright.config.mjs"), vitePreview(await freePort()));
  const react18 = async () => {
    await install("react18", react18Dir);
    await consumerChecks("react18", react18Dir);
    await validateTree("react18", react18Dir);
  };

  // Next tests passive server imports plus interactive client boundaries and real hydration.
  const nextDir = join(work, "next");
  await mkdir(nextDir);
  await writeFile(join(nextDir, "package.json"), JSON.stringify({
    ...consumerPackage,
    dependencies: { ...consumerPackage.dependencies, next: "16.3.5" },
  }));
  await copyFixture(nextDir);
  await mkdir(join(nextDir, "app"));
  await writeFile(join(nextDir, "app", "layout.jsx"), `import "../host.css";
import "sherick-ui/styles.css";
export const metadata = { title: "Packed" };
export default function Layout({ children }) { return <html lang="en" dir="rtl"><body>{children}</body></html>; }
`);
  await writeFile(join(nextDir, "app", "page.jsx"), `import { Card, Badge, Table } from "sherick-ui";
import App from "../App.jsx";
export default function Page() { return <><Card><Badge>Server-safe</Badge><Table headers={["Server"]} rows={[["Rendered"]]} /></Card><App /></>; }
`);
  // This lane is deliberately JavaScript; strict package declarations were checked above.
  // It has no tsconfig: the standalone NodeNext fixture config is not for Next's application compiler.
  await writeFile(join(nextDir, "next.config.mjs"), 'export default { experimental: { cpus: 2 } };');
  const nextPort = await freePort();
  await writeFile(join(nextDir, "playwright.next.config.mjs"), playwrightConfig(nextPort,
    `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${nextPort}`));
  const next = async () => {
    await install("next", nextDir);
    await run("next", bin(nextDir, "next"), ["build", "--webpack"], nextDir);
    await run("next", bin(nextDir, "playwright"), ["test", "--config", "playwright.next.config.mjs"], nextDir);
    await validateTree("next", nextDir);
  };

  // The first failure stops the other lanes, which settle before the work directory is removed.
  let failure;
  await Promise.allSettled(
    [react19, react18, next].map((lane) => lane().catch((error) => {
      failure ??= error;
      stop();
    })),
  );
  if (failure) throw failure;
  console.log("Packed React 18/19, Vite, Next, hydration, CSS and declaration matrix passed.");
}
