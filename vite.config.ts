import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'path'

const target = process.env.VITE_API_PROXY_TARGET || 'http://localhost:4000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
  server: {
    proxy: {
      '/api': { target, changeOrigin: false },
      '/ws': { target, ws: true, changeOrigin: false },
    },
  },
})
