import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Keep the CRA output path so the Dockerfile does not change.
  build: { outDir: 'build' },
  server: {
    port: 3000,
    proxy: { '/api': 'http://localhost:8080' },
  },
  // The components still read process.env.REACT_APP_BACKEND_URL.
  // Replace it at build time so the Docker build argument keeps working.
  define: {
    'process.env.REACT_APP_BACKEND_URL': JSON.stringify(process.env.REACT_APP_BACKEND_URL || ''),
  },
  // Vitest reads this file, so the tests get the `define` block above.
  // Note that Vite applies a `process.env.*` define differently in Node: it
  // writes the value into process.env instead of replacing the text. The
  // value is the same, but a test reads it at run time.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    css: false,
  },
})
