declare module '*.wasm' {
  const wasm: ArrayBuffer;
  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
  const content: string;
  export default wasm;
}
