const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const { VitePWA } = require('vite-plugin-pwa');

// https://vitejs.dev/config/
module.exports = defineConfig({
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
}); 