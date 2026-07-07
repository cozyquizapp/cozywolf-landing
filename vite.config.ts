import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
// 2026-07-07 (Home-Cutover): Vite-Entry ist index.html = die React-Multipage-App
// (alle Routen inkl. Startseite). Die alte statische Home + support.js sind
// entfernt. Vercel serviert dist/index.html direkt auf `/`; Unterrouten fallen
// per Rewrite auf /index.html zurueck (SPA), siehe vercel.json.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
})
