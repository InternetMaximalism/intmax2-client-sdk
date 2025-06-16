/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  define: {
    global: 'globalThis',
  }
});
