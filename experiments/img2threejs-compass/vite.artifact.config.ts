import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    lib: { entry: 'src/artifact-entry.ts', name: 'CompassViewer', formats: ['iife'], fileName: () => 'compass-viewer.js' },
    outDir: 'dist-artifact',
    minify: true,
  },
});
