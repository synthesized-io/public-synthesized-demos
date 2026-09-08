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
})
