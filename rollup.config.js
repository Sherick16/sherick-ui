import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import pkg from './package.json' assert { type: 'json' };

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
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: false,
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
        compilerOptions: { sourceMap: false },
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
