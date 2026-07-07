import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'axios': ['axios'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      // B 站 API 代理
      '/bili-api': {
        target: 'https://api.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-api/, ''),
      },
      '/bili-app': {
        target: 'https://app.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-app/, ''),
      },
      '/bili-live': {
        target: 'https://api.live.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-live/, ''),
      },
      '/bili-passport': {
        target: 'https://passport.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-passport/, ''),
      },
      '/bili-message': {
        target: 'https://message.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-message/, ''),
      },
      '/bili-dynamic': {
        target: 'https://t.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-dynamic/, ''),
      },
      '/bili-space': {
        target: 'https://space.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-space/, ''),
      },
      '/bili-search': {
        target: 'https://s.search.bilibili.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bili-search/, ''),
      },
    },
  },
})
