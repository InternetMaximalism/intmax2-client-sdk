import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

// Custom plugin to fix WASM import paths in the bundled output
function fixWasmPaths() {
  return {
    name: 'fix-wasm-paths',
    generateBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          // Fix various WASM path patterns to be ./mainnet or ./testnet
          chunk.code = chunk.code.replace(
            /require\("\.\/node\/(mainnet|testnet)"\)/g,
            'require("./$1")'
          );
          chunk.code = chunk.code.replace(
            /require\("\.\.\/wasm\/node\/(mainnet|testnet)"\)/g,
            'require("./$1")'
          );
          chunk.code = chunk.code.replace(
            /require\("\.\/wasm\/node\/(mainnet|testnet)"\)/g,
            'require("./$1")'
          );
        }
      }
    }
  };
}

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      resolve({
        // Don't resolve WASM modules - keep them external  
        preferBuiltins: false
      }), 
      commonjs(), 
      json(),
      typescript({ tsconfig: './tsconfig.json', compilerOptions: { skipLibCheck: true } }), 
      fixWasmPaths(), 
      terser()
    ],
    external: (id) => {
      // Mark WASM modules as external - be specific to avoid catching viem chains
      if (id === './mainnet' || id === './testnet' || 
          id === '../wasm/node/mainnet' || id === '../wasm/node/testnet' ||
          id === '../../wasm/node/mainnet' || id === '../../wasm/node/testnet') {
        return true;
      }
      // Mark other deps as external
      return ['axios', '@scure/bip39', 'viem', 'crypto', 'fs', 'path', 'worker_threads'].includes(id);
    },
  },
  {
    input: 'src/node/sync.worker.ts',
    output: {
      file: 'dist/sync.worker.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [resolve(), commonjs(), json(), typescript({ tsconfig: './tsconfig.json', declaration: false }), terser()],
    external: ['fs', 'path', 'worker_threads', './mainnet', './testnet'],
  },
];
