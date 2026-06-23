import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '__tests__/',
        '*.config.ts',
        '*.config.js',
        'prisma/',
        'scripts/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/src': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app')
    }
  }
})
