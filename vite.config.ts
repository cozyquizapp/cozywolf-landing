import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
// 2026-06-28: Vite-Entry ist app.html (React-App fuer /impressum + /datenschutz).
// Die Startseite ist die statische public/index.html (neue „Erobere das Feld"-Landing),
// die Vite unveraendert nach dist/index.html durchreicht.
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'app.html'),
    },
  },
})
