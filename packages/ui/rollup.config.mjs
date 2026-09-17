import { readFileSync } from "node:fs";

import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import preserveDirectives from "rollup-preserve-directives";

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

const plugins = () => [
  nodeResolve({ extensions, preferBuiltins: true }),
  typescript({
    tsconfig: "./tsconfig.json",
    compilerOptions: {
      noEmit: false,
      declaration: false,
      sourceMap: true,
      allowJs: false,
    },
  }),
  preserveDirectives(),
];

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

const declarations = (input, file) => ({
  input,
  output: [{ file, format: "esm" }],
  plugins: [dts({ tsconfig: "./tsconfig.build.dts.json" })],
});

export default [
  bundle(esmEntries, "dist/esm", "esm", "[name].js"),
  bundle(cjsEntries, "dist/cjs", "cjs", "[name].cjs"),
  declarations("src/index.ts", "dist/types/index.d.ts"),
  declarations("src/content.ts", "dist/types/content.d.ts"),
  declarations("src/dev.ts", "dist/types/dev.d.ts"),
];
