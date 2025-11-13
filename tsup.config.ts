import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'], // Build for both CommonJS and ES modules
  dts: false, // Disable TypeScript declarations for now due to type conflicts
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'mermaid'], // Don't bundle peer dependencies
  splitting: false,
  minify: false, // Keep code readable for debugging
  treeshake: true,
  outDir: 'dist',
  // Handle CSS files
  loader: {
    '.css': 'css',
  },
  // Inject CSS imports
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";', // Mark as React client component
    };
  },
});
