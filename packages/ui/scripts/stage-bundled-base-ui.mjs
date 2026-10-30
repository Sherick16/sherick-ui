import assert from "node:assert/strict";
import { cp, lstat, mkdir, readFile, readdir, readlink, realpath, rename, rm, symlink } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const paths = (root) => ({
  target: join(root, "node_modules", "@base-ui", "react"),
  // Keep the saved symlink outside the publishable package: npm's pack walker crashes when it sees
  // Bun's absolute-store symlink beside a bundled dependency, even when that sibling is not bundled.
  backup: join(root, "..", "..", "node_modules", ".sherick-base-ui-react-link"),
});
const patchedModules = [
  "floating-ui-react/utils/markOthers.js",
  "floating-ui-react/utils/markOthers.mjs",
];

async function pathStat(path) {
  try {
    return await lstat(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function removeBunMetadata(root) {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.name.startsWith(".bun-tag-")) {
      await rm(path, { force: true });
    } else if (entry.isDirectory()) {
      await removeBunMetadata(path);
    }
  }
}

async function assertPatched(packagePath) {
  const manifest = JSON.parse(await readFile(join(packagePath, "package.json"), "utf8"));
  assert.equal(manifest.name, "@base-ui/react");
  assert.equal(manifest.version, "1.8.0", "the bundled Base UI patch is version-specific");

  for (const modulePath of patchedModules) {
    const source = await readFile(join(packagePath, modulePath), "utf8");
    for (const marker of [
      "focusRestoreMap",
      "MutationObserver",
      "isTabbable",
      "focusable",
      "attributeOldValue",
      "takeRecords",
    ]) {
      assert.ok(
        source.includes(marker),
        `${modulePath} must contain the editable Combobox isolation patch marker ${marker}`,
      );
    }
  }
}

function nearestNodeModules(packagePath) {
  let cursor = packagePath;
  while (dirname(cursor) !== cursor) {
    if (basename(cursor) === "node_modules") return cursor;
    cursor = dirname(cursor);
  }
  throw new Error(`Could not locate node_modules above ${packagePath}`);
}

async function copyDependencyClosure(rootSource, destinationPackage) {
  const destinationNodeModules = join(destinationPackage, "node_modules");
  const copied = new Map();

  async function copyDependency(name, importerPath) {
    const source = await realpath(join(nearestNodeModules(importerPath), ...name.split("/")));
    const previous = copied.get(name);
    assert.ok(!previous || previous === source, `${name} resolved to two versions in Base UI's runtime closure`);
    if (previous) return;
    copied.set(name, source);

    const destination = join(destinationNodeModules, ...name.split("/"));
    await mkdir(dirname(destination), { recursive: true });
    await cp(source, destination, { recursive: true, dereference: true });

    const manifest = JSON.parse(await readFile(join(source, "package.json"), "utf8"));
    for (const dependency of Object.keys(manifest.dependencies ?? {})) {
      await copyDependency(dependency, source);
    }
  }

  const rootManifest = JSON.parse(await readFile(join(rootSource, "package.json"), "utf8"));
  for (const dependency of Object.keys(rootManifest.dependencies ?? {})) {
    await copyDependency(dependency, rootSource);
  }
}

export async function stageBundledBaseUi(root = packageRoot) {
  const { target, backup } = paths(root);
  const backupStat = await pathStat(backup);
  if (backupStat) {
    assert.ok(backupStat.isSymbolicLink(), `${backup} must be the saved Bun dependency link`);
    await removeBunMetadata(target);
    await assertPatched(target);
    return;
  }

  const targetStat = await pathStat(target);
  assert.ok(targetStat?.isSymbolicLink(), `${target} must be Bun's installed dependency link`);
  const source = await realpath(target);
  await assertPatched(source);

  await rename(target, backup);
  try {
    await copyPatchedBaseUi(source, target);
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    await rename(backup, target);
    throw error;
  }
}

async function copyPatchedBaseUi(source, destination) {
  await cp(source, destination, { recursive: true, dereference: true });
  await copyDependencyClosure(source, destination);
  await removeBunMetadata(destination);
  await assertPatched(destination);
}

/* Copies the package to `packages/ui` under `directory`, links Base UI there as Bun links it in
   the workspace and stages it as `prepack` does. `npm pack` in the copy then builds the release
   tarball, and the workspace link stays in place for the builds and tests that read it at the same
   time. Returns the copy's root. */
export async function stagePackageCopy(directory) {
  const copy = join(directory, "packages", "ui");
  const nodeModules = join(packageRoot, "node_modules");
  await cp(packageRoot, copy, { recursive: true, filter: (path) => path !== nodeModules });
  const { target, backup } = paths(packageRoot);
  const link = paths(copy).target;
  await mkdir(dirname(link), { recursive: true });
  await mkdir(dirname(paths(copy).backup), { recursive: true });
  // A saved link keeps Bun's relative target, which resolves from the place the link was moved from.
  const store = (await pathStat(backup)) ? resolve(dirname(target), await readlink(backup)) : await realpath(target);
  await symlink(store, link);
  await stageBundledBaseUi(copy);
  return copy;
}

export async function restoreBundledBaseUi(root = packageRoot) {
  const { target, backup } = paths(root);
  if (!(await pathStat(backup))) return;
  await rm(target, { recursive: true, force: true });
  await rename(backup, target);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const action = process.argv[2];
  if (action === "stage") await stageBundledBaseUi();
  else if (action === "restore") await restoreBundledBaseUi();
  else throw new Error(`Expected "stage" or "restore", received ${JSON.stringify(action)}`);
}
