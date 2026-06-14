import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  const publicUrl = process.env.PUBLIC_URL || 'https://mines.eraplanner.com/'

  return {
    server: { port: 8086, cors: true },
    preview: { port: 8086, cors: true },
    base: isDev ? '/' : publicUrl,
    resolve: {
      alias: { '#': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    plugins: [
      !isDev &&
        federation({
          name: 'mines',
          filename: 'remoteEntry.js',
          exposes: { './App': './src/App.tsx' },
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
            rxjs: { singleton: true },
          },
        }),
      react(),
    ],
  }
})
