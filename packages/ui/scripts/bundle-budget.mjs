#!/usr/bin/env node
/*
 Size-budget and tree-shaking gate.

 This is the single owner of Sherick UI's published size contract. It bundles small,
 representative consumer entry points against the package's own `exports` map (resolved
 through Node package self-reference, exactly as a consumer bundler would), then checks
 two things:

 1. module graph — a minimal primitive import must never reach rich-content code;
 2. transfer size — gzip size of each fixture must stay within its recorded budget.

 Publication fidelity is a different boundary and is proven separately by
 `scripts/verify-packed-package.mjs`. Update the recorded baseline with `--update`; treat
 every baseline increase as an architecture change that needs a reason.
*/

import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { build } from "esbuild";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = fileURLToPath(new URL("./bundle-budget.json", import.meta.url));
const update = process.argv.includes("--update");

const gzipSize = (buffer) => gzipSync(buffer, { level: 9 }).length;
const brotliSize = (buffer) => brotliCompressSync(buffer).length;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

/* Runtime dependencies that only the `sherick-ui/content` subpath may reach. Importing
   `Button` must never download a syntax highlighter or a Markdown pipeline. */
const richContentPattern =
  /(?:^|[\\/])node_modules[\\/](?:[^\\/]*[\\/])?(?:prismjs|prism-react-renderer|katex|react-markdown|remark-[^\\/]*|rehype-[^\\/]*|micromark[^\\/]*|mdast[^\\/]*|hast-[^\\/]*|unified|vfile[^\\/]*|unist-[^\\/]*|property-information|comma-separated-tokens|space-separated-tokens|html-url-attributes|trim-lines|longest-streak|ccount|character-entities[^\\/]*|decode-named-character-reference|devlop|estree-[^\\/]*|bail|trough|is-plain-obj|zwitch|web-namespaces|katex)[\\/]/;

/* Rich-content packages that must be present when `sherick-ui/content` is imported. Every
   entry is load-bearing for a rendering path, so a dependency quietly disappearing from the
   graph is a defect: `remark-math` plus `rehype-katex` are what turn `$…$` into a rendered
   equation, and `prism-react-renderer` plus `prismjs` are what tokenize a fenced block. */
const expectedRichContent = [
  "prism-react-renderer",
  "prismjs",
  "react-markdown",
  "remark-gfm",
  "remark-math",
  "rehype-katex",
  "katex",
];

const fixtures = {
  button: `import { Button } from "sherick-ui";\nexport default Button;\n`,
  form: `import { Button, Checkbox, Combobox, Field, Input, NumberField, RadioGroup, Select, Slider, Switch } from "sherick-ui";\nexport default [Button, Checkbox, Combobox, Field, Input, NumberField, RadioGroup, Select, Slider, Switch];\n`,
  overlay: `import { AlertDialog, Combobox, Dialog, Menu, Popover, Select, Tooltip } from "sherick-ui";\nexport default [AlertDialog, Combobox, Dialog, Menu, Popover, Select, Tooltip];\n`,
  toggles: `import { Chip, ChipGroup, Progress, SegmentedControl, ToggleGroup } from "sherick-ui";\nexport default [Chip, ChipGroup, Progress, SegmentedControl, ToggleGroup];\n`,
  barrel: `export * from "sherick-ui";\n`,
  content: `import { Markdown, CodeBlock } from "sherick-ui/content";\nexport const a = [Markdown, CodeBlock];\nexport * from "sherick-ui/content";\n`,
};

const bundleFixture = async (source) => {
  const result = await build({
    stdin: { contents: source, resolveDir: fileURLToPath(new URL("..", import.meta.url)), loader: "ts", sourcefile: "fixture.ts" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    target: "es2020",
    minify: true,
    metafile: true,
    external: ["react", "react-dom"],
    conditions: ["import", "browser", "default"],
    logLevel: "silent",
  });

  const [output] = Object.values(result.metafile.outputs);
  const included = Object.entries(output.inputs)
    .filter(([, value]) => value.bytesInOutput > 0)
    .map(([id]) => id);

  return { contents: result.outputFiles[0].contents, included, modules: included.length, bytes: output.bytes };
};

const measured = {};
const failures = [];

for (const [name, source] of Object.entries(fixtures)) {
  const { contents, included, modules, bytes } = await bundleFixture(source);
  const richContentModules = included.filter((id) => richContentPattern.test(id));
  const gzip = gzipSize(contents);
  const brotli = brotliSize(contents);
  measured[name] = { raw: bytes, gzip, brotli, modules };

  if (name === "content") {
    for (const dependency of expectedRichContent) {
      assert.ok(
        included.some((id) => id.includes(`/${dependency}/`)),
        `sherick-ui/content must include ${dependency}`
      );
    }
    assert.ok(richContentModules.length > 0, "sherick-ui/content must include the rich-content stack");
  } else {
    assert.deepEqual(
      richContentModules,
      [],
      `rich-content modules leaked into the "${name}" bundle — core exports must stay independent of the ` +
        `optional rich-content subpath:\n  ${richContentModules.join("\n  ")}`
    );
  }

  console.log(
    `${name.padEnd(8)} raw ${kb(bytes).padStart(10)}  gzip ${kb(gzip).padStart(9)}  brotli ${kb(brotli).padStart(9)}  modules ${String(modules).padStart(4)}`
  );
}

const stylesheetRoot = fileURLToPath(new URL("../dist", import.meta.url));
for (const [file, name] of [["styles.css", "stylesCss"], ["theme.css", "themeCss"]]) {
  const contents = await readFile(`${stylesheetRoot}/${file}`);
  measured[name] = { raw: contents.length, gzip: gzipSize(contents), brotli: brotliSize(contents), modules: 0 };
  console.log(
    `${name.padEnd(8)} raw ${kb(contents.length).padStart(10)}  gzip ${kb(gzipSize(contents)).padStart(9)}  brotli ${kb(brotliSize(contents)).padStart(9)}`
  );
}

if (update) {
  const definitions = {
    button:
      "Button alone through the root export. Guards against the root barrel pulling optional feature code.",
    form: "Representative form composition: Button, Checkbox, Combobox, Field, Input, NumberField, RadioGroup, Select, Slider, Switch.",
    overlay: "Representative overlay composition: AlertDialog, Combobox, Dialog, Menu, Popover, Select, Tooltip.",
    toggles: "Representative toggle composition: Chip, ChipGroup, Progress, SegmentedControl, ToggleGroup.",
    barrel: "The complete core root barrel with nothing tree-shaken beyond unused exports.",
    content: "The optional rich-content subpath: Markdown, CodeBlock and their full dependency stack.",
    stylesCss: "Published component stylesheet.",
    themeCss: "Published token-only theme stylesheet.",
  };
  const baseline = {
    $comment:
      "Recorded transfer sizes for the published package. Regenerate with `bun --filter sherick-ui test:bundle --update`; both a deliberate increase and a stale decrease need a reason in the pull request.",
    tolerance: 1.05,
    staleShrink: 0.2,
    budgets: Object.fromEntries(
      Object.entries(measured).map(([name, value]) => [
        name,
        { definition: definitions[name], raw: value.raw, gzip: value.gzip, brotli: value.brotli },
      ])
    ),
  };
  await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`Recorded size baseline in ${baselinePath}`);
} else {
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));
  const tolerance = baseline.tolerance ?? 1.05;
  const staleShrink = baseline.staleShrink ?? 0.2;

  for (const [name, budget] of Object.entries(baseline.budgets)) {
    const actual = measured[name];
    assert.ok(actual, `bundle fixture "${name}" disappeared; update the baseline deliberately`);

    for (const metric of ["raw", "gzip", "brotli"]) {
      const limit = Math.ceil(budget[metric] * tolerance);
      const detail = `${name} ${metric}: ${kb(actual[metric])} exceeds the recorded ${kb(budget[metric])} (limit ${kb(limit)}, tolerance ${Math.round((tolerance - 1) * 100)}%)`;
      if (actual[metric] > limit) failures.push(detail);
    }

    /* A budget far above what the fixture now weighs is a stale budget: it stops protecting
       anything and silently absorbs a later regression. gzip is the metric the budgets are
       stated in, so it is the one that decides staleness. */
    const shrink = 1 - actual.gzip / budget.gzip;
    if (shrink > staleShrink) {
      failures.push(
        `${name} gzip: ${kb(actual.gzip)} is ${Math.round(shrink * 100)}% below the recorded ${kb(budget.gzip)} — ` +
          `the budget is stale and would hide a future regression. Lower it with ` +
          `\`bun --filter sherick-ui test:bundle --update\`.`
      );
    }
  }

  assert.deepEqual(failures, [], `size budgets regressed or went stale:\n  ${failures.join("\n  ")}`);
  console.log("Bundle budgets and tree-shaking boundaries verified.");
}
