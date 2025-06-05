/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      'voice-module': path.resolve(__dirname, 'voice-module'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'Logo.svg'],
      manifest: {
        name: 'Jarvis Chat',
        short_name: 'Jarvis',
        description: 'A simple PWA chat application',
        theme_color: '#5533ff', // purple accent color
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom', // Use jsdom for DOM-related testing
    // setupFiles: './src/setupTests.ts', // Optional: for global test setup
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
