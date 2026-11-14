import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run build` produces ONE file: dist/bridge-onboarding.js (React and CSS included),
// so a host page needs just a <script> tag.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Library builds do not replace this automatically; React needs it.
  define: command === 'build' ? { 'process.env.NODE_ENV': JSON.stringify('production') } : {},
  build: {
    lib: {
      entry: 'src/main.jsx',
      name: 'DigitalBridgeOnboarding',
      formats: ['iife'],
      fileName: () => 'bridge-onboarding.js',
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
  test: { environment: 'node' },
}));
