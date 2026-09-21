import assert from "node:assert/strict";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const fixtureRoot = fileURLToPath(new URL("./fixtures/packed/", import.meta.url));
const require = createRequire(new URL("../../../apps/no-tailwind/package.json", import.meta.url));
const playwrightVersion = require("@playwright/test/package.json").version;

const showcaseRequire = createRequire(new URL("../../../apps/showcase/package.json", import.meta.url));
const axeVersion = JSON.parse(
  await readFile(join(dirname(showcaseRequire.resolve("@axe-core/playwright")), "..", "package.json")),
).version;
export async function verifyConsumers({ consumerDir, work, tarball, run }) {
  // Browser tools are fixture dependencies, not library dependencies. Match the repository's
  // installed runner so the normal `playwright install` bootstrap also supplies this browser.
  run(
    "npm",
    [
      "install",
      "--no-audit",
      "--no-fund",
      `@playwright/test@${playwrightVersion}`,
      `@axe-core/playwright@${axeVersion}`,
    ],
    consumerDir,
  );
  const bin = (dir, name) => join(dir, "node_modules", ".bin", name);
  await cp(join(fixtureRoot, "App.jsx"), join(consumerDir, "App.jsx"));
  await cp(join(fixtureRoot, "host.css"), join(consumerDir, "host.css"));
  await mkdir(join(consumerDir, "tests"));
  await cp(join(fixtureRoot, "package.spec.mjs"), join(consumerDir, "tests", "package.spec.mjs"));
  await mkdir(join(consumerDir, "public"));
  await cp(join(consumerDir, "node_modules", "sherick-ui", "dist", "theme.css"), join(consumerDir, "public", "theme-only.css"));
  await writeFile(join(consumerDir, "public", "theme-only.html"), '<!doctype html><html><head><link rel="stylesheet" href="/theme-only.css"></head><body><div id="token" class="flex absolute" style="background:oklch(var(--sui-canvas))">Token only</div><button>Native</button></body></html>');
  await writeFile(join(consumerDir, "src", "main.jsx"), `import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App.jsx";
import "../host.css";
import "sherick-ui/styles.css";
createRoot(document.getElementById("root")).render(<App />);
`);
  await writeFile(join(consumerDir, "index.html"), '<!doctype html><html lang="en" dir="rtl"><head><title>Packed</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>');
  await writeFile(join(consumerDir, "playwright.config.mjs"), `export default {
  testDir: "./tests", workers: 1, use: { baseURL: "http://127.0.0.1:4317" },
  webServer: { command: "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4317 --strictPort", url: "http://127.0.0.1:4317", reuseExistingServer: false }
};`);
  await writeFile(join(consumerDir, "commonjs.cts"), `import ui = require("sherick-ui");
import dev = require("sherick-ui/dev");
const props: ui.ButtonProps = { children: "CJS" };
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
  const types = (dir) => {
    const common = ["--noEmit", "--strict", "--target", "ES2022"];
    run(bin(dir, "tsc"), [...common, "--jsx", "react-jsx", "--module", "NodeNext", "--moduleResolution", "NodeNext", "consumer.tsx", "public-types.tsx"], dir);
    run(bin(dir, "tsc"), [...common, "--module", "Node16", "--moduleResolution", "Node16", "commonjs.cts"], dir);
    run(bin(dir, "tsc"), [...common, "--jsx", "react-jsx", "--module", "ESNext", "--moduleResolution", "Bundler", "consumer.tsx", "public-types.tsx"], dir);
  };
  types(consumerDir);
  run(bin(consumerDir, "vite"), ["build"], consumerDir);
  run(bin(consumerDir, "playwright"), ["test"], consumerDir);
  // Run the existing budget owner against installed files, without workspace self-reference.
  run(process.execPath, [fileURLToPath(new URL("./bundle-budget.mjs", import.meta.url))], consumerDir,
    { env: { SHERICK_CONSUMER_DIR: consumerDir } });

  // A separate install at the React 18 peer floor; no Next peer range can lift that floor.
  const react18 = join(work, "react18");
  await mkdir(react18);
  await writeFile(join(react18, "package.json"), JSON.stringify({
    name: "packed-react18", private: true, type: "module", dependencies: {
      "sherick-ui": `file:${tarball}`, react: "18.0.0", "react-dom": "18.0.0",
      "@types/react": "18.3.27", "@types/react-dom": "18.3.7", typescript: "5.9.3",
      vite: "7.1.7", "@playwright/test": playwrightVersion, "@axe-core/playwright": axeVersion,
    },
  }));
  for (const file of ["esm.mjs", "cjs.cjs", "consumer.tsx", "public-types.tsx", "commonjs.cts", "App.jsx", "host.css", "src", "tests", "public", "index.html", "vite.config.mjs", "playwright.config.mjs"]) {
    await cp(join(consumerDir, file), join(react18, file), { recursive: true });
  }
  run("npm", ["install", "--no-audit", "--no-fund"], react18);
  run(process.execPath, ["esm.mjs"], react18);
  run(process.execPath, ["cjs.cjs"], react18);
  types(react18);
  run(bin(react18, "vite"), ["build"], react18);
  run(bin(react18, "playwright"), ["test"], react18);

  // Next tests passive server imports plus interactive client boundaries and real hydration.
  run("npm", ["install", "--no-audit", "--no-fund", "next@16.3.5"], consumerDir);
  await mkdir(join(consumerDir, "app"));
  await writeFile(join(consumerDir, "app", "layout.jsx"), `import "../host.css";
import "sherick-ui/styles.css";
export const metadata = { title: "Packed" };
export default function Layout({ children }) { return <html lang="en" dir="rtl"><body>{children}</body></html>; }
`);
  await writeFile(join(consumerDir, "app", "page.jsx"), `import { Card, Badge, Table } from "sherick-ui";
import App from "../App.jsx";
export default function Page() { return <><Card><Badge>Server-safe</Badge><Table headers={["Server"]} rows={[["Rendered"]]} /></Card><App /></>; }
`);
  // This lane is deliberately JavaScript; strict package declarations were checked above.
  // Do not feed the standalone NodeNext fixture config to Next's application compiler.
  await rm(join(consumerDir, "tsconfig.json"));
  await writeFile(join(consumerDir, "next.config.mjs"), 'export default { experimental: { cpus: 2 } };');
  await writeFile(join(consumerDir, "playwright.next.config.mjs"), `export default {
  testDir: "./tests", workers: 1, use: { baseURL: "http://127.0.0.1:4318" },
  webServer: { command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4318", url: "http://127.0.0.1:4318", reuseExistingServer: false }
};`);
  run(bin(consumerDir, "next"), ["build", "--webpack"], consumerDir);
  run(bin(consumerDir, "playwright"), ["test", "--config", "playwright.next.config.mjs"], consumerDir);

  // Both installed trees are ordinary directories, not workspace links. npm's dependency
  // validation fails on missing/invalid runtime peers instead of relying on repository hoists.
  for (const dir of [consumerDir, react18]) {
    run("npm", ["ls", "--omit=dev", "--all"], dir, { capture: true });
    const pkg = JSON.parse(await readFile(join(dir, "node_modules", "sherick-ui", "package.json")));
    assert.equal(pkg.name, "sherick-ui");
  }
  console.log("Packed React 18/19, Vite, Next, hydration, CSS and declaration matrix passed.");
}
