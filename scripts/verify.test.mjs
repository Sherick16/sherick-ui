import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

const runner = new URL("./verify.mjs", import.meta.url).href;
const roots = [];
after(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

function repository() {
  const root = mkdtempSync(join(tmpdir(), "verify-test-"));
  roots.push(root);
  execFileSync("git", ["init", "-q"], { cwd: root });
  return root;
}

// Runs the CLI entry point on `graph` in its own process, so the exit status is the real one.
function verify(root, graph, argv = [], { ci = true, env = {} } = {}) {
  const script = `import { main } from ${JSON.stringify(runner)};
process.exitCode = await main(${JSON.stringify(graph)}, ${JSON.stringify(argv)}, { root: ${JSON.stringify(root)}, ci: ${ci} });`;
  const began = Date.now();
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return { ...result, elapsed: Date.now() - began };
}

const node = (source) => ["node", "-e", source];
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

test("a failure exits non-zero, stops running tasks with their children and skips its dependents", () => {
  const root = repository();
  const { status, stdout, elapsed } = verify(root, [
    {
      name: "slow",
      cwd: ".",
      command: node(`require("child_process").spawn(process.execPath, ["-e", "require('fs').writeFileSync('grandchild', String(process.pid)); setTimeout(() => {}, 60000)"]); setTimeout(() => {}, 60000)`),
    },
    { name: "fail", cwd: ".", command: node(`setInterval(() => require("fs").existsSync("grandchild") && process.exit(3), 20)`) },
    { name: "after", cwd: ".", deps: ["fail"], command: node(`require("fs").writeFileSync("after", "")`) },
  ]);

  assert.equal(status, 1, stdout);
  assert.match(stdout, /✗ fail/);
  assert.match(stdout, /failed: fail/);
  assert.ok(elapsed < 10_000, `the run took ${elapsed}ms`);
  assert.equal(existsSync(join(root, "after")), false);
  assert.equal(alive(Number(readFileSync(join(root, "grandchild"), "utf8"))), false);
});

test("--keep-going finishes independent tasks and still exits non-zero", () => {
  const root = repository();
  const { status, stdout } = verify(
    root,
    [
      { name: "fail", cwd: ".", command: node("process.exit(1)") },
      { name: "after", cwd: ".", deps: ["fail"], command: node(`require("fs").writeFileSync("after", "")`) },
      { name: "other", cwd: ".", command: node(`setTimeout(() => require("fs").writeFileSync("other", ""), 300)`) },
    ],
    ["--keep-going"]
  );

  assert.equal(status, 1, stdout);
  assert.equal(existsSync(join(root, "other")), true);
  assert.equal(existsSync(join(root, "after")), false);
});

test("a task starts after the tasks it reads from, and a passing run exits zero", () => {
  const root = repository();
  const { status, stdout } = verify(root, [
    { name: "first", cwd: ".", command: node(`setTimeout(() => require("fs").writeFileSync("first", ""), 300)`) },
    { name: "second", cwd: ".", deps: ["first"], command: node(`require("fs").readFileSync("first")`) },
  ]);

  assert.equal(status, 0, stdout);
  assert.match(stdout, /verify passed/);
});

test("--skip leaves a task out unless a selected task reads from it", () => {
  const root = repository();
  const write = (file) => node(`require("fs").writeFileSync(${JSON.stringify(file)}, "")`);
  const graph = [
    { name: "build", cwd: ".", command: write("build") },
    { name: "check", cwd: ".", deps: ["build"], command: write("check") },
    { name: "browser", cwd: ".", deps: ["build"], command: write("browser") },
  ];

  assert.equal(verify(root, graph, ["--skip=build,browser"]).status, 0);
  assert.deepEqual(["build", "check", "browser"].map((file) => existsSync(join(root, file))), [true, true, false]);
});

test("an unknown task exits non-zero", () => {
  const { status, stderr } = verify(repository(), [{ name: "only", cwd: ".", command: node("") }], ["missing"]);

  assert.equal(status, 1);
  assert.match(stderr, /Unknown task missing/);
});

test("outside CI a passed task reruns only when its inputs or its build output change", () => {
  const root = repository();
  writeFileSync(join(root, "input"), "one");
  const graph = [
    {
      name: "build",
      cwd: ".",
      inputs: ["input"],
      outputs: ["out"],
      command: node(`const fs = require("fs"); fs.appendFileSync("runs", "build\\n"); fs.mkdirSync("out", { recursive: true }); fs.writeFileSync("out/file", fs.readFileSync("input"))`),
    },
    { name: "check", cwd: ".", deps: ["build"], command: node(`require("fs").appendFileSync("runs", "check\\n")`) },
  ];
  const runs = () => readFileSync(join(root, "runs"), "utf8").trim().split("\n");
  const run = (argv) => assert.equal(verify(root, graph, argv, { ci: false }).status, 0);

  run();
  run();
  assert.deepEqual(runs(), ["build", "check"]);

  writeFileSync(join(root, "input"), "two");
  run();
  assert.deepEqual(runs(), ["build", "check", "build", "check"]);

  // Rebuilding a deleted output reproduces what its dependents already checked.
  rmSync(join(root, "out"), { recursive: true });
  run();
  assert.deepEqual(runs().slice(4), ["build"]);

  run(["--force"]);
  assert.deepEqual(runs().slice(5), ["build", "check"]);
});

test("a task with specs reruns only the spec files that changed, unless a shared file changed", () => {
  const root = repository();
  mkdirSync(join(root, "tests/a.spec.ts-snapshots"), { recursive: true });
  for (const file of ["tests/a.spec.ts", "tests/a.spec.ts-snapshots/shot.png", "tests/b.spec.ts", "tests/fixtures.ts"]) {
    writeFileSync(join(root, file), "one");
  }
  const graph = [
    {
      name: "browser",
      cwd: "tests",
      inputs: ["tests"],
      specs: "tests",
      command: node(`require("fs").appendFileSync("../runs", JSON.stringify(process.argv.slice(1)) + "\\n")`),
    },
  ];
  const runs = () => readFileSync(join(root, "runs"), "utf8").trim().split("\n").map((line) => JSON.parse(line));
  const run = () => assert.equal(verify(root, graph, [], { ci: false }).status, 0);

  run();
  run();
  assert.deepEqual(runs(), [[]]);

  writeFileSync(join(root, "tests/a.spec.ts-snapshots/shot.png"), "two");
  run();
  writeFileSync(join(root, "tests/b.spec.ts"), "two");
  run();
  assert.deepEqual(runs().slice(1), [["a.spec.ts"], ["b.spec.ts"]]);

  writeFileSync(join(root, "tests/fixtures.ts"), "two");
  run();
  assert.deepEqual(runs().slice(3), [[]]);
});

test("a keyed environment variable, a changed output file or an ignored generated file reruns a task, and a shell variable does not", () => {
  const root = repository();
  writeFileSync(join(root, ".gitignore"), "gen\n");
  mkdirSync(join(root, "gen"));
  writeFileSync(join(root, "gen/types.ts"), "one");
  const graph = [
    {
      name: "build",
      cwd: ".",
      generated: ["gen"],
      outputs: ["out.txt"],
      command: node(`const fs = require("fs"); fs.appendFileSync("runs", "build\\n"); fs.writeFileSync("out.txt", "built")`),
    },
  ];
  const runs = () => readFileSync(join(root, "runs"), "utf8").trim().split("\n").length;
  const run = (env) => assert.equal(verify(root, graph, [], { ci: false, env }).status, 0);

  run({ SHELL_ONLY: "one" });
  run({ SHELL_ONLY: "two" });
  assert.equal(runs(), 1);

  run({ VISUAL_REVIEW: "1" });
  assert.equal(runs(), 2);

  writeFileSync(join(root, "out.txt"), "edited");
  run({ VISUAL_REVIEW: "1" });
  assert.equal(runs(), 3);

  writeFileSync(join(root, "gen/types.ts"), "two");
  run({ VISUAL_REVIEW: "1" });
  assert.equal(runs(), 4);
});

test("a shard of a browser suite records nothing", () => {
  const root = repository();
  const graph = [
    {
      name: "browser",
      cwd: ".",
      workers: 1,
      // `--` keeps the browser options the runner appends away from node's own.
      command: [...node(`require("fs").appendFileSync("runs", process.argv.filter((arg) => arg.startsWith("--shard")) + "\\n")`), "--"],
    },
  ];
  const runs = () => readFileSync(join(root, "runs"), "utf8").split("\n").slice(0, -1);
  const run = (argv) => assert.equal(verify(root, graph, argv, { ci: false }).status, 0);

  run(["--shard=1/2"]);
  run(["--shard=1/2"]);
  run([]);
  run([]);
  assert.deepEqual(runs(), ["--shard=1/2", "--shard=1/2", ""]);
});
