import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }), terser()],
    external: ['axios', '@scure/bip39', 'viem', 'crypto', 'fs', 'path', 'worker_threads'],
  },
  {
    input: 'src/node/sync.worker.ts',
    output: {
      file: 'dist/sync.worker.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json', declaration: false }), terser()],
    external: ['fs', 'path', 'worker_threads'],
  },
];
