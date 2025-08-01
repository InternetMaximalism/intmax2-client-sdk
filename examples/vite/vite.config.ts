import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // port: 3000,
    host: 'localhost',
  },
  optimizeDeps: {
    exclude: ['intmax2-client-sdk'],
  },
  build: {
    target: 'esnext',
  },
})
