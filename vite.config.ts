import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            '/auth': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/organizations': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/users': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/admin': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/email_types': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/email_templates': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            }
        }
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
    },
})
