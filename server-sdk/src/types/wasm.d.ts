// Type declarations for WASM modules that will be available at runtime in the node directory
declare module './mainnet' {
  export * from '../wasm/node/mainnet';
}

declare module './testnet' {
  export * from '../wasm/node/testnet';
}

// Global module declarations for when these modules are imported from the root
declare module './mainnet' {
  export * from './wasm/node/mainnet';
}

declare module './testnet' {
  export * from './wasm/node/testnet';
}