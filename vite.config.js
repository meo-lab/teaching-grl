import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  server: {
    allowedHosts: [
      'marc-tower.tail3f5ed7.ts.net',
    ],
  },
})
