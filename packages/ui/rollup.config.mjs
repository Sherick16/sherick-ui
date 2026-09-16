import { readFileSync } from "node:fs";

import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import preserveDirectives from "rollup-preserve-directives";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const extensions = [".js", ".jsx", ".ts", ".tsx"];
const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];
const external = (id) =>
  externalPackages.some((dependency) => id === dependency || id.startsWith(`${dependency}/`));
const hasModuleSideEffects = (id) =>
  id.startsWith("prismjs/components/") || id.includes("/prismjs/components/");

const jsConfig = {
  input: { index: "src/index.ts", dev: "src/dev.ts" },
  output: [
    {
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: "src",
      entryFileNames: "[name].js",
    },
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named",
      preserveModules: true,
      preserveModulesRoot: "src",
      entryFileNames: "[name].cjs",
    },
  ],
  plugins: [
    peerDepsExternal(),
    nodeResolve({ extensions, preferBuiltins: true }),
    commonjs({ exclude: "src/**" }),
    typescript({
      tsconfig: "./tsconfig.json",
      compilerOptions: {
        noEmit: false,
        declaration: false,
        sourceMap: true,
        allowJs: false,
      },
    }),
    babel({
      extensions,
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: [
        ["@babel/preset-env", { modules: false }],
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
    }),
    preserveDirectives(),
  ],
  external,
  treeshake: {
    moduleSideEffects: hasModuleSideEffects,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  onwarn(warning, warn) {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE" && /use client/.test(warning.message)) return;
    warn(warning);
  },
};

export default [
  jsConfig,
  {
    input: "src/index.ts",
    output: [{ file: "dist/types/index.d.ts", format: "esm" }],
    plugins: [dts({ tsconfig: "./tsconfig.build.dts.json" })],
  },
  {
    input: "src/dev.ts",
    output: [{ file: "dist/types/dev.d.ts", format: "esm" }],
    plugins: [dts({ tsconfig: "./tsconfig.build.dts.json" })],
  },
];
