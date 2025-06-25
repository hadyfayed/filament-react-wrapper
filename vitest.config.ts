import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        'vite.config.js',
        'vitest.config.ts'
      ]
    },
    globals: true,
    clearMocks: true,
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './resources/js'),
      '@tests': resolve(__dirname, './tests')
    }
  }
});