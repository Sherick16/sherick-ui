import { readFileSync } from 'node:fs';

import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// Read package.json instead of `import ... with { type: 'json' }`: the import
// attribute syntax is unavailable on Node versions without import-attribute
// support, and the `assert` form was removed in Node 23.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const externalPackages = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

const external = (id) =>
  externalPackages.some((dependency) => id === dependency || id.startsWith(`${dependency}/`));

const config = [
  {
    input: 'app/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: false,
        exports: 'named',
        banner: '"use client";',
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: false,
        banner: '"use client";',
      },
    ],
    plugins: [
      peerDepsExternal(),
      nodeResolve({ extensions, preferBuiltins: true }),
      commonjs({ exclude: 'app/**' }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        exclude: ['**/*.test.tsx', '**/*.test.ts', '**/*.stories.tsx'],
        // `allowJs` comes from the shared tsconfig for Next. The library build is TS-only,
        // and @rollup/plugin-typescript redirects emit to a temp `outDir` when `allowJs`
        // is on without an `outDir`, then rejects that path as outside the bundle output.
        compilerOptions: { sourceMap: false, allowJs: false },
      }),
      babel({
        extensions,
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', { modules: false }],
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
      }),
    ],
    external,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
  },
  {
    input: 'app/index.ts',
    output: [{ file: pkg.types, format: 'esm' }],
    plugins: [dts({ tsconfig: './tsconfig.build.dts.json' })],
  },
];

export default config;
