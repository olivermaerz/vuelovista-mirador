import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { adsblolViteProxy } from './adsblolProxy.config.js'
import { adsbdbViteProxy } from './adsbdbProxy.config.js'
import { standingDataViteProxy } from './standingDataProxy.config.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
  server: {
    proxy: {
      ...adsblolViteProxy,
      ...adsbdbViteProxy,
      ...standingDataViteProxy,
    },
  },
  preview: {
    proxy: {
      ...adsblolViteProxy,
      ...adsbdbViteProxy,
      ...standingDataViteProxy,
    },
  },
})
