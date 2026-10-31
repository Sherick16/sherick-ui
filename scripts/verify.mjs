#!/usr/bin/env node
/* `bun run verify`: the repository's full verification suite, run as one dependency graph.

   A task starts as soon as the tasks it reads from have passed, so the lint, type, package and
   browser checks share the machine instead of waiting in one line. A task's output is held and
   printed in one block, never interleaved, and saved under `node_modules/.cache/verify/logs`. The
   first failure stops every running task with its whole process tree, and the run exits non-zero;
   `--keep-going` lets the tasks that do not depend on the failure finish.

   Outside CI a task that passed does not run again until one of its inputs changes. Its key hashes
   the task's files (tracked and untracked, not ignored), the root manifest, lockfile, patches and
   scripts, the installed dependency store and links, the Playwright browsers, the tool versions,
   the environment variables the tools read and the keys of the tasks it reads from. A build must
   also find its output exactly as it left it. `--force` runs every task, and is needed after a hand
   edit inside `node_modules`; CI never reads the cache.

   Usage: bun run verify [task ...] [--skip=task,...] [--shard=i/n] [--force] [--keep-going] [--list]
   `--shard` passes through to the browser suites, which split their tests across CI jobs. */
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, readlink, realpath, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { availableParallelism, homedir } from "node:os";
import { delimiter, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ui = "packages/ui";
const showcase = "apps/showcase";
const consumer = "apps/no-tailwind";

/* A task runs its package's script, so a check's flags stay with the package that owns it.
   `inputs` are the paths (or git exclude pathspecs) whose files key the cache, beside the keys of
   `deps`; `generated` are directories git ignores that the task still reads, keyed by content;
   `outputs` are what a build has to still hold for its cached pass to count. A browser
   task's `workers` is its share of the Playwright workers the run hands out, and `specs` is the
   directory whose spec files it keys one by one: when nothing else changed, it runs only the spec
   files that changed since they last passed. The builds leave the tests out of their inputs because
   no test is part of what they build; the typechecks and lints still read them. */
export const tasks = [
  { name: "lint:ui", cwd: ui, script: "lint", inputs: [ui] },
  { name: "typecheck:ui", cwd: ui, script: "typecheck", inputs: [ui] },
  { name: "build:ui", cwd: ui, script: "build", inputs: [ui], outputs: [`${ui}/dist`] },
  // After the build, so the motion policy reads the compiled stylesheet's hover guards.
  { name: "motion", cwd: ui, script: "test:motion", deps: ["build:ui"], inputs: [ui] },
  { name: "smoke", cwd: ui, script: "test", deps: ["build:ui"], inputs: [ui] },
  { name: "bundle", cwd: ui, script: "test:bundle", deps: ["build:ui"], inputs: [ui] },
  { name: "visual", cwd: ui, script: "visual", deps: ["build:ui"], inputs: [ui] },
  {
    name: "packed",
    cwd: ui,
    script: "test:packed",
    deps: ["build:ui"],
    // The consumers pin the browser tools the apps install.
    inputs: [ui, `${showcase}/package.json`, `${consumer}/package.json`],
  },
  { name: "lint:showcase", cwd: showcase, script: "lint", deps: ["build:ui"], inputs: [showcase, "examples"] },
  {
    name: "build:showcase",
    cwd: showcase,
    script: "build",
    deps: ["build:ui"],
    inputs: [showcase, "examples", `:(exclude)${showcase}/tests`],
    // `next dev` rewrites the ignored `next-env.d.ts` the typecheck reads; the build writes it back.
    outputs: [`${showcase}/.next`, `${showcase}/next-env.d.ts`],
  },
  // After the build, which generates the route types `next-env.d.ts` imports.
  {
    name: "typecheck:showcase",
    cwd: showcase,
    script: "typecheck",
    deps: ["build:showcase"],
    inputs: [showcase, "examples"],
    // `next dev` writes route types there that the tsconfig includes, outside the build's output.
    generated: [`${showcase}/.next/dev/types`],
  },
  {
    name: "browser:showcase",
    cwd: showcase,
    script: "test:browser",
    deps: ["build:showcase"],
    inputs: [showcase, "examples"],
    specs: `${showcase}/tests/browser`,
    workers: 2,
  },
  { name: "typecheck:no-tailwind", cwd: consumer, script: "typecheck", deps: ["build:ui"], inputs: [consumer] },
  {
    name: "build:no-tailwind",
    cwd: consumer,
    script: "build",
    deps: ["build:ui"],
    inputs: [consumer, `:(exclude)${consumer}/tests`],
    outputs: [`${consumer}/dist`],
  },
  {
    name: "browser:no-tailwind",
    cwd: consumer,
    script: "test:browser",
    deps: ["build:no-tailwind"],
    inputs: [consumer],
    specs: `${consumer}/tests`,
    workers: 1,
  },
  { name: "runner", cwd: ".", command: ["node", "--test", "scripts/verify.test.mjs"], inputs: ["scripts"] },
];

/* Every browser worker drives a browser and shares the app server, so about two workers fit in
   three cores; the rest of the graph runs beside them. More workers drop animation frames that the
   motion tests sample. */
const BROWSER_SHARE = 2 / 3;
// Build output a later command may rewrite without changing what the build produced.
const VOLATILE_OUTPUT = new Set(["cache", "dev", "trace", "trace-build"]);
/* The environment variables the tools and the suite read. A shell's own variables stay out of the
   key, so a pass carries over between terminals, and so do the user agent and prefix `bun run`
   sets for npm. */
const KEYED_ENV =
  /^(CI|TZ|LANG|LC_\w+|DEBUG|NODE_\w+|BUN_\w+|NEXT_\w+|VITE_\w+|PLAYWRIGHT_\w+|PW_\w+|WEBKIT_\w+|SHERICK_\w+|VISUAL_REVIEW|KEEP_PACKED_CONSUMERS|NPM_CONFIG_\w+|npm_config_(?!user_agent$|local_prefix$)\w+)$/;
const STOP_GRACE_MS = 5_000;

const sha = (...parts) => {
  const hash = createHash("sha256");
  for (const part of parts) hash.update(part).update("\0");
  return hash.digest("hex");
};

const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer().once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });

function parseArgs(argv) {
  const options = { targets: [], skip: [], force: false, keepGoing: false, list: false };
  for (const arg of argv) {
    if (arg.startsWith("--skip=")) options.skip.push(...arg.slice("--skip=".length).split(","));
    else if (arg.startsWith("--shard=")) options.shard = arg;
    else if (arg === "--force") options.force = true;
    else if (arg === "--keep-going") options.keepGoing = true;
    else if (arg === "--list") options.list = true;
    else if (arg.startsWith("-")) throw new Error(`Unknown option ${arg}`);
    else options.targets.push(arg);
  }
  return options;
}

/* The named tasks, or every task not skipped, and everything they read from, in declaration order.
   A skipped task still runs when a selected task reads from it. */
function select(graph, targets, skip) {
  const byName = new Map(graph.map((task) => [task.name, task]));
  const chosen = new Set();
  const visit = (name) => {
    const task = byName.get(name);
    if (!task) throw new Error(`Unknown task ${name}; \`--list\` shows the tasks`);
    if (chosen.has(task)) return;
    chosen.add(task);
    task.deps?.forEach(visit);
  };
  skip.forEach((name) => {
    if (!byName.has(name)) throw new Error(`Unknown task ${name}; \`--list\` shows the tasks`);
  });
  (targets.length ? targets : graph.map((task) => task.name).filter((name) => !skip.includes(name))).forEach(visit);
  return graph.filter((task) => chosen.has(task));
}

function createCache(root) {
  const git = (args) => execFileSync("git", args, { cwd: root, maxBuffer: 256 << 20 }).toString();

  /* `[file, hash]` for every tracked or untracked, not ignored, file under `paths`, the `.env` files
     a framework reads from a directory's root even though they are ignored, and every file under
     the `generated` directories. */
  async function hashFiles(paths, generated = []) {
    const listed = paths.length ? git(["ls-files", "-z", "-co", "--exclude-standard", "--", ...paths]).split("\0").filter(Boolean) : [];
    for (const path of paths.filter((path) => !path.startsWith(":"))) {
      const names = await readdir(join(root, path)).catch(() => []);
      listed.push(...names.filter((name) => name.startsWith(".env")).map((name) => `${path}/${name}`));
    }
    for (const dir of generated) {
      const entries = await readdir(join(root, dir), { recursive: true, withFileTypes: true }).catch(() => []);
      listed.push(...entries.filter((entry) => entry.isFile()).map((entry) => relative(root, join(entry.parentPath, entry.name))));
    }
    const files = [...new Set(listed)].sort();
    const contents = await Promise.all(files.map((file) => readFile(join(root, file)).then(sha, () => "missing")));
    return files.map((file, index) => [file, contents[index]]);
  }
  const digest = (hashes) => sha(...hashes.flat());

  // Every workspace's installed dependency links with their targets, which an install rewrites.
  async function installed() {
    const manifest = await readFile(join(root, "package.json"), "utf8").catch(() => "{}");
    const workspaces = await Promise.all(
      (JSON.parse(manifest).workspaces ?? []).map(async (pattern) => {
        const parent = pattern.replace(/\/\*$/, "");
        return (await readdir(join(root, parent)).catch(() => [])).map((name) => join(parent, name));
      })
    );
    const lines = [];
    const visit = async (dir) => {
      for (const entry of await readdir(join(root, dir), { withFileTypes: true }).catch(() => [])) {
        const path = join(dir, entry.name);
        if (entry.name.startsWith(".")) continue;
        if (entry.name.startsWith("@") && entry.isDirectory()) await visit(path);
        else lines.push(`${path} ${entry.isSymbolicLink() ? await readlink(join(root, path)) : "copy"}`);
      }
    };
    for (const dir of ["", ...workspaces.flat()]) await visit(join(dir, "node_modules"));
    return lines.sort();
  }

  // The file a command on `PATH` resolves to, which names the installed version for most installs.
  async function onPath(command) {
    for (const dir of (process.env.PATH ?? "").split(delimiter)) {
      const path = await realpath(join(dir, command)).catch(() => null);
      if (path) return path;
    }
    return "none";
  }

  async function environment() {
    const names = async (dir) => (await readdir(dir).catch(() => [])).sort().join("\n");
    const browsers =
      process.env.PLAYWRIGHT_BROWSERS_PATH ??
      (process.platform === "darwin" ? join(homedir(), "Library/Caches/ms-playwright") : join(homedir(), ".cache/ms-playwright"));
    return sha(
      process.version,
      process.platform,
      process.arch,
      execFileSync("bun", ["--version"]).toString().trim(),
      await onPath("npm"),
      await readFile(join(homedir(), ".npmrc")).then(sha, () => "none"),
      await names(join(root, "node_modules/.bun")),
      ...(await installed()),
      await names(browsers),
      ...Object.keys(process.env)
        .filter((name) => KEYED_ENV.test(name))
        .sort()
        .map((name) => `${name}=${process.env[name]}`),
      digest(await hashFiles(["package.json", "bun.lock", "bunfig.toml", ".npmrc", "patches", "scripts", ".gitignore"]))
    );
  }

  /* Each task's key, from its own files and the keys of the tasks it reads from. A task with `specs`
     keys each spec file, with its screenshot baselines, apart from that key. */
  async function keys(graph) {
    const base = await environment();
    const own = await Promise.all(graph.map((task) => hashFiles(task.inputs ?? [], task.generated)));
    const result = new Map();
    graph.forEach((task, index) => {
      const specOf = ([file]) =>
        task.specs && file.startsWith(`${task.specs}/`) ? file.match(/^(.*?\.spec\.ts)(?:-snapshots\/|$)/)?.[1] : undefined;
      const command = JSON.stringify(task.command ?? [task.cwd, task.script]);
      const deps = (task.deps ?? []).map((dep) => result.get(dep).key);
      const key = sha(base, task.name, command, digest(own[index].filter((entry) => !specOf(entry))), ...deps);
      if (!task.specs) return result.set(task.name, { key });
      const groups = {};
      for (const entry of own[index]) if (specOf(entry)) (groups[specOf(entry)] ??= []).push(entry);
      const specs = {};
      for (const [spec, entries] of Object.entries(groups)) {
        if (entries.some(([file, hash]) => file === spec && hash !== "missing")) specs[spec] = sha(key, digest(entries));
      }
      result.set(task.name, { key, specs });
    });
    return result;
  }

  // Path, size and modification time of every file a build left.
  async function snapshot(task) {
    const parts = [];
    for (const dir of task.outputs ?? []) {
      const info = await stat(join(root, dir)).catch(() => null);
      if (!info) return null;
      if (info.isFile()) {
        parts.push(dir, `${info.size}:${info.mtimeMs}`);
        continue;
      }
      const entries = await readdir(join(root, dir), { recursive: true, withFileTypes: true });
      const files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => relative(root, join(entry.parentPath, entry.name)))
        .filter((file) => !VOLATILE_OUTPUT.has(relative(dir, file).split("/")[0]))
        .sort();
      const stats = await Promise.all(files.map((file) => stat(join(root, file))));
      parts.push(...files.flatMap((file, index) => [file, `${stats[index].size}:${stats[index].mtimeMs}`]));
    }
    return sha(...parts);
  }

  const dir = join(root, "node_modules/.cache/verify");
  const file = join(dir, "passed.json");
  return {
    dir,
    keys,
    snapshot,
    load: () => readFile(file, "utf8").then(JSON.parse, () => ({})),
    save: async (passed) => {
      await mkdir(dir, { recursive: true });
      await writeFile(file, `${JSON.stringify(passed, null, 2)}\n`);
    },
  };
}

export async function main(graph, argv, { root = fileURLToPath(new URL("..", import.meta.url)), ci = Boolean(process.env.CI) } = {}) {
  const options = parseArgs(argv);
  if (options.list) {
    for (const task of graph) console.log(task.deps ? `${task.name}  ← ${task.deps.join(", ")}` : task.name);
    return 0;
  }
  const selected = select(graph, options.targets, options.skip);
  const cache = createCache(root);
  // CI checks out a fresh tree and records nothing; `--force` reruns every task but still records.
  const keys = ci ? null : await cache.keys(selected);
  const recorded = ci || options.force ? {} : await cache.load();
  const status = new Map();
  // The spec files a task with `specs` still has to run, when the rest of its inputs are unchanged.
  const pending = new Map();

  for (const task of selected) {
    const entry = recorded[task.name];
    const { key, specs } = keys?.get(task.name) ?? {};
    if (!entry || entry.key !== key || (task.outputs && entry.output !== (await cache.snapshot(task)))) continue;
    const changed = specs ? Object.keys(specs).filter((spec) => entry.specs?.[spec] !== specs[spec]) : [];
    if (changed.length) pending.set(task.name, changed);
    else status.set(task.name, "cached");
  }

  // The browser tasks that run split the workers by weight, largest remainder first.
  const browserTasks = selected.filter((task) => task.workers && !status.has(task.name));
  const weight = browserTasks.reduce((sum, task) => sum + task.workers, 0);
  const total = Math.max(browserTasks.length, Math.floor(availableParallelism() * BROWSER_SHARE));
  const shares = browserTasks.map((task) => ({ task, exact: (total * task.workers) / weight }));
  const workers = new Map(shares.map(({ task, exact }) => [task.name, Math.max(1, Math.floor(exact))]));
  let left = total - [...workers.values()].reduce((sum, count) => sum + count, 0);
  for (const { task } of shares.toSorted((a, b) => (b.exact % 1) - (a.exact % 1))) {
    if (left-- > 0) workers.set(task.name, workers.get(task.name) + 1);
  }

  const logs = join(cache.dir, "logs");
  await mkdir(logs, { recursive: true });
  const running = new Map();
  let stopping = false;
  let interrupted = false;
  const started = performance.now();

  const signal = (child, name) => {
    try {
      process.kill(-child.pid, name);
    } catch {
      // The group already exited.
    }
  };
  const stopAll = () => {
    if (stopping) return;
    stopping = true;
    for (const child of running.values()) signal(child, "SIGINT");
    setTimeout(() => {
      for (const child of running.values()) signal(child, "SIGKILL");
    }, STOP_GRACE_MS).unref();
  };
  const onSignal = () => {
    interrupted = true;
    stopAll();
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  const report = (task, text, outcome, begin) => {
    const output = text && !text.endsWith("\n") ? `${text}\n` : text;
    const only = pending.has(task.name) ? `, ${pending.get(task.name).length} changed spec file(s)` : "";
    const line = `${outcome === "passed" ? "✓" : "✗"} ${task.name} (${seconds(performance.now() - begin)} from +${seconds(begin - started)}${only})`;
    if (ci) console.log(outcome === "passed" ? `::group::${line}\n${output}::endgroup::` : `${line}\n${output}`);
    else console.log(outcome === "passed" ? line : `${line}\n${output}`);
  };

  async function execute(task) {
    const [command, ...args] = task.command ?? ["bun", "run", task.script];
    const env = { ...process.env };
    if (process.stdout.isTTY && !env.NO_COLOR) env.FORCE_COLOR ??= "1";
    if (task.workers) {
      args.push(`--workers=${workers.get(task.name)}`, ...(options.shard ? [options.shard] : []));
      env.BROWSER_TEST_PORT = String(await freePort());
    }
    args.push(...(pending.get(task.name) ?? []).map((spec) => relative(task.cwd, spec)));
    // A stop can arrive while the port is found.
    if (stopping) return status.set(task.name, "stopped");
    const begin = performance.now();
    const child = spawn(command, args, { cwd: join(root, task.cwd), env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    running.set(task.name, child);
    const chunks = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => chunks.push(chunk));
    const code = await new Promise((resolve) => {
      child.once("error", (error) => {
        chunks.push(Buffer.from(`${error.message}\n`));
        resolve(1);
      });
      child.once("close", (exitCode) => resolve(exitCode ?? 1));
    });
    running.delete(task.name);
    const output = Buffer.concat(chunks).toString();
    await writeFile(join(logs, `${task.name.replace(":", "-")}.log`), output);

    // A task that ends after the stop was sent may have been cut short, whatever its status.
    if (stopping) {
      status.set(task.name, "stopped");
    } else if (code === 0) {
      status.set(task.name, "passed");
      report(task, output, "passed", begin);
    } else {
      status.set(task.name, "failed");
      report(task, output, "failed", begin);
      if (!options.keepGoing) stopAll();
    }
  }

  // Start every task whose dependencies passed; skip those whose dependencies did not.
  await new Promise((resolve) => {
    const pump = () => {
      let changed = true;
      while (changed) {
        changed = false;
        for (const task of selected) {
          if (status.has(task.name)) continue;
          const deps = (task.deps ?? []).map((dep) => status.get(dep));
          if (stopping || deps.some((state) => state && !["passed", "cached", "running"].includes(state))) {
            status.set(task.name, stopping ? "stopped" : "skipped");
            changed = true;
          } else if (deps.every((state) => state === "passed" || state === "cached")) {
            status.set(task.name, "running");
            execute(task)
              .catch((error) => {
                running.delete(task.name);
                status.set(task.name, "failed");
                console.log(`✗ ${task.name}\n${error.stack}`);
                if (!options.keepGoing) stopAll();
              })
              .then(pump);
          }
        }
      }
      if (running.size === 0 && [...status.values()].every((state) => state !== "running")) resolve();
    };
    pump();
  });
  process.off("SIGINT", onSignal);
  process.off("SIGTERM", onSignal);

  /* Record a pass only when the task's inputs are what they were when the run started, so a file
     edited during the run is checked again next time. A task that ran and did not pass loses any
     earlier pass, and a shard of a browser suite records nothing: it ran only part of the suite. */
  if (keys) {
    const after = await cache.keys(selected);
    const record = await cache.load();
    for (const task of selected) {
      const state = status.get(task.name);
      const { key, specs } = keys.get(task.name);
      if (state === "failed" || state === "stopped") delete record[task.name];
      if (state !== "passed" || (options.shard && task.workers)) continue;
      if (JSON.stringify(after.get(task.name)) !== JSON.stringify(keys.get(task.name))) continue;
      record[task.name] = { key, ...(specs && { specs }), ...(task.outputs && { output: await cache.snapshot(task) }) };
    }
    await cache.save(record);
  }

  const names = (state) => selected.filter((task) => status.get(task.name) === state).map((task) => task.name);
  const ok = selected.every((task) => ["passed", "cached"].includes(status.get(task.name)));
  const lines = [`\nverify ${ok && !interrupted ? "passed" : "failed"} in ${seconds(performance.now() - started)}`];
  for (const state of ["cached", "failed", "skipped", "stopped"]) {
    if (names(state).length) lines.push(`${state}: ${names(state).join(", ")}`);
  }
  lines.push(`logs: ${relative(process.cwd(), logs) || "."}`);
  console.log(lines.join("\n"));
  return interrupted ? 130 : ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(tasks, process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    return 1;
  });
}
