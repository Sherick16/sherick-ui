import { readFileSync } from "node:fs";
import { normalize } from "node:path";

import { nodeResolve } from "@rollup/plugin-node-resolve";
import { dts } from "rollup-plugin-dts";
import preserveDirectives from "rollup-preserve-directives";
import ts from "typescript";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const extensions = [".js", ".jsx", ".ts", ".tsx"];
const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];
const external = (id) =>
  externalPackages.some((dependency) => id === dependency || id.startsWith(`${dependency}/`));

/* The CommonJS build deliberately omits `content`: its dependency stack (react-markdown,
   remark/rehype) is ESM-only, so a `require("sherick-ui/content")` entry would only work on
   runtimes that enable `require(esm)`. The subpath is ESM-only and the package says so in
   its `exports` map instead of shipping an artifact that breaks on older Node. */
const esmEntries = { index: "src/index.ts", content: "src/content.ts", dev: "src/dev.ts" };
const cjsEntries = { index: "src/index.ts", dev: "src/dev.ts" };

/* One compiler program, shared by the ESM and CommonJS bundles and created with `noCheck`, emits
   the same modules @rollup/plugin-typescript did without type-checking the package twice per build
   (~8s); `tsc --noEmit` is the type gate. The program still resolves modules, which is what lets
   the compiler drop an import only a JSX transform would have needed. `noEmitHelpers` and
   `importHelpers` are what that plugin forced, so a module that needs a helper fails the build. */
const parsed = ts.getParsedCommandLineOfConfigFile(
  "./tsconfig.json",
  {
    noEmit: false,
    noCheck: true,
    declaration: false,
    sourceMap: true,
    inlineSources: true,
    allowJs: false,
    noEmitHelpers: true,
    importHelpers: true,
  },
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic(diagnostic) {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    },
  }
);
let program;
const moduleResolution = ts.createModuleResolutionCache(process.cwd(), (fileName) => fileName, parsed.options);

const transpile = () => ({
  name: "typescript-emit",
  // Resolves the `@/` source alias and extensionless source imports the way the compiler does.
  resolveId(importee, importer) {
    if (!importer) return null;
    const { resolvedModule } = ts.resolveModuleName(importee, importer, parsed.options, ts.sys, moduleResolution);
    if (!resolvedModule || resolvedModule.isExternalLibraryImport || /\.d\.[cm]?ts$/.test(resolvedModule.resolvedFileName)) {
      return null;
    }
    return normalize(resolvedModule.resolvedFileName);
  },
  // `rollup -w` re-reads every module from disk after an edit.
  watchChange() {
    program = undefined;
  },
  transform(_code, id) {
    if (!/\.tsx?$/.test(id)) return null;
    program ??= ts.createProgram(parsed.fileNames, parsed.options);
    const source = program.getSourceFile(id);
    if (!source) throw new Error(`${id} is outside tsconfig.json`);
    const output = {};
    program.emit(source, (fileName, text) => {
      output[fileName.endsWith(".map") ? "map" : "code"] = text;
    });
    if (/\bfrom\s+["']tslib["']/.test(output.code)) throw new Error(`${id} needs a tslib helper; the package ships none`);
    return output;
  },
});

const plugins = () => [nodeResolve({ extensions, preferBuiltins: true }), transpile(), preserveDirectives()];

const bundle = (input, dir, format, entryFileNames) => ({
  input,
  output: [
    {
      dir,
      format,
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
      entryFileNames,
      ...(format === "cjs" ? { exports: "named" } : {}),
    },
  ],
  plugins: plugins(),
  external,
});

const declarations = (input, file, commonjs = false) => ({
  input,
  output: [
    { file, format: "esm" },
    ...(commonjs ? [{ file: file.replace(/\.d\.ts$/, ".d.cts"), format: "esm" }] : []),
  ],
  plugins: [dts({ tsconfig: "./tsconfig.build.dts.json" })],
});

const modules = () => [
  bundle(esmEntries, "dist/esm", "esm", "[name].js"),
  bundle(cjsEntries, "dist/cjs", "cjs", "[name].cjs"),
];
const types = () => [
  declarations("src/index.ts", "dist/types/index.d.ts", true),
  declarations("src/content.ts", "dist/types/content.d.ts"),
  declarations("src/dev.ts", "dist/types/dev.d.ts", true),
];

// `bun run build` runs the module and declaration builds as two processes at once.
export default ({ configTarget }) =>
  configTarget === "modules" ? modules() : configTarget === "types" ? types() : [...modules(), ...types()];
